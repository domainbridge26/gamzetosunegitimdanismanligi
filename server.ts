import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import pdfParse from "pdf-parse";

dotenv.config();

// Common Turkish school and exam subjects for heuristic text extraction
const TURKISH_SUBJECTS = [
  "TYT Matematik", "AYT Matematik", "Matematik", "Geometri",
  "TYT Türkçe", "Türkçe", "Paragraf", "Edebiyat", "AYT Edebiyat", "Türk Dili ve Edebiyatı",
  "TYT Fizik", "AYT Fizik", "Fizik",
  "TYT Kimya", "AYT Kimya", "Kimya",
  "TYT Biyoloji", "AYT Biyoloji", "Biyoloji",
  "TYT Tarih", "AYT Tarih", "Tarih", "T.C. İnkılap Tarihi", "İnkılap Tarihi",
  "TYT Coğrafya", "AYT Coğrafya", "Coğrafya",
  "Psikoloji", "Sosyoloji", "Mantık", "Felsefe", "Felsefe Grubu",
  "Din Kültürü ve Ahlak Bilgisi", "Din Kültürü",
  "Fen Bilimleri", "Sosyal Bilgiler", "İngilizce",
  "Branş Denemesi", "Genel Deneme", "Deneme Sınavı", "Soru Çözümü", "Haftalık Tekrar"
];

// Common Turkish test publishers and coaching resources
const KNOWN_RESOURCES = [
  "3D", "Apotemi", "Bilgi Sarmal", "Karekök", "Karakök", "Hız ve Renk", "Limit",
  "Palme", "Birey", "MEB", "Orijinal", "Acil", "Paraf", "Esen", "Çap", "Endemik",
  "Benim Hocam", "Kenan Kara", "Eyüp B.", "Mert Hoca", "Rehber Matematik",
  "Rüştü Hoca", "Dr. Biyoloji", "Görkem Şahin", "VIP Fizik", "Kafa Dengi",
  "Toprak", "Puan", "Metin", "Aydın", "Supara", "Sınav", "Hocalara Geldik", "Tonguç"
];

const DAYS_LIST = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

/**
 * Deterministic parser for Turkish study schedules from raw PDF text.
 * Strictly respects the rule: NO invented hours if not present in the PDF.
 */
function parseTurkishScheduleTextDirectly(rawText: string, studentName: string, examGroup: string) {
  const result: Record<string, any[]> = {
    "Pazartesi": [],
    "Salı": [],
    "Çarşamba": [],
    "Perşembe": [],
    "Cuma": [],
    "Cumartesi": [],
    "Pazar": []
  };

  if (!rawText || !rawText.trim()) {
    return {
      title: `${studentName} - Haftalık Ders Programı`,
      examGroup,
      targetGoal: "Haftalık Çalışma Programı",
      schedule: result
    };
  }

  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const dayPatterns: { day: string; regex: RegExp }[] = [
    { day: "Pazartesi", regex: /^(?:1\.?\s*(?:GÜN|OTURUM)[:\s]*)?pazartes[ıi]/i },
    { day: "Salı", regex: /^(?:2\.?\s*(?:GÜN|OTURUM)[:\s]*)?sal[ıi]/i },
    { day: "Çarşamba", regex: /^(?:3\.?\s*(?:GÜN|OTURUM)[:\s]*)?[çc]ar[sş]amba/i },
    { day: "Perşembe", regex: /^(?:4\.?\s*(?:GÜN|OTURUM)[:\s]*)?per[sş]embe/i },
    { day: "Cuma", regex: /^(?:5\.?\s*(?:GÜN|OTURUM)[:\s]*)?cuma\b/i },
    { day: "Cumartesi", regex: /^(?:6\.?\s*(?:GÜN|OTURUM)[:\s]*)?cumartes[ıi]/i },
    { day: "Pazar", regex: /^(?:7\.?\s*(?:GÜN|OTURUM)[:\s]*)?pazar\b/i }
  ];

  let currentDay: string | null = null;
  const dayBuckets: Record<string, string[]> = {
    "Pazartesi": [],
    "Salı": [],
    "Çarşamba": [],
    "Perşembe": [],
    "Cuma": [],
    "Cumartesi": [],
    "Pazar": []
  };

  for (const line of lines) {
    let matchedDay: string | null = null;
    for (const dp of dayPatterns) {
      if (dp.regex.test(line)) {
        matchedDay = dp.day;
        break;
      }
    }

    if (matchedDay) {
      currentDay = matchedDay;
      const remainder = line.replace(new RegExp(`^(?:\\d+\\.?\\s*(?:GÜN|OTURUM)?[\\s:]*)?${matchedDay}[:\\s-]*`, 'i'), '').trim();
      if (remainder.length > 2) {
        dayBuckets[currentDay].push(remainder);
      }
    } else if (currentDay) {
      if (!/^sayfa\s+\d+/i.test(line) && !/^\d+\s*\/\s*\d+$/.test(line)) {
        dayBuckets[currentDay].push(line);
      }
    }
  }

  // Parse items for each day
  for (const day of DAYS_LIST) {
    const rawLines = dayBuckets[day];
    const slots: any[] = [];
    let currentItem: any = null;

    for (const rawLine of rawLines) {
      const line = rawLine.trim();
      if (!line) continue;

      // 1. Time extraction (Strict: only if written in line)
      const timeMatch = line.match(/(\b[0-2]?\d[:.][0-5]\d\s*[-–—/]\s*[0-2]?\d[:.][0-5]\d\b|\b[0-2]?\d[:.][0-5]\d\b)/);
      const extractedTime = timeMatch ? timeMatch[0].replace('.', ':') : "";

      // 2. Question count extraction
      const qMatch = line.match(/(\d+)\s*(?:soru|test|tane|adet)\b/i);
      const targetQuestions = qMatch ? parseInt(qMatch[1], 10) : 0;

      // 3. Subject detection
      let detectedSubject = "";
      for (const subj of TURKISH_SUBJECTS) {
        const escaped = subj.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const subjRegex = new RegExp(`\\b${escaped}\\b`, 'i');
        if (subjRegex.test(line)) {
          detectedSubject = subj;
          break;
        }
      }

      // 4. Resource detection
      let detectedResource = "";
      for (const resName of KNOWN_RESOURCES) {
        const escaped = resName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const resRegex = new RegExp(`\\b${escaped}\\b`, 'i');
        if (resRegex.test(line)) {
          detectedResource = resName;
          break;
        }
      }

      const isBulletOrNumbered = /^(?:[-*•#>]|\d+[.)])\s*/.test(line);
      const hasDistinctSubject = Boolean(detectedSubject);
      const hasTime = Boolean(extractedTime);

      if (hasDistinctSubject || hasTime || isBulletOrNumbered || !currentItem) {
        if (currentItem) {
          slots.push(currentItem);
        }

        const cleanedTopic = line
          .replace(new RegExp(`\\b${extractedTime}\\b`, 'g'), '')
          .replace(/^(?:[-*•#>]|\d+[.)])\s*/, '')
          .trim();

        currentItem = {
          time: extractedTime,
          subject: detectedSubject || (examGroup.includes('LGS') ? 'LGS Çalışması' : 'Ders Çalışması'),
          topic: cleanedTopic || detectedSubject || 'Program Etüdü',
          resource: detectedResource,
          advice: targetQuestions > 0 ? `${targetQuestions} soru çözülecek` : "",
          targetQuestions: targetQuestions,
          status: "pending"
        };
      } else if (currentItem) {
        currentItem.topic = `${currentItem.topic} - ${line}`.trim();
        if (!currentItem.resource && detectedResource) {
          currentItem.resource = detectedResource;
        }
        if (!currentItem.targetQuestions && targetQuestions > 0) {
          currentItem.targetQuestions = targetQuestions;
        }
      }
    }

    if (currentItem) {
      slots.push(currentItem);
    }

    result[day] = slots;
  }

  return {
    title: `${studentName} - Haftalık Ders Programı`,
    examGroup,
    targetGoal: "Haftalık Çalışma ve Soru Hedefi",
    schedule: result
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // 1. Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // 2. Parse uploaded PDF schedule with Gemini AI & deterministic PDF-text fallback
  app.post("/api/parse-schedule-pdf", async (req, res) => {
    const { pdfBase64, studentName = "Öğrenci", examGroup = "YKS", notes = "" } = req.body;

    if (!pdfBase64) {
      return res.status(400).json({ error: "pdfBase64 is required" });
    }

    const cleanBase64 = pdfBase64.replace(/^data:[^;]+;base64,/, "").trim();
    let extractedText = "";

    // 1. Extract raw text from PDF buffer
    try {
      const pdfBuffer = Buffer.from(cleanBase64, "base64");
      const parsedPdf = await pdfParse(pdfBuffer);
      extractedText = parsedPdf.text || "";
    } catch (pdfErr) {
      console.warn("Direct PDF text extraction warning:", pdfErr);
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Helper to count parsed slots
    const countSlots = (sch: Record<string, any[]>) => {
      if (!sch) return 0;
      return Object.values(sch).reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0);
    };

    // If Gemini API Key is available, try AI extraction first
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Sen Gamze Tosun Eğitim Danışmanlığı sistemi için çalışan uzman ve son derece titiz bir veri aktarım uzmanısın.
GÖREVİN: Ekteki PDF haftalık ders programı belgesini okuyup, içindeki ders, kaynak, konu, test ve görevleri HİÇBİR DEĞİŞİKLİK, KISALTMA VEYA KAFANDAN İLAVE YAPMADAN AYNEN haftalık çizelgeye aktarmaktır.

${extractedText ? `BELGE METNİ:\n"""\n${extractedText}\n"""\n` : ''}

ÇOK KESİN VE KATI TALİMATLAR:
1. SAAT KURALI (EN KRİTİK KURAL):
   - PDF belgesinde bir ders/çalışma/etüt için AÇIKÇA ve BELİRGİN bir saat aralığı (örn: "09:00 - 10:15", "18:00 - 19:30" vb.) yazılmamışsa, "time" alanını KESİNLİKLE BOŞ BIRAK: "time": ""
   - ASLA ve ASLA kafandan saat uydurma! Herhangi bir saat yazmıyorsa saat alanı mutlaka "" (boş dize) olmalıdır.
   - Sadece ve sadece PDF'te açıkça saat/zaman aralığı belirtilmişse o saati yaz.

2. DERS VE KAYNAK BİLGİSİNİ AYNEN VE BİREBİR AKTARMA KURALI:
   - PDF'te hangi ders yazıyorsa "subject" alanına harfi harfine o dersin adını yaz (Örn: "Matematik", "TYT Matematik", "AYT Matematik", "Geometri", "Türkçe", "Fizik", "Kimya", "Biyoloji", "Tarih", "Coğrafya", "Psikoloji", "Sosyoloji", "Mantık", "Felsefe", "Din Kültürü", "Paragraf", "Fen Bilimleri", "İnkılap Tarihi", "İngilizce" vb.).
   - PDF'te dersin altında, yanında veya içeriğinde hangi kaynak ve hangi ödev/test/sayfa/soru yazıyorsa AYNEN aktar:
     * "topic": PDF'te yazan konunun, test numaralarının, sayfa aralıklarının veya ödevin tam metni.
     * "resource": Varsa belirtilen kaynak / kitap / yayın / hoca adı. Yoksa "" bırak.
     * "advice": Varsa PDF'te öğrenciye yönelik yazılmış koç notu veya direktif. Yoksa "" bırak.
     * "targetQuestions": PDF'te açıkça belirtilmişse soru sayısı. Belirtilmemişse 0.

3. GÜNLER VE BOŞ GÜNLER:
   - "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar" günleri sırayla yer almalıdır.
   - Boş günlere kafandan ders veya çalışma ekleme!

ÇIKTI FORMATI:
Sadece aşağıdaki JSON formatında saf JSON döndür:
{
  "title": "${studentName} - Haftalık Ders Programı",
  "examGroup": "${examGroup}",
  "targetGoal": "Haftalık Çalışma ve Soru Hedefi",
  "schedule": {
    "Pazartesi": [],
    "Salı": [],
    "Çarşamba": [],
    "Perşembe": [],
    "Cuma": [],
    "Cumartesi": [],
    "Pazar": []
  }
}`;

        // Sequence of models to try in case of quota limit or overload
        const candidateModels = ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
        let aiSuccessJson: any = null;

        for (const modelName of candidateModels) {
          try {
            const contents: any[] = [];
            // If extractedText has good length, pass text directly (saves 99% token quota!)
            if (extractedText && extractedText.length > 50) {
              contents.push({ text: prompt });
            } else {
              contents.push(
                { inlineData: { mimeType: 'application/pdf', data: cleanBase64 } },
                { text: prompt }
              );
            }

            const response = await ai.models.generateContent({
              model: modelName,
              contents,
              config: { responseMimeType: 'application/json' }
            });

            const responseText = response.text || "{}";
            const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleaned);

            if (parsed && parsed.schedule && countSlots(parsed.schedule) > 0) {
              aiSuccessJson = parsed;
              break; // Successfully got schedule
            }
          } catch (modelErr: any) {
            console.warn(`Model ${modelName} failed or quota exceeded:`, modelErr?.message || modelErr);
          }
        }

        if (aiSuccessJson) {
          return res.json({
            success: true,
            source: 'gemini-ai',
            data: aiSuccessJson
          });
        }
      } catch (genAiErr) {
        console.warn("AI generation error, falling back to deterministic parser:", genAiErr);
      }
    }

    // 3. Fallback: Parse extracted PDF text directly with deterministic parser
    if (extractedText && extractedText.trim().length > 10) {
      const directParsed = parseTurkishScheduleTextDirectly(extractedText, studentName, examGroup);
      if (countSlots(directParsed.schedule) > 0) {
        return res.json({
          success: true,
          source: 'pdf-text-parser',
          data: directParsed
        });
      }
    }

    // 4. Return clean structure
    return res.json({
      success: true,
      source: 'empty-template',
      data: {
        title: `${studentName} - Haftalık Ders Programı`,
        examGroup: examGroup,
        targetGoal: "Haftalık Çalışma Programı",
        schedule: {
          "Pazartesi": [],
          "Salı": [],
          "Çarşamba": [],
          "Perşembe": [],
          "Cuma": [],
          "Cumartesi": [],
          "Pazar": []
        }
      }
    });
  });

  // 3. Vite middleware for development vs static for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
