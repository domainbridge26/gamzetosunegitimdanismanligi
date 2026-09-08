import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function generateFallbackWeeklySchedule(examGroup: string, studentName: string) {
  const isLGS = examGroup.toUpperCase().includes('LGS');
  const isEA = examGroup.includes('Eşit') || examGroup.includes('TM');

  return {
    "Pazartesi": [
      {
        time: "09:00 - 10:15",
        subject: isLGS ? "LGS Matematik" : "TYT Matematik",
        topic: isLGS ? "Çarpanlar ve Katlar" : "Temel Kavramlar ve Sayılar",
        advice: "Konu tekrarı yap ve en az 35 soru çöz.",
        targetQuestions: 35,
        status: "pending"
      },
      {
        time: "10:30 - 11:45",
        subject: isLGS ? "LGS Türkçe" : "TYT Türkçe",
        topic: isLGS ? "Fiilimsiler" : "Sözcükte Anlam ve Cümlede Anlam",
        advice: "20 paragraf sorusu aksatılmadan çözülecek.",
        targetQuestions: 25,
        status: "pending"
      },
      {
        time: "14:00 - 15:15",
        subject: isLGS ? "LGS Fen Bilimleri" : (isEA ? "TYT Coğrafya" : "TYT Fizik"),
        topic: isLGS ? "Mevsimler ve İklim" : (isEA ? "Doğa ve İnsan" : "Fizik Bilimine Giriş"),
        advice: "Kavram haritası çıkararak çalış.",
        targetQuestions: 30,
        status: "pending"
      }
    ],
    "Salı": [
      {
        time: "09:00 - 10:15",
        subject: isLGS ? "LGS Matematik" : "TYT Matematik",
        topic: isLGS ? "Üslü İfadeler" : "Bölme ve Bölünebilme Kuralları",
        advice: "Yeni nesil beceri temelli sorulara ağırlık ver.",
        targetQuestions: 40,
        status: "pending"
      },
      {
        time: "10:30 - 11:45",
        subject: isLGS ? "LGS İnkılap Tarihi" : "TYT Tarih",
        topic: isLGS ? "Bir Kahraman Doğuyor" : "Tarih ve Zaman",
        advice: "Olayların kronolojik bağlantılarına dikkat et.",
        targetQuestions: 25,
        status: "pending"
      },
      {
        time: "14:00 - 15:15",
        subject: isLGS ? "LGS İngilizce" : (isEA ? "TYT Felsefe" : "TYT Kimya"),
        topic: isLGS ? "Friendship" : (isEA ? "Felsefeyi Tanıma" : "Kimya Bilimi"),
        advice: "Kelime listesi veya formül defterine not al.",
        targetQuestions: 25,
        status: "pending"
      }
    ],
    "Çarşamba": [
      {
        time: "09:00 - 10:15",
        subject: isLGS ? "LGS Fen Bilimleri" : (isEA ? "AYT Edebiyat" : "TYT Biyoloji"),
        topic: isLGS ? "DNA ve Genetik Kod" : (isEA ? "Güzel Sanatlar ve Edebiyat" : "Canlıların Ortak Özellikleri"),
        advice: "Görsel ve şemalı özetleri incele.",
        targetQuestions: 35,
        status: "pending"
      },
      {
        time: "10:30 - 11:45",
        subject: isLGS ? "LGS Türkçe" : "TYT Türkçe",
        topic: "Paragrafta Yapı ve Ana Düşünce",
        advice: "Süre tutarak 25 paragraf sorusu çöz.",
        targetQuestions: 25,
        status: "pending"
      },
      {
        time: "14:00 - 15:15",
        subject: isLGS ? "LGS Din Kültürü" : (isEA ? "AYT Coğrafya" : "AYT Fizik"),
        topic: isLGS ? "Kader İnancı" : (isEA ? "Ekosistem ve Madde Döngüsü" : "Vektörler ve Bağıl Hareket"),
        advice: "Soru bankasından test çöz.",
        targetQuestions: 30,
        status: "pending"
      }
    ],
    "Perşembe": [
      {
        time: "09:00 - 10:15",
        subject: isLGS ? "LGS Matematik" : "TYT Matematik",
        topic: isLGS ? "Kareköklü İfadeler" : "EBOB - EKOK ve Rasyonel Sayılar",
        advice: "Zorlandığın soru tiplerini video çözümden izle.",
        targetQuestions: 40,
        status: "pending"
      },
      {
        time: "10:30 - 11:45",
        subject: isLGS ? "LGS Fen Bilimleri" : (isEA ? "AYT Tarih" : "TYT Kimya"),
        topic: isLGS ? "Basınç" : (isEA ? "İlk ve Orta Çağlarda Türk Dünyası" : "Atom ve Periyodik Sistem"),
        advice: "Deney sorularının mantığını kavra.",
        targetQuestions: 30,
        status: "pending"
      },
      {
        time: "14:00 - 15:15",
        subject: isLGS ? "LGS Türkçe" : "TYT Geometri",
        topic: isLGS ? "Yazım Kuralları" : "Doğruda ve Üçgende Açılar",
        advice: "Şekil çizerek çözmeye alış.",
        targetQuestions: 30,
        status: "pending"
      }
    ],
    "Cuma": [
      {
        time: "09:00 - 10:15",
        subject: isLGS ? "LGS Fen Bilimleri" : (isEA ? "AYT Matematik" : "AYT Fizik"),
        topic: isLGS ? "Madde ve Endüstri" : (isEA ? "Polinomlar ve 2. Dereceden Denklemler" : "Newton'un Hareket Yasaları"),
        advice: "Konu pekiştirme testlerini tamamla.",
        targetQuestions: 35,
        status: "pending"
      },
      {
        time: "10:30 - 11:45",
        subject: isLGS ? "LGS İnkılap Tarihi" : "TYT Türkçe",
        topic: isLGS ? "Milli Uyanış" : "Noktalama İşaretleri ve Dil Bilgisi",
        advice: "Kuralları ezberlemek yerine örnek cümleler üzerinden git.",
        targetQuestions: 30,
        status: "pending"
      },
      {
        time: "14:00 - 15:15",
        subject: isLGS ? "Haftalık Soru Tekrarı" : "Haftalık Genel Tekrar",
        topic: "Hafta boyu yapılamayan veya boş bırakılan soruların analizi",
        advice: "Gamze Hoca'nın belirttiği eksik soru defterini doldur.",
        targetQuestions: 20,
        status: "pending"
      }
    ],
    "Cumartesi": [
      {
        time: "10:00 - 12:15",
        subject: isLGS ? "LGS Branş Denemesi" : "TYT Genel / Branş Denemesi",
        topic: "Gerçek sınav provası ve zaman yönetimi çalışması",
        advice: "Sınav ortamında kesintisiz çöz ve ardından detaylı analiz yap.",
        targetQuestions: 90,
        status: "pending"
      },
      {
        time: "14:00 - 15:30",
        subject: "Deneme Analizi ve Eksik Telafisi",
        topic: "Yanlış yapılan soruların video çözümlerini izleme ve not çıkarma",
        advice: "Doğrularını değil, yanlışlarının nedenini öğren.",
        targetQuestions: 20,
        status: "pending"
      }
    ],
    "Pazar": [
      {
        time: "10:30 - 12:00",
        subject: "Kitap Okuma ve Paragraf Ritmi",
        topic: "30 sayfa kitap okuma + 20 adet zor seviye paragraf sorusu",
        advice: "Okuma hızını ve odaklanma süreni artıracak.",
        targetQuestions: 20,
        status: "pending"
      },
      {
        time: "13:30 - 14:45",
        subject: "Haftalık Değerlendirme & Koçluk Raporu",
        topic: "Haftalık çözülen soru sayılarını sisteme girme ve yeni haftayı planlama",
        advice: "Gamze Hoca ile haftalık hedeflerin kontrolü.",
        targetQuestions: 0,
        status: "pending"
      }
    ]
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

  // 2. Parse uploaded PDF schedule with Gemini AI into weekly table
  app.post("/api/parse-schedule-pdf", async (req, res) => {
    const { pdfBase64, studentName = "Öğrenci", examGroup = "YKS", notes = "" } = req.body;

    if (!pdfBase64) {
      return res.status(400).json({ error: "pdfBase64 is required" });
    }

    const cleanBase64 = pdfBase64.replace(/^data:[^;]+;base64,/, "").trim();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not configured.");
      return res.json({
        success: false,
        error: "GEMINI_API_KEY is not configured",
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
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Sen Gamze Tosun Eğitim Danışmanlığı sistemi için çalışan uzman ve son derece titiz bir veri aktarım uzmanısın.
GÖREVİN: Ekte sunulan PDF haftalık ders programı belgesini okuyup, içindeki ders, kaynak, konu, test ve görevleri HİÇBİR DEĞİŞİKLİK, KISALTMA VEYA KAFANDAN İLAVE YAPMADAN AYNEN haftalık çizelgeye aktarmaktır.

ÇOK KESİN VE KATI TALİMATLAR:
1. SAAT KURALI (EN KRİTİK KURAL):
   - PDF belgesinde bir ders/çalışma/etüt için AÇIKÇA ve BELİRGİN bir saat aralığı (örn: "09:00 - 10:15", "18:00 - 19:30" vb.) yazılmamışsa, "time" alanını KESİNLİKLE BOŞ BIRAK: "time": ""
   - ASLA ve ASLA kafandan saat uydurma! "09:00", "10:00", "17:00" gibi tahmini saatler KESİNLİKLE EKLEME! Herhangi bir saat yazmıyorsa saat alanı mutlaka "" (boş dize) olmalıdır.
   - Sadece ve sadece PDF'te açıkça saat/zaman aralığı belirtilmişse o saati yaz.

2. DERS VE KAYNAK BİLGİSİNİ AYNEN VE BİREBİR AKTARMA KURALI:
   - PDF'te hangi ders yazıyorsa "subject" alanına harfi harfine o dersin adını yaz (Örn: "Matematik", "TYT Matematik", "AYT Matematik", "Geometri", "Türkçe", "Fizik", "Kimya", "Biyoloji", "Tarih", "Coğrafya", "Felsefe", "Din Kültürü", "Paragraf", "Fen Bilimleri", "İnkılap Tarihi", "İngilizce" vb.).
   - PDF'te dersin altında, yanında veya içeriğinde hangi kaynak (kitap, soru bankası, fasikül, yayın, deneme, youtube kanalı/hocası vb.) ve hangi ödev/test/sayfa/soru yazıyorsa AYNEN aktar:
     * "topic": PDF'te yazan konunun, test numaralarının, sayfa aralıklarının, videoların veya ödevin tam metni (örn: "3D Soru Bankası Test 4-5", "Limit-Türev Apotemi Fasikülü s. 24-38", "25 Paragraf Sorusu", "Kenan Kara Üçgende Açılar 2 Video").
     * "resource": Varsa belirtilen kaynak / kitap / yayın / hoca adı (örn: "3D Soru Bankası", "Apotemi", "Bilgi Sarmal", "Karekökk", "Hız ve Renk", "MEB Kazanım", "Kenan Kara", "Eyüp B." vb.). Yoksa "" bırak.
     * "advice": Varsa PDF'te öğrenciye yönelik yazılmış koç notu, tavsiye veya direktif (örn: "Süre tutularak çözülecek", "Video çözümden yanlışlara bakılacak"). Yoksa "" bırak.
     * "targetQuestions": PDF'te açıkça belirtilmişse soru sayısı (sayı olarak, örn: 40). Belirtilmemişse 0.
   - PDF'te yazmayan HİÇBİR konuyu veya dersi kafandan uydurma. PDF'teki metni özetleme, değiştirme veya standart müfredat başlıklarıyla değiştirme. PDF'te ne yazıyorsa aynen aktar.

3. GÜNLER VE BOŞ GÜNLER:
   - "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar" günleri sırayla nesnede yer almalıdır.
   - PDF'te bir gün için herhangi bir çalışma yazılmamışsa veya boş bırakılmışsa, o gün için boş dizi [] döndür. Asla boş günlere kafandan ders veya çalışma ekleme!

4. BAŞLIK VE HEDEF:
   - PDF'te belirtilen başlığı "title" alanına yaz (örn. "${studentName} - Haftalık Ders Programı").
   - Varsa haftalık soru hedefi veya genel notu "targetGoal" alanına yaz.

ÇIKTI FORMATI:
Sadece aşağıdaki JSON formatında saf JSON döndür (başka hiçbir metin veya markdown backtick ekleme):
{
  "title": "${studentName} - Haftalık Ders Programı",
  "examGroup": "${examGroup}",
  "targetGoal": "Haftalık Çalışma ve Soru Hedefi",
  "schedule": {
    "Pazartesi": [
      {
        "time": "",
        "subject": "PDF'teki ders adı",
        "topic": "PDF'teki kaynak/konu/test metni",
        "resource": "PDF'teki kaynak kitap/yayın adı",
        "advice": "PDF'teki koç notu",
        "targetQuestions": 0,
        "status": "pending"
      }
    ],
    "Salı": [],
    "Çarşamba": [],
    "Perşembe": [],
    "Cuma": [],
    "Cumartesi": [],
    "Pazar": []
  }
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: cleanBase64
            }
          },
          {
            text: prompt
          }
        ],
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || "{}";
      let parsedJson: any = null;
      try {
        const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        parsedJson = JSON.parse(cleaned);
      } catch (parseErr) {
        console.error("JSON parse error from Gemini:", parseErr, responseText);
      }

      if (!parsedJson || !parsedJson.schedule || Object.keys(parsedJson.schedule).length === 0) {
        parsedJson = {
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
        };
      }

      return res.json({
        success: true,
        data: parsedJson
      });
    } catch (apiError: any) {
      console.error("Gemini API Error in PDF parsing:", apiError);
      return res.json({
        success: false,
        error: apiError.message,
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
    }
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
