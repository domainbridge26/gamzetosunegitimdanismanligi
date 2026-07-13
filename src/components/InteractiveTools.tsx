import React, { useState, useEffect, useRef } from 'react';
import { SPEED_TEST_TEXTS } from '../data';
import { 
  BookOpen, Calculator, Calendar, Play, CheckCircle2, 
  RotateCcw, Sparkles, ChevronRight, Copy, Check, Info, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function InteractiveTools() {
  const [activeTab, setActiveTab] = useState<'reading' | 'calculator'>('reading');

  // --- Reading Speed Test State ---
  const [selectedTextIdx, setSelectedTextIdx] = useState(0);
  const [testState, setTestState] = useState<'idle' | 'reading' | 'quiz' | 'result'>('idle');
  const [startTime, setStartTime] = useState<number>(0);
  const [readingTimeSeconds, setReadingTimeSeconds] = useState<number>(0);
  const [readingSpeedWpm, setReadingSpeedWpm] = useState<number>(0);
  
  // Quiz
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState<number>(0);

  const activeText = SPEED_TEST_TEXTS[selectedTextIdx];

  const startReadingTest = () => {
    setTestState('reading');
    setStartTime(Date.now());
    setUserAnswers([]);
  };

  const finishReadingTest = () => {
    const elapsedSeconds = Math.max((Date.now() - startTime) / 1000, 1);
    setReadingTimeSeconds(elapsedSeconds);
    const wpm = Math.round((activeText.wordCount / elapsedSeconds) * 60);
    setReadingSpeedWpm(wpm);
    setTestState('quiz');
  };

  const submitQuiz = () => {
    let score = 0;
    activeText.quiz.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) {
        score += 1;
      }
    });
    setQuizScore(score);
    setTestState('result');
  };

  const resetReadingTest = () => {
    setTestState('idle');
    setReadingTimeSeconds(0);
    setReadingSpeedWpm(0);
    setUserAnswers([]);
    setQuizScore(0);
  };

  // --- Score Estimator State ---
  const [calcExam, setCalcExam] = useState<'yks' | 'lgs'>('yks');
  const [yksNets, setYksNets] = useState({
    // TYT
    tytTurkce: 30,
    tytMatematik: 28,
    // TYT Sosyal breakdown
    tytTarih: 4,
    tytCografya: 4,
    tytFelsefe: 3,
    tytDin: 4,
    // TYT Fen breakdown
    tytFizik: 3,
    tytKimya: 4,
    tytBiyoloji: 3,
    
    // AYT
    aytMatematik: 25,
    // AYT Fen breakdown
    aytFizik: 9,
    aytKimya: 8,
    aytBiyoloji: 9,
    // AYT Edebiyat-Sos 1 breakdown
    aytEdebiyat: 18,
    aytTarih1: 7,
    aytCografya1: 4,
    // AYT Sosyal 2 breakdown
    aytTarih2: 8,
    aytCografya2: 8,
    aytFelsefe: 9,
    aytDin: 4,

    // AYT Dil (YDT)
    aytYdt: 65,

    obp: 85,
    track: 'sayisal'
  });
  const [lgsNets, setLgsNets] = useState({ turkce: 16, matematik: 12, fen: 15, inkilap: 9, din: 9, yabanci: 8 });
  const [estimatedScore, setEstimatedScore] = useState<number | null>(null);
  const [estimatedPercentile, setEstimatedPercentile] = useState<string | null>(null);
  const [calcAdvice, setCalcAdvice] = useState<string>('');

  const calculateScore = () => {
    if (calcExam === 'yks') {
      // 1. Calculate TYT Nets
      const tytSosyal = yksNets.tytTarih + yksNets.tytCografya + yksNets.tytFelsefe + yksNets.tytDin;
      const tytFen = yksNets.tytFizik + yksNets.tytKimya + yksNets.tytBiyoloji;
      const tytTotalNet = yksNets.tytTurkce + yksNets.tytMatematik + tytSosyal + tytFen;

      // 2. Calculate AYT Nets based on track
      let aytTotalNet = 0;
      if (yksNets.track === 'sayisal') {
        aytTotalNet = yksNets.aytMatematik + yksNets.aytFizik + yksNets.aytKimya + yksNets.aytBiyoloji;
      } else if (yksNets.track === 'esit-agirlik') {
        aytTotalNet = yksNets.aytMatematik + yksNets.aytEdebiyat + yksNets.aytTarih1 + yksNets.aytCografya1;
      } else if (yksNets.track === 'sozel') {
        const aytSos1 = yksNets.aytEdebiyat + yksNets.aytTarih1 + yksNets.aytCografya1;
        const aytSos2 = yksNets.aytTarih2 + yksNets.aytCografya2 + yksNets.aytFelsefe + yksNets.aytDin;
        aytTotalNet = aytSos1 + aytSos2;
      } else if (yksNets.track === 'dil') {
        aytTotalNet = yksNets.aytYdt;
      }

      // 3. Score calculation
      const examScore = 100 + (tytTotalNet * 1.33) + (aytTotalNet * 3.0);
      const obpContribution = yksNets.obp * 0.6;
      const score = Math.round(Math.min(examScore + obpContribution, 560));
      setEstimatedScore(score);

      // Advisory & Percentiles
      if (score >= 500) {
        setEstimatedPercentile('%0.1 - %1.2');
        setCalcAdvice(`Gamze Hoca'nın Yorumu: İnanılmaz bir derece performansı! ${yksNets.track === 'sayisal' ? 'Cerrahpaşa Tıp, Koç, Bilkent veya ODTÜ Bilgisayar Mühendisliği' : yksNets.track === 'esit-agirlik' ? 'Galatasaray Hukuk, Koç İşletme veya Bilkent İktisat' : yksNets.track === 'sozel' ? 'Boğaziçi Tarih, Koç Medya ve Görsel Sanatlar veya ODTÜ Psikoloji' : 'Boğaziçi Çeviribilim / Mütercim Tercümanlık'} gibi Türkiye'nin en seçkin programlarında zirvedesiniz. Tercih sürecinizi hatasız tamamlamak için birebir Tercih Danışmanlığı almanızı tavsiye ederiz.`);
      } else if (score >= 430) {
        setEstimatedPercentile('%1.5 - %4.5');
        setCalcAdvice(`Gamze Hoca'nın Yorumu: Harika bir sonuç! Ülkenin en köklü devlet üniversitelerinin ve vakıf üniversitelerinin tam burslu popüler bölümlerine yerleşebilecek çok güçlü bir puanınız var. Yerleştirme şansınızı maksimize etmek için Gamze Tosun liderliğindeki tercih ekibimizle iletişime geçebilirsiniz.`);
      } else if (score >= 350) {
        setEstimatedPercentile('%5.0 - %12.5');
        setCalcAdvice("Gamze Hoca'nın Yorumu: Çok temiz ve dengeli netler! Hem devlet üniversitelerinin iyi kampüslerinde hem de kaliteli vakıf üniversitelerinde geniş bir tercih yelpazesine sahipsiniz. İlgi duyduğunuz alanları belirleyip akılcı bir sıralama yapmalıyız.");
      } else {
        setEstimatedPercentile('%15.0 - %35.0');
        setCalcAdvice("Gamze Hoca'nın Yorumu: İyi bir yerdesiniz ancak gelişim alanlarınız bulunuyor. Özellikle zayıf olduğunuz üniteleri analiz edip net artışına odaklanarak bu puanı 50-60 puan daha yukarı çekebiliriz. Pes etmek yok, koçluk desteğimizle yanınızdayız.");
      }
    } else {
      // LGS simulated scoring: MEB weights (Turkish: 4, Math: 4, Science: 4, others: 1)
      const rawWeight = (lgsNets.turkce * 4) + (lgsNets.matematik * 4) + (lgsNets.fen * 4) + (lgsNets.inkilap * 1) + (lgsNets.din * 1) + (lgsNets.yabanci * 1);
      const score = Math.round(Math.min(190 + (rawWeight * 1.25), 500));
      setEstimatedScore(score);

      if (score >= 460) {
        setEstimatedPercentile('%0.1 - %1.5');
        setCalcAdvice("Gamze Hoca'nın Yorumu: Muazzam LGS performansı! Kabataş Erkek Lisesi, İstanbul Erkek Lisesi, Galatasaray Lisesi veya Ankara Fen Lisesi gibi en üst düzey okullar için yarıştasınız. Doğru tercih listesi hayatınızı belirleyecek, bizden mutlaka profesyonel destek alın.");
      } else if (score >= 380) {
        setEstimatedPercentile('%2.0 - %7.5');
        setCalcAdvice("Gamze Hoca'nın Yorumu: Çok güçlü bir lise adayı. Nitelikli proje okulları ve Anadolu liseleri için harika bir yerdesiniz. Tercih dönemindeki kaymaları analiz etmek için hazırız.");
      } else {
        setEstimatedPercentile('%8.0 - %20.0');
        setCalcAdvice("Gamze Hoca'nın Yorumu: İyi bir sonuç. Sınav maratonunu tamamladınız. Adrese dayalı veya yerel yerleştirme ile en nitelikli okulları seçmek için rehberlik alabilirsiniz.");
      }
    }
  };

  // --- Study Planner State ---
  const [plannerExam, setPlannerExam] = useState<'yks' | 'lgs'>('yks');
  const [plannerLevel, setPlannerLevel] = useState<'light' | 'moderate' | 'intense'>('moderate');
  const [generatedPlan, setGeneratedPlan] = useState<{ day: string; tasks: string[] }[] | null>(null);
  const [copied, setCopied] = useState(false);

  const generatePlanner = () => {
    const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    
    const plans: { [key: string]: { [key: string]: string[][] } } = {
      yks: {
        light: [
          ['09:00 - Türkçe Paragraf Rutini (20 Soru)', '10:30 - Matematik / Temel Kavramlar Konu Çalışması'],
          ['09:00 - Paragraf & Problem Çözümü', '14:00 - Tarih / Coğrafya Özet Okuma'],
          ['10:00 - Matematik Soru Çözümü', '15:30 - Türkçe / Dil Bilgisi Kampı'],
          ['09:00 - Paragraf Rutini', '11:00 - Geometri Üçgenler Pratiği'],
          ['10:00 - TYT Fizik / Kimya Konu Tekrarı', '16:00 - Sözel Ders Özetleri'],
          ['10:00 - Haftalık Konu Tekrarı Soru Çözümü', '14:00 - Kitap Okuma & Dinlenme'],
          ['09:30 - TYT Branş Denemesi', '15:00 - Deneme Analizi ve Dinlenme']
        ],
        moderate: [
          ['08:30 - Paragraf & Problem Rutini (40 Soru)', '10:00 - TYT Matematik / Fonksiyonlar', '14:00 - TYT Fizik / Optik Soru Çözümü'],
          ['08:30 - Paragraf & Geometri Rutini', '10:30 - AYT Edebiyat / Tarih Konu Çalışması', '15:30 - Matematik / Trigonometri Pratiği'],
          ['09:00 - TYT Türkçe Dil Bilgisi Testi', '11:00 - TYT Matematik Soru Çözümü', '16:00 - Kimya / Mol Kavramı'],
          ['08:30 - Paragraf & Problem Rutini', '10:00 - Matematik Geometri Karma Çözüm', '14:30 - Biyoloji / Hücre ve Kalıtım'],
          ['09:00 - Coğrafya Bölge Kavramı Çalışması', '11:00 - AYT Matematik Limit / Türev', '15:00 - Fizik Kuvvet ve Hareket'],
          ['09:30 - TYT Genel Deneme Sınavı (135 Dk)', '14:00 - Detaylı Deneme Analizi', '16:30 - Zayıf Konulardan Soru Çözümü'],
          ['10:00 - Haftalık Analiz & Planlama Seansı', '13:00 - Hızlı Okuma Egzersizi', 'Serbest Zaman / Sinema / Spor']
        ],
        intense: [
          ['08:00 - Paragraf, Problem & Geometri Rutini (50 Soru)', '09:30 - TYT Matematik Karma Kampı', '14:00 - AYT Matematik Limit/Türev/İntegral', '17:00 - Fizik Modern Fizik Çalışması'],
          ['08:00 - Rutinler (Paragraf & Sayısal Akıl Yürütme)', '09:45 - Kimya Gazlar ve Sıvı Çözeltiler', '14:00 - Biyoloji Sistemler Konu & Soru', '19:00 - TYT Sosyal Hızlı Tekrar'],
          ['08:00 - Paragraf & Problem Rutini', '10:00 - AYT Matematik Çözüm Teknikleri', '14:30 - Türkçe Branş Denemesi', '16:30 - Geometri Çokgenler / Katı Cisimler'],
          ['08:00 - Rutinler', '09:30 - Fizik Elektrostatik ve Manyetizma', '14:00 - AYT Matematik Trigonometri Kampı', '19:00 - Edebiyat Yazar-Eser Hafıza Kartları'],
          ['08:00 - Paragraf & Problem Rutini', '10:00 - Kimya Karbon Kimyasına Giriş', '14:30 - Biyoloji Bitki Biyolojisi Tekrarı', '17:00 - Matematik Deneme Çözümü'],
          ['08:30 - YKS (TYT + AYT) Simülasyon Sınavı', '15:00 - Eksiksiz Yanlış Soru Defteri Analizi', '17:30 - Formül ve Bilgi Kartları Tekrarı'],
          ['09:00 - Gamze Tosun ile Haftalık Analiz & Motivasyon', '11:30 - Gelecek Haftanın Program Tasarımı', '14:00 - Zihinsel Dinlenme / Doğa Yürüyüşü']
        ]
      },
      lgs: {
        light: [
          ['09:30 - LGS Paragraf Rutini (15 Soru)', '11:00 - Matematik / Çarpanlar ve Katlar'],
          ['09:30 - Paragraf Çözümü', '14:00 - T.C. İnkılap Tarihi Özet Okuma'],
          ['10:00 - Fen Bilimleri / Mevsimler ve İklim', '15:30 - Türkçe Dil Bilgisi Çalışması'],
          ['09:30 - Paragraf & Mantık Muhakeme', '11:00 - Matematik Soru Çözümü'],
          ['10:00 - İngilizce Kelime Kartları', '16:00 - Din Kültürü Özet Tekrarı'],
          ['10:00 - Haftalık Soru Çözüm Analizi', '14:00 - Kitap Okuma & Eğlence'],
          ['10:00 - LGS Sözel Branş Denemesi', '14:00 - Dinlenme ve Eğlence']
        ],
        moderate: [
          ['09:00 - LGS Paragraf & Mantık Muhakeme (25 Soru)', '10:30 - Matematik / Üslü İfadeler', '14:00 - Fen Bilimleri / DNA ve Genetik Kod'],
          ['09:00 - Paragraf Rutini', '10:30 - İnkılap Tarihi / Milli Uyanış', '15:30 - Matematik Yeni Nesil Soru Kampı'],
          ['09:00 - Türkçe Sözcükte Anlam Soru Çözümü', '11:00 - Fen / Basınç Konu ve Soru', '16:00 - İngilizce / Friendship & Teen Life'],
          ['09:00 - Paragraf & Sayısal Analiz', '10:30 - Matematik / Köklü İfadeler', '14:30 - Din Kültürü / Kader İnancı'],
          ['09:00 - Türkçe Branş Denemesi', '11:00 - Fen / Madde ve Endüstri', '15:00 - Matematik Karma Soru Çözümü'],
          ['09:30 - LGS Genel Deneme Sınavı (Sözel + Sayısal)', '14:00 - Hatalı Soru Analizi ve Öğrenimi', '16:00 - Eksik Konu Tekrarları'],
          ['10:00 - Haftalık Değerlendirme', '11:30 - Kitap Okuma & Kelime Oyunu', '14:00 - Aileyle Vakit Geçirme ve Dinlenme']
        ],
        intense: [
          ['08:30 - LGS Paragraf, Görsel Okuma & Mantık Muhakeme', '10:00 - Matematik / Köklü İfadeler Yeni Nesil Kampı', '14:00 - Fen Bilimleri / Madde ve Endüstri Zor Sorular', '16:30 - İngilizce Soru Çözümü'],
          ['08:30 - Paragraf & Mantık Rutini', '10:00 - İnkılap Tarihi / Ya İstiklal Ya Ölüm', '14:00 - Matematik Geometri Tabanlı Sorular', '16:30 - Türkçe Sözel Mantık Analizi'],
          ['08:30 - Paragraf & Sayısal Muhakeme', '10:00 - Fen / Basit Makineler Konu & Soru', '14:30 - Matematik Üslü-Köklü Karma Çözüm', '17:00 - Din Kültürü Konu Tarama'],
          ['08:30 - Paragraf Rutini', '10:00 - Matematik / Veri Analizi ve Olasılık', '14:00 - Fen / Enerji Dönüşümleri', '16:30 - İngilizce Branş Denemesi'],
          ['08:30 - Türkçe Sözel Mantık Kampı', '10:00 - Matematik / Cebirsel İfadeler', '14:30 - Fen Bilimleri Genel Tekrar Sınavı', '17:00 - İnkılap Tarihi Deneme'],
          ['09:00 - LGS Tam Simülasyon Sınavı (Gerçek Saatinde)', '14:00 - Gamze Tosun Soru Defteri Analiz Metodu', '16:00 - Zor Seviye Matematik Soru Çözümü'],
          ['10:00 - Bireysel Koçluk Görüşmesi', '11:30 - Gelecek Haftanın Zorluk Hedefleri', '14:00 - Hak Edilmiş Zihinsel Dinlenme Seansı']
        ]
      }
    };

    const weekPlan = days.map((day, idx) => ({
      day,
      tasks: plans[plannerExam][plannerLevel][idx]
    }));

    setGeneratedPlan(weekPlan);
  };

  const copyPlanToClipboard = () => {
    if (!generatedPlan) return;
    
    let text = `Gamze Tosun Eğitim Danışmanlığı - Haftalık Çalışma Programı (${plannerExam.toUpperCase()} - ${
      plannerLevel === 'light' ? 'Hafif' : plannerLevel === 'moderate' ? 'Orta' : 'Yoğun'
    } Seviye)\n\n`;

    generatedPlan.forEach(d => {
      text += `📅 ${d.day}:\n`;
      d.tasks.forEach(t => {
        text += `  - ${t}\n`;
      });
      text += `\n`;
    });

    text += `* Gamze Tosun Öğrenci Koçluğu ile bu programı kişiselleştirebilir ve her hafta düzenli takip seansları yapabilirsiniz.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="tools" className="py-20 bg-[#FAF9F6] border-b border-[#2D2D2D]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="text-[12px] font-bold tracking-[0.3em] uppercase text-[#C5A059] block">
            Keşfet ve Ölç
          </span>
          <h2 className="text-4xl sm:text-5xl font-serif font-black text-[#2D2D2D] tracking-tight">
            Akıllı İnteraktif Eğitim Araçlarımız
          </h2>
          <p className="text-[#2D2D2D]/80 text-sm sm:text-base leading-relaxed">
            Okuma hızınızı test edin veya deneme netlerinizi hesaplayarak sınavlara doğru stratejiyle hazırlanın.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex justify-center mb-10">
          <div className="bg-[#2D2D2D]/5 p-1.5 rounded-none flex gap-1 border border-[#2D2D2D]/10 w-full max-w-sm">
            <button
              onClick={() => setActiveTab('reading')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === 'reading'
                  ? 'bg-white text-[#2D2D2D] border border-[#2D2D2D]/10 shadow-sm'
                  : 'text-[#2D2D2D]/60 hover:text-[#2D2D2D] hover:bg-white/45'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#C5A059]" />
              <span>Hızlı Okuma Testi</span>
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-white text-[#2D2D2D] border border-[#2D2D2D]/10 shadow-sm'
                  : 'text-[#2D2D2D]/60 hover:text-[#2D2D2D] hover:bg-white/45'
              }`}
            >
              <Calculator className="w-4 h-4 text-[#C5A059]" />
              <span>Net-Puan Hesapla</span>
            </button>
          </div>
        </div>

        {/* Active Tab Panel */}
        <div className="bg-[#FAF9F6] border border-[#2D2D2D]/10 rounded-none shadow-none overflow-hidden max-w-5xl mx-auto">
          
          {/* TAB 1: READING SPEED TEST */}
          {activeTab === 'reading' && (
            <div id="tool-reading-test" className="p-6 sm:p-10 flex flex-col text-left">
              
              {/* Idle State */}
              {testState === 'idle' && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#C5A059]/10 rounded-none text-[#C5A059] shrink-0">
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-serif text-xl text-[#2D2D2D]">
                        Hızlı Okuma Seviye Belirleme Testi
                      </h3>
                      <p className="text-[#2D2D2D]/65 text-sm">
                        Dakikada kaç kelime okuduğunuzu ve okuduğunuzu anlama kalitenizi ölçün.
                      </p>
                    </div>
                  </div>

                  <div className="border border-[#2D2D2D]/10 rounded-none p-6 bg-white/45 space-y-4">
                    <label className="text-[10px] font-bold text-[#2D2D2D]/50 uppercase tracking-widest block">
                      Okumak İstediğiniz Metni Seçin:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {SPEED_TEST_TEXTS.map((txt, index) => (
                        <button
                          key={txt.id}
                          onClick={() => setSelectedTextIdx(index)}
                          className={`p-4 rounded-none border text-left transition-all cursor-pointer ${
                            selectedTextIdx === index
                              ? 'bg-white border-[#C5A059] text-[#2D2D2D] ring-1 ring-[#C5A059]/10'
                              : 'bg-white/40 border-[#2D2D2D]/10 hover:border-[#2D2D2D]/30 text-[#2D2D2D]/85'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none bg-[#C5A059]/10 text-[#C5A059]">
                              {txt.category}
                            </span>
                            <span className="text-[10px] text-[#2D2D2D]/40 font-mono">{txt.wordCount} Kelime</span>
                          </div>
                          <h4 className="font-serif italic text-sm text-[#2D2D2D]">{txt.title}</h4>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/45 border border-[#2D2D2D]/10 p-4 rounded-none text-[#2D2D2D]/80 text-xs sm:text-sm">
                    <Info className="w-5 h-5 text-[#C5A059] shrink-0" />
                    <span>
                      <strong>Nasıl Uygulanır?</strong> "Testi Başlat" butonuna basın, karşınıza çıkacak metni tamamen normal hızınızda okuyun. Okumayı tamamladığınız an "Okumayı Bitirdim" butonuna basın. Ardından anlama testi sorularını yanıtlayın.
                    </span>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={startReadingTest}
                      className="px-8 py-3.5 bg-[#2D2D2D] text-[#FAF9F6] font-bold uppercase tracking-widest text-[11px] rounded-none hover:bg-[#C5A059] transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current text-[#C5A059]" />
                      <span>Testi Başlat</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Reading State */}
              {testState === 'reading' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-[#2D2D2D]/10 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#C5A059] rounded-full animate-ping" />
                      <span className="text-sm font-semibold text-[#2D2D2D]/70">Okuma Süreci Ölçülüyor...</span>
                    </div>
                    <div className="text-[10px] tracking-wider font-bold text-[#2D2D2D]/40 uppercase">
                      Metin: <span className="text-[#2D2D2D]">{activeText.title}</span> ({activeText.wordCount} Kelime)
                    </div>
                  </div>

                  {/* Reading Box */}
                  <div className="border border-[#2D2D2D]/10 p-6 sm:p-8 rounded-none bg-white max-h-[350px] overflow-y-auto">
                    <p className="text-base sm:text-lg text-[#2D2D2D] leading-relaxed font-sans tracking-wide select-none">
                      {activeText.content}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-white/45 p-4 rounded-none border border-[#2D2D2D]/10">
                    <span className="text-xs text-[#2D2D2D]/60 font-medium">
                      Acele etmeyin. Sadece her kelimeyi tam algılayarak, kendi doğal temponuzla okuyun.
                    </span>
                    <button
                      onClick={finishReadingTest}
                      className="px-8 py-3.5 bg-[#2D2D2D] text-[#FAF9F6] font-bold uppercase tracking-widest text-[11px] rounded-none hover:bg-[#C5A059] transition-all shrink-0 cursor-pointer"
                    >
                      Okumayı Bitirdim
                    </button>
                  </div>
                </div>
              )}

              {/* Quiz State */}
              {testState === 'quiz' && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#C5A059]/10 rounded-none text-[#C5A059] shrink-0">
                      <Award className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-serif text-xl text-[#2D2D2D]">
                        Okuduğunu Anlama Testi
                      </h3>
                      <p className="text-[#2D2D2D]/60 text-sm">
                        Metni ne kadar iyi anladığınızı ölçmek için aşağıdaki {activeText.quiz.length} soruyu yanıtlayın.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6 pt-2">
                    {activeText.quiz.map((q, qIdx) => (
                      <div key={qIdx} className="border border-[#2D2D2D]/10 p-5 rounded-none space-y-3 bg-white/45">
                        <h4 className="font-serif italic text-[#2D2D2D] text-sm flex gap-2">
                          <span className="text-[#C5A059] font-mono font-bold">Soru {qIdx + 1}:</span>
                          <span>{q.question}</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = userAnswers[qIdx] === optIdx;
                            return (
                              <button
                                key={optIdx}
                                onClick={() => {
                                  const updated = [...userAnswers];
                                  updated[qIdx] = optIdx;
                                  setUserAnswers(updated);
                                }}
                                className={`p-3 rounded-none border text-left text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-white border-[#C5A059] text-[#2D2D2D] ring-1 ring-[#C5A059]/10'
                                    : 'bg-white/40 border-[#2D2D2D]/10 hover:border-[#2D2D2D]/30 text-[#2D2D2D]/80'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-[#2D2D2D]/10">
                    <button
                      onClick={resetReadingTest}
                      className="px-4 py-2.5 text-[#2D2D2D]/60 hover:bg-[#2D2D2D]/5 rounded-none transition-colors font-bold uppercase tracking-widest text-[10px] cursor-pointer"
                    >
                      Yeniden Başlat
                    </button>
                    <button
                      onClick={submitQuiz}
                      disabled={userAnswers.length < activeText.quiz.length}
                      className={`px-6 py-3 font-bold uppercase tracking-widest text-[10px] rounded-none transition-all flex items-center gap-1.5 cursor-pointer ${
                        userAnswers.length < activeText.quiz.length
                          ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                          : 'bg-[#2D2D2D] text-[#FAF9F6] hover:bg-[#C5A059]'
                      }`}
                    >
                      <span>Sonuçları Göster</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Result State */}
              {testState === 'result' && (
                <div className="space-y-8">
                  <div className="text-center space-y-2 border-b border-[#2D2D2D]/10 pb-6">
                    <h3 className="font-serif text-2xl text-[#2D2D2D]">
                      Harika! Test Tamamlandı
                    </h3>
                    <p className="text-[#2D2D2D]/60 text-sm">
                      Okuma hızı ve anlama derinliği performans analiziniz hazırlandı.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Stat Card 1: Okuma Hızı */}
                    <div className="p-6 bg-white border border-[#2D2D2D]/10 rounded-none text-center space-y-2">
                      <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest block">Okuma Hızınız</span>
                      <div className="font-serif text-4xl sm:text-5xl text-[#2D2D2D]">
                        {readingSpeedWpm} <span className="text-sm font-sans font-normal text-[#2D2D2D]/50">Kelime / Dk</span>
                      </div>
                      <p className="text-xs text-[#2D2D2D]/60 mt-2">
                        Metin ({activeText.wordCount} kelime) toplam <strong>{Math.round(readingTimeSeconds)} saniyede</strong> okundu.
                      </p>
                    </div>

                    {/* Stat Card 2: Anlama Oranı */}
                    <div className="p-6 bg-[#FAF9F6] border border-[#2D2D2D]/10 rounded-none text-center space-y-2">
                      <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest block">Anlama Skorunuz</span>
                      <div className="font-serif text-4xl sm:text-5xl text-[#2D2D2D]">
                        {Math.round((quizScore / activeText.quiz.length) * 100)}%
                      </div>
                      <p className="text-xs text-[#2D2D2D]/60 mt-2">
                        {activeText.quiz.length} sorudan <strong>{quizScore} doğru</strong> yanıt verdiniz.
                      </p>
                    </div>
                  </div>

                  {/* Interpretation & Feedback */}
                  <div className="bg-white/45 border border-[#2D2D2D]/10 p-6 rounded-none space-y-4">
                    <h4 className="font-serif italic text-[#2D2D2D] text-sm flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#C5A059]" />
                      Gamze Tosun Eğitim Değerlendirmesi:
                    </h4>
                    <p className="text-xs sm:text-sm text-[#2D2D2D]/80 leading-relaxed">
                      {readingSpeedWpm < 180 ? (
                        <span>Okuma hızınız (<strong>{readingSpeedWpm} KDK</strong>) Türkiye ortalamasının biraz altında. Sınavlarda paragrafları okurken iç seslendirme yapıyor veya kelimeleri tek tek okuyor olabilirsiniz. Gamze Tosun'dan alacağınız <strong>Hızlı Okuma Teknikleri</strong> eğitimi ile anlama kalitenizi bozmadan bu hızı kısa sürede <strong>450-600 kelimeye</strong> çıkarabilir, sınavlarda en az 30 dakika zaman kazanabilirsiniz!</span>
                      ) : readingSpeedWpm < 280 ? (
                        <span>Hızınız (<strong>{readingSpeedWpm} KDK</strong>) ortalama seviyede. Ancak sınav temposunda uzun paragraflar ve çoklu sözel bölümler sizi yoruyor olabilir. <strong>Anlama Skorunuz: %{Math.round((quizScore / activeText.quiz.length) * 100)}</strong>. Okuma odağınızı kaybetmeden hızı 2 katına çıkaracak göz kası egzersizleri ve blok okuma çalışmalarıyla mükemmel düzeye gelebilirsiniz.</span>
                      ) : (
                        <span>Mükemmel okuma hızı (<strong>{readingSpeedWpm} KDK</strong>)! Eğer anlama skorunuz da yüksekse harika bir odaklanmaya sahipsiniz. Bu avantajı sınav stratejisinde ve TYT/LGS gibi süreyle yarışılan sınavlarda zirveye dönüştürmek için tercih ve öğrenci koçluğu desteğimize başvurabilirsiniz.</span>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 border-t border-[#2D2D2D]/10">
                    <button
                      onClick={resetReadingTest}
                      className="w-full sm:w-auto px-6 py-3 border border-[#2D2D2D] text-[#2D2D2D] hover:bg-[#2D2D2D]/5 font-bold uppercase tracking-widest text-[10px] rounded-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Yeniden Test Et</span>
                    </button>
                    <button
                      onClick={() => {
                        const el = document.getElementById('contact');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full sm:w-auto px-6 py-3 bg-[#2D2D2D] hover:bg-[#C5A059] text-[#FAF9F6] font-bold uppercase tracking-widest text-[10px] rounded-none transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Hızlı Okuma Danışmanlığı Al</span>
                    </button>
                  </div>
                </div>
              )}
              
            </div>
          )}

          {/* TAB 2: SCORE CALCULATOR */}
          {activeTab === 'calculator' && (
            <div id="tool-score-calculator" className="p-6 sm:p-10 flex flex-col text-left">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-[#C5A059]/10 rounded-none text-[#C5A059] shrink-0">
                  <Calculator className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-xl text-[#2D2D2D]">
                    Sınav Net Hesaplama & Tercih Stratejisi
                  </h3>
                  <p className="text-[#2D2D2D]/60 text-sm">
                    Deneme netlerinizi girerek simüle edilmiş sınav puanınızı hesaplayın ve Gamze Tosun rehberliğindeki tercih stratejisini okuyun.
                  </p>
                </div>
              </div>

              {/* Toggle Sınav */}
              <div className="flex gap-2 mb-6 border-b border-[#2D2D2D]/10 pb-4">
                <button
                  onClick={() => { setCalcExam('yks'); setEstimatedScore(null); }}
                  className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer rounded-none ${
                    calcExam === 'yks'
                      ? 'bg-[#2D2D2D] text-[#FAF9F6] border border-[#2D2D2D]'
                      : 'bg-white border border-[#2D2D2D]/10 text-[#2D2D2D]/70 hover:bg-[#2D2D2D]/5'
                  }`}
                >
                  YKS (TYT Sınavı)
                </button>
                <button
                  onClick={() => { setCalcExam('lgs'); setEstimatedScore(null); }}
                  className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer rounded-none ${
                    calcExam === 'lgs'
                      ? 'bg-[#2D2D2D] text-[#FAF9F6] border border-[#2D2D2D]'
                      : 'bg-white border border-[#2D2D2D]/10 text-[#2D2D2D]/70 hover:bg-[#2D2D2D]/5'
                  }`}
                >
                  LGS Sınavı
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Inputs */}
                <div className="md:col-span-7 space-y-5">
                  <h4 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wider mb-2">Net Girişleri</h4>
                  
                  {calcExam === 'yks' ? (
                    <div className="space-y-6">
                      {/* Track / Alan Selection */}
                      <div className="space-y-2 bg-white border border-[#2D2D2D]/10 p-4">
                        <label className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest block">Hedef Alan / Puan Türü Seçimi</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: 'sayisal', name: 'Sayısal (SAY)' },
                            { id: 'esit-agirlik', name: 'Eşit Ağırlık (EA)' },
                            { id: 'sozel', name: 'Sözel (SÖZ)' },
                            { id: 'dil', name: 'Yabancı Dil (DİL)' }
                          ].map((track) => (
                            <button
                              key={track.id}
                              type="button"
                              onClick={() => setYksNets({ ...yksNets, track: track.id })}
                              className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider border rounded-none transition-all cursor-pointer ${
                                yksNets.track === track.id
                                  ? 'bg-[#2D2D2D] text-[#FAF9F6] border-[#2D2D2D]'
                                  : 'bg-[#FAF9F6] border-[#2D2D2D]/15 text-[#2D2D2D]/70 hover:bg-[#2D2D2D]/5'
                              }`}
                            >
                              {track.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 1. TYT Netleri */}
                      <div className="space-y-4 border border-[#2D2D2D]/10 p-4 bg-white/45">
                        <div className="border-b border-[#2D2D2D]/15 pb-2">
                          <h5 className="font-serif italic text-sm text-[#2D2D2D] font-bold">1. TYT (Temel Yeterlilik Testi) Netleri (Max 120)</h5>
                          <p className="text-[10px] text-[#2D2D2D]/50">9. ve 10. sınıf müfredatını kapsayan ortak sınav bileşenleri</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 flex justify-between">
                              <span>Türkçe Net (0-40):</span>
                              <span className="font-mono text-[#C5A059] font-bold">{yksNets.tytTurkce} Net</span>
                            </label>
                            <input 
                              type="range" min="0" max="40" step="0.25"
                              value={yksNets.tytTurkce}
                              onChange={(e) => setYksNets({ ...yksNets, tytTurkce: Number(e.target.value) })}
                              className="w-full accent-[#C5A059] h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 flex justify-between">
                              <span>Temel Matematik Net (0-40):</span>
                              <span className="font-mono text-[#C5A059] font-bold">{yksNets.tytMatematik} Net</span>
                            </label>
                            <input 
                              type="range" min="0" max="40" step="0.25"
                              value={yksNets.tytMatematik}
                              onChange={(e) => setYksNets({ ...yksNets, tytMatematik: Number(e.target.value) })}
                              className="w-full accent-[#C5A059] h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* TYT Sosyal breakdown */}
                        <div className="bg-white border border-[#2D2D2D]/10 p-3 space-y-3">
                          <div className="flex justify-between items-center border-b border-[#2D2D2D]/5 pb-1.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sosyal Bilimler Alt Dersleri</span>
                            <span className="text-xs font-mono font-bold text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded">
                              {(yksNets.tytTarih + yksNets.tytCografya + yksNets.tytFelsefe + yksNets.tytDin).toFixed(2)} / 20 Net
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[11px] text-slate-500 flex justify-between">
                                <span>Tarih (0-5):</span>
                                <span className="font-mono font-bold text-[#2D2D2D]">{yksNets.tytTarih}</span>
                              </label>
                              <input 
                                type="range" min="0" max="5" step="0.25"
                                value={yksNets.tytTarih}
                                onChange={(e) => setYksNets({ ...yksNets, tytTarih: Number(e.target.value) })}
                                className="w-full accent-[#C5A059] h-1 bg-stone-200 appearance-none cursor-pointer"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] text-slate-500 flex justify-between">
                                <span>Coğrafya (0-5):</span>
                                <span className="font-mono font-bold text-[#2D2D2D]">{yksNets.tytCografya}</span>
                              </label>
                              <input 
                                type="range" min="0" max="5" step="0.25"
                                value={yksNets.tytCografya}
                                onChange={(e) => setYksNets({ ...yksNets, tytCografya: Number(e.target.value) })}
                                className="w-full accent-[#C5A059] h-1 bg-stone-200 appearance-none cursor-pointer"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] text-slate-500 flex justify-between">
                                <span>Felsefe (0-5):</span>
                                <span className="font-mono font-bold text-[#2D2D2D]">{yksNets.tytFelsefe}</span>
                              </label>
                              <input 
                                type="range" min="0" max="5" step="0.25"
                                value={yksNets.tytFelsefe}
                                onChange={(e) => setYksNets({ ...yksNets, tytFelsefe: Number(e.target.value) })}
                                className="w-full accent-[#C5A059] h-1 bg-stone-200 appearance-none cursor-pointer"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] text-slate-500 flex justify-between">
                                <span>Din Kültürü (0-5):</span>
                                <span className="font-mono font-bold text-[#2D2D2D]">{yksNets.tytDin}</span>
                              </label>
                              <input 
                                type="range" min="0" max="5" step="0.25"
                                value={yksNets.tytDin}
                                onChange={(e) => setYksNets({ ...yksNets, tytDin: Number(e.target.value) })}
                                className="w-full accent-[#C5A059] h-1 bg-stone-200 appearance-none cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>

                        {/* TYT Fen breakdown */}
                        <div className="bg-white border border-[#2D2D2D]/10 p-3 space-y-3">
                          <div className="flex justify-between items-center border-b border-[#2D2D2D]/5 pb-1.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fen Bilimleri Alt Dersleri</span>
                            <span className="text-xs font-mono font-bold text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded">
                              {(yksNets.tytFizik + yksNets.tytKimya + yksNets.tytBiyoloji).toFixed(2)} / 20 Net
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="text-[11px] text-slate-500 flex justify-between">
                                <span>Fizik (0-7):</span>
                                <span className="font-mono font-bold text-[#2D2D2D]">{yksNets.tytFizik}</span>
                              </label>
                              <input 
                                type="range" min="0" max="7" step="0.25"
                                value={yksNets.tytFizik}
                                onChange={(e) => setYksNets({ ...yksNets, tytFizik: Number(e.target.value) })}
                                className="w-full accent-[#C5A059] h-1 bg-stone-200 appearance-none cursor-pointer"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] text-slate-500 flex justify-between">
                                <span>Kimya (0-7):</span>
                                <span className="font-mono font-bold text-[#2D2D2D]">{yksNets.tytKimya}</span>
                              </label>
                              <input 
                                type="range" min="0" max="7" step="0.25"
                                value={yksNets.tytKimya}
                                onChange={(e) => setYksNets({ ...yksNets, tytKimya: Number(e.target.value) })}
                                className="w-full accent-[#C5A059] h-1 bg-stone-200 appearance-none cursor-pointer"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] text-slate-500 flex justify-between">
                                <span>Biyoloji (0-6):</span>
                                <span className="font-mono font-bold text-[#2D2D2D]">{yksNets.tytBiyoloji}</span>
                              </label>
                              <input 
                                type="range" min="0" max="6" step="0.25"
                                value={yksNets.tytBiyoloji}
                                onChange={(e) => setYksNets({ ...yksNets, tytBiyoloji: Number(e.target.value) })}
                                className="w-full accent-[#C5A059] h-1 bg-stone-200 appearance-none cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2. AYT Netleri */}
                      <div className="space-y-4 border border-[#2D2D2D]/10 p-4 bg-white/45">
                        <div className="border-b border-[#2D2D2D]/15 pb-2">
                          <h5 className="font-serif italic text-sm text-[#2D2D2D] font-bold">2. AYT (Alan Yeterlilik Testi) Netleri</h5>
                          <p className="text-[10px] text-[#2D2D2D]/50">11. ve 12. sınıf müfredatını kapsayan, alanınıza özel uzmanlık sınavı</p>
                        </div>

                        {yksNets.track === 'sayisal' && (
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-600 flex justify-between">
                                <span>AYT Matematik Net (0-40):</span>
                                <span className="font-mono text-[#C5A059] font-bold">{yksNets.aytMatematik} Net</span>
                              </label>
                              <input 
                                type="range" min="0" max="40" step="0.25"
                                value={yksNets.aytMatematik}
                                onChange={(e) => setYksNets({ ...yksNets, aytMatematik: Number(e.target.value) })}
                                className="w-full accent-[#C5A059] h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>

                            <div className="bg-white border border-[#2D2D2D]/10 p-3 space-y-3">
                              <div className="flex justify-between items-center border-b border-[#2D2D2D]/5 pb-1.5">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fen Bilimleri Alt Dersleri</span>
                                <span className="text-xs font-mono font-bold text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded">
                                  {(yksNets.aytFizik + yksNets.aytKimya + yksNets.aytBiyoloji).toFixed(2)} / 40 Net
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[11px] text-slate-500 flex justify-between">
                                    <span>Fizik (0-14):</span>
                                    <span className="font-mono font-bold text-[#2D2D2D]">{yksNets.aytFizik}</span>
                                  </label>
                                  <input 
                                    type="range" min="0" max="14" step="0.25"
                                    value={yksNets.aytFizik}
                                    onChange={(e) => setYksNets({ ...yksNets, aytFizik: Number(e.target.value) })}
                                    className="w-full accent-[#C5A059] h-1 bg-stone-200 appearance-none cursor-pointer"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] text-slate-500 flex justify-between">
                                    <span>Kimya (0-13):</span>
                                    <span className="font-mono font-bold text-[#2D2D2D]">{yksNets.aytKimya}</span>
                                  </label>
                                  <input 
                                    type="range" min="0" max="13" step="0.25"
                                    value={yksNets.aytKimya}
                                    onChange={(e) => setYksNets({ ...yksNets, aytKimya: Number(e.target.value) })}
                                    className="w-full accent-[#C5A059] h-1 bg-stone-200 appearance-none cursor-pointer"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] text-slate-500 flex justify-between">
                                    <span>Biyoloji (0-13):</span>
                                    <span className="font-mono font-bold text-[#2D2D2D]">{yksNets.aytBiyoloji}</span>
                                  </label>
                                  <input 
                                    type="range" min="0" max="13" step="0.25"
                                    value={yksNets.aytBiyoloji}
                                    onChange={(e) => setYksNets({ ...yksNets, aytBiyoloji: Number(e.target.value) })}
                                    className="w-full accent-[#C5A059] h-1 bg-stone-200 appearance-none cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {yksNets.track === 'esit-agirlik' && (
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-600 flex justify-between">
                                <span>AYT Matematik Net (0-40):</span>
                                <span className="font-mono text-[#C5A059] font-bold">{yksNets.aytMatematik} Net</span>
                              </label>
                              <input 
                                type="range" min="0" max="40" step="0.25"
                                value={yksNets.aytMatematik}
                                onChange={(e) => setYksNets({ ...yksNets, aytMatematik: Number(e.target.value) })}
                                className="w-full accent-[#C5A059] h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>

                            <div className="bg-white border border-[#2D2D2D]/10 p-3 space-y-3">
                              <div className="flex justify-between items-center border-b border-[#2D2D2D]/5 pb-1.5">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Edebiyat - Sosyal Bilimler 1</span>
                                <span className="text-xs font-mono font-bold text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded">
                                  {(yksNets.aytEdebiyat + yksNets.aytTarih1 + yksNets.aytCografya1).toFixed(2)} / 40 Net
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[11px] text-slate-500 flex justify-between">
                                    <span>Edebiyat (0-24):</span>
                                    <span className="font-mono font-bold text-[#2D2D2D]">{yksNets.aytEdebiyat}</span>
                                  </label>
                                  <input 
                                    type="range" min="0" max="24" step="0.25"
                                    value={yksNets.aytEdebiyat}
                                    onChange={(e) => setYksNets({ ...yksNets, aytEdebiyat: Number(e.target.value) })}
                                    className="w-full accent-[#C5A059] h-1 bg-stone-200 appearance-none cursor-pointer"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] text-slate-500 flex justify-between">
                                    <span>Tarih-1 (0-10):</span>
                                    <span className="font-mono font-bold text-[#2D2D2D]">{yksNets.aytTarih1}</span>
                                  </label>
                                  <input 
                                    type="range" min="0" max="10" step="0.25"
                                    value={yksNets.aytTarih1}
                                    onChange={(e) => setYksNets({ ...yksNets, aytTarih1: Number(e.target.value) })}
                                    className="w-full accent-[#C5A059] h-1 bg-stone-200 appearance-none cursor-pointer"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] text-slate-500 flex justify-between">
                                    <span>Coğrafya-1 (0-6):</span>
                                    <span className="font-mono font-bold text-[#2D2D2D]">{yksNets.aytCografya1}</span>
                                  </label>
                                  <input 
                                    type="range" min="0" max="6" step="0.25"
                                    value={yksNets.aytCografya1}
                                    onChange={(e) => setYksNets({ ...yksNets, aytCografya1: Number(e.target.value) })}
                                    className="w-full accent-[#C5A059] h-1 bg-stone-200 appearance-none cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {yksNets.track === 'sozel' && (
                          <div className="space-y-4">
                            <div className="bg-white border border-[#2D2D2D]/10 p-3 space-y-3">
                              <div className="flex justify-between items-center border-b border-[#2D2D2D]/5 pb-1.5">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Edebiyat - Sosyal 1 (Max 40)</span>
                                <span className="text-xs font-mono font-bold text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded">
                                  {(yksNets.aytEdebiyat + yksNets.aytTarih1 + yksNets.aytCografya1).toFixed(2)} Net
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[11px] text-slate-500 flex justify-between">
                                    <span>Edebiyat (0-24):</span>
                                    <span className="font-mono font-bold text-[#2D2D2D]">{yksNets.aytEdebiyat}</span>
                                  </label>
                                  <input 
                                    type="range" min="0" max="24" step="0.25"
                                    value={yksNets.aytEdebiyat}
                                    onChange={(e) => setYksNets({ ...yksNets, aytEdebiyat: Number(e.target.value) })}
                                    className="w-full accent-[#C5A059] h-1 bg-stone-200 appearance-none cursor-pointer"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] text-slate-500 flex justify-between">
                                    <span>Tarih-1 (0-10):</span>
                                    <span className="font-mono font-bold text-[#2D2D2D]">{yksNets.aytTarih1}</span>
                                  </label>
                                  <input 
                                    type="range" min="0" max="10" step="0.25"
                                    value={yksNets.aytTarih1}
                                    onChange={(e) => setYksNets({ ...yksNets, aytTarih1: Number(e.target.value) })}
                                    className="w-full accent-[#C5A059] h-1 bg-stone-200 appearance-none cursor-pointer"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] text-slate-500 flex justify-between">
                                    <span>Coğrafya-1 (0-6):</span>
                                    <span className="font-mono font-bold text-[#2D2D2D]">{yksNets.aytCografya1}</span>
                                  </label>
                                  <input 
                                    type="range" min="0" max="6" step="0.25"
                                    value={yksNets.aytCografya1}
                                    onChange={(e) => setYksNets({ ...yksNets, aytCografya1: Number(e.target.value) })}
                                    className="w-full accent-[#C5A059] h-1 bg-stone-200 appearance-none cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="bg-white border border-[#2D2D2D]/10 p-3 space-y-3">
                              <div className="flex justify-between items-center border-b border-[#2D2D2D]/5 pb-1.5">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sosyal Bilimler 2 (Max 40)</span>
                                <span className="text-xs font-mono font-bold text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded">
                                  {(yksNets.aytTarih2 + yksNets.aytCografya2 + yksNets.aytFelsefe + yksNets.aytDin).toFixed(2)} Net
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[11px] text-slate-500 flex justify-between">
                                    <span>Tarih-2 (0-11):</span>
                                    <span className="font-mono font-bold text-[#2D2D2D]">{yksNets.aytTarih2}</span>
                                  </label>
                                  <input 
                                    type="range" min="0" max="11" step="0.25"
                                    value={yksNets.aytTarih2}
                                    onChange={(e) => setYksNets({ ...yksNets, aytTarih2: Number(e.target.value) })}
                                    className="w-full accent-[#C5A059] h-1 bg-stone-200 appearance-none cursor-pointer"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] text-slate-500 flex justify-between">
                                    <span>Coğrafya-2 (0-11):</span>
                                    <span className="font-mono font-bold text-[#2D2D2D]">{yksNets.aytCografya2}</span>
                                  </label>
                                  <input 
                                    type="range" min="0" max="11" step="0.25"
                                    value={yksNets.aytCografya2}
                                    onChange={(e) => setYksNets({ ...yksNets, aytCografya2: Number(e.target.value) })}
                                    className="w-full accent-[#C5A059] h-1 bg-stone-200 appearance-none cursor-pointer"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] text-slate-500 flex justify-between">
                                    <span>Felsefe Grubu (0-12):</span>
                                    <span className="font-mono font-bold text-[#2D2D2D]">{yksNets.aytFelsefe}</span>
                                  </label>
                                  <input 
                                    type="range" min="0" max="12" step="0.25"
                                    value={yksNets.aytFelsefe}
                                    onChange={(e) => setYksNets({ ...yksNets, aytFelsefe: Number(e.target.value) })}
                                    className="w-full accent-[#C5A059] h-1 bg-stone-200 appearance-none cursor-pointer"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] text-slate-500 flex justify-between">
                                    <span>Din Kültürü (0-6):</span>
                                    <span className="font-mono font-bold text-[#2D2D2D]">{yksNets.aytDin}</span>
                                  </label>
                                  <input 
                                    type="range" min="0" max="6" step="0.25"
                                    value={yksNets.aytDin}
                                    onChange={(e) => setYksNets({ ...yksNets, aytDin: Number(e.target.value) })}
                                    className="w-full accent-[#C5A059] h-1 bg-stone-200 appearance-none cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {yksNets.track === 'dil' && (
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-600 flex justify-between">
                                <span>YDT Yabancı Dil Net (0-80):</span>
                                <span className="font-mono text-[#C5A059] font-bold">{yksNets.aytYdt} Net</span>
                              </label>
                              <input 
                                type="range" min="0" max="80" step="1"
                                value={yksNets.aytYdt}
                                onChange={(e) => setYksNets({ ...yksNets, aytYdt: Number(e.target.value) })}
                                className="w-full accent-[#C5A059] h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 3. OBP Seçimi */}
                      <div className="space-y-2 border border-[#2D2D2D]/10 p-4 bg-white/45">
                        <label className="text-xs font-semibold text-slate-600 flex justify-between">
                          <span>Ortaöğretim Başarı Puanı (OBP - 50-100):</span>
                          <span className="font-mono text-[#C5A059] font-bold">{yksNets.obp} Puan</span>
                        </label>
                        <input 
                          type="range" min="50" max="100" step="0.5"
                          value={yksNets.obp}
                          onChange={(e) => setYksNets({ ...yksNets, obp: Number(e.target.value) })}
                          className="w-full accent-[#C5A059] h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-[9px] text-[#2D2D2D]/50 block">Sınav yerleştirme puanınıza (OBP × 0.6) oranında katkı sağlanır.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 flex justify-between">
                          <span>Türkçe (0-20):</span>
                          <span className="font-mono text-emerald-800 font-bold">{lgsNets.turkce}</span>
                        </label>
                        <input 
                          type="range" min="0" max="20" step="1"
                          value={lgsNets.turkce}
                          onChange={(e) => setLgsNets({ ...lgsNets, turkce: Number(e.target.value) })}
                          className="w-full accent-emerald-600 h-1.5 bg-stone-200 rounded-lg appearance-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 flex justify-between">
                          <span>Matematik (0-20):</span>
                          <span className="font-mono text-emerald-800 font-bold">{lgsNets.matematik}</span>
                        </label>
                        <input 
                          type="range" min="0" max="20" step="1"
                          value={lgsNets.matematik}
                          onChange={(e) => setLgsNets({ ...lgsNets, matematik: Number(e.target.value) })}
                          className="w-full accent-emerald-600 h-1.5 bg-stone-200 rounded-lg appearance-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 flex justify-between">
                          <span>Fen Bilimleri (0-20):</span>
                          <span className="font-mono text-emerald-800 font-bold">{lgsNets.fen}</span>
                        </label>
                        <input 
                          type="range" min="0" max="20" step="1"
                          value={lgsNets.fen}
                          onChange={(e) => setLgsNets({ ...lgsNets, fen: Number(e.target.value) })}
                          className="w-full accent-emerald-600 h-1.5 bg-stone-200 rounded-lg appearance-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 flex justify-between">
                          <span>İnkılap Tarihi (0-10):</span>
                          <span className="font-mono text-emerald-800 font-bold">{lgsNets.inkilap}</span>
                        </label>
                        <input 
                          type="range" min="0" max="10" step="1"
                          value={lgsNets.inkilap}
                          onChange={(e) => setLgsNets({ ...lgsNets, inkilap: Number(e.target.value) })}
                          className="w-full accent-emerald-600 h-1.5 bg-stone-200 rounded-lg appearance-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 flex justify-between">
                          <span>Din Kültürü (0-10):</span>
                          <span className="font-mono text-emerald-800 font-bold">{lgsNets.din}</span>
                        </label>
                        <input 
                          type="range" min="0" max="10" step="1"
                          value={lgsNets.din}
                          onChange={(e) => setLgsNets({ ...lgsNets, din: Number(e.target.value) })}
                          className="w-full accent-emerald-600 h-1.5 bg-stone-200 rounded-lg appearance-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 flex justify-between">
                          <span>Yabancı Dil (0-10):</span>
                          <span className="font-mono text-emerald-800 font-bold">{lgsNets.yabanci}</span>
                        </label>
                        <input 
                          type="range" min="0" max="10" step="1"
                          value={lgsNets.yabanci}
                          onChange={(e) => setLgsNets({ ...lgsNets, yabanci: Number(e.target.value) })}
                          className="w-full accent-emerald-600 h-1.5 bg-stone-200 rounded-lg appearance-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={calculateScore}
                      className="px-8 py-3.5 bg-[#2D2D2D] text-[#FAF9F6] hover:bg-[#C5A059] font-bold uppercase tracking-widest text-[11px] rounded-none transition-all cursor-pointer"
                    >
                      Puan & Strateji Hesapla
                    </button>
                  </div>
                </div>

                {/* Outputs Panel (Right) */}
                <div className="md:col-span-5 flex flex-col justify-center border-t md:border-t-0 md:border-l border-[#2D2D2D]/10 pt-6 md:pt-0 md:pl-8">
                  {estimatedScore !== null ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-6 text-center md:text-left"
                    >
                      {calcExam === 'yks' ? (
                        <div className="space-y-4 text-left">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-[#2D2D2D]/40 uppercase tracking-widest block">YERLEŞTİRME PUANI (OBP DAHİL)</span>
                            <div className="font-serif text-5xl text-[#2D2D2D]">{estimatedScore} <span className="text-sm font-sans font-normal text-[#2D2D2D]/40">/ 560</span></div>
                          </div>
                          
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-[#2D2D2D]/40 uppercase tracking-widest block">HAM SINAV PUANI (OBP HARİÇ)</span>
                            <div className="font-serif text-2xl text-[#2D2D2D]">{Math.round(estimatedScore - yksNets.obp * 0.6)} <span className="text-xs font-sans font-normal text-[#2D2D2D]/40">/ 500</span></div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-[#2D2D2D]/40 uppercase tracking-widest block">Tahmini Yüzdelik Dilim</span>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C5A059]/10 text-[#C5A059] font-bold rounded-none text-xs">
                              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                              <span>{estimatedPercentile}</span>
                            </div>
                          </div>

                          <div className="border border-[#2D2D2D]/10 bg-white p-3.5 space-y-2 text-xs">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-[#2D2D2D]/5 pb-1 mb-1">Simülasyon Detayları</div>
                            <div className="flex justify-between">
                              <span className="text-[#2D2D2D]/70">Toplam TYT Neti:</span>
                              <span className="font-mono font-bold">{(yksNets.tytTurkce + yksNets.tytMatematik + (yksNets.tytTarih + yksNets.tytCografya + yksNets.tytFelsefe + yksNets.tytDin) + (yksNets.tytFizik + yksNets.tytKimya + yksNets.tytBiyoloji)).toFixed(2)} / 120</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#2D2D2D]/70">Toplam AYT Neti:</span>
                              <span className="font-mono font-bold">
                                {yksNets.track === 'sayisal' && (yksNets.aytMatematik + yksNets.aytFizik + yksNets.aytKimya + yksNets.aytBiyoloji).toFixed(2)}
                                {yksNets.track === 'esit-agirlik' && (yksNets.aytMatematik + yksNets.aytEdebiyat + yksNets.aytTarih1 + yksNets.aytCografya1).toFixed(2)}
                                {yksNets.track === 'sozel' && (yksNets.aytEdebiyat + yksNets.aytTarih1 + yksNets.aytCografya1 + yksNets.aytTarih2 + yksNets.aytCografya2 + yksNets.aytFelsefe + yksNets.aytDin).toFixed(2)}
                                {yksNets.track === 'dil' && yksNets.aytYdt.toFixed(2)}
                                {' / 80'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#2D2D2D]/70">OBP Katkısı (+0.6):</span>
                              <span className="font-mono font-bold text-[#C5A059]">+{(yksNets.obp * 0.6).toFixed(1)} Puan</span>
                            </div>
                            <div className="flex justify-between border-t border-dashed border-[#2D2D2D]/10 pt-1.5 mt-1 font-semibold">
                              <span>Puan Türü:</span>
                              <span className="uppercase text-[#C5A059]">
                                {yksNets.track === 'sayisal' ? 'Sayısal (SAY)' : yksNets.track === 'esit-agirlik' ? 'Eşit Ağırlık (EA)' : yksNets.track === 'sozel' ? 'Sözel (SÖZ)' : 'Yabancı Dil (DİL)'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 text-left">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-[#2D2D2D]/40 uppercase tracking-widest block">Simüle Edilen Sınav Puanı</span>
                            <div className="font-serif text-5xl text-[#2D2D2D]">{estimatedScore} <span className="text-sm font-sans font-normal text-[#2D2D2D]/40">/ 500</span></div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-[#2D2D2D]/40 uppercase tracking-widest block">Tahmini Yüzdelik Dilim</span>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C5A059]/10 text-[#C5A059] font-bold rounded-none text-xs">
                              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                              <span>{estimatedPercentile}</span>
                            </div>
                          </div>

                          <div className="border border-[#2D2D2D]/10 bg-white p-3.5 space-y-2 text-xs">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-[#2D2D2D]/5 pb-1 mb-1">LGS Simülasyon Detayları</div>
                            <div className="flex justify-between">
                              <span className="text-[#2D2D2D]/70">Sözel Net Toplamı:</span>
                              <span className="font-mono font-bold">{(lgsNets.turkce + lgsNets.inkilap + lgsNets.din + lgsNets.yabanci)} / 50</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#2D2D2D]/70">Sayısal Net Toplamı:</span>
                              <span className="font-mono font-bold">{(lgsNets.matematik + lgsNets.fen)} / 40</span>
                            </div>
                            <div className="flex justify-between border-t border-dashed border-[#2D2D2D]/10 pt-1.5 mt-1 font-semibold">
                              <span>Toplam Net:</span>
                              <span className="font-mono text-[#C5A059]">{(lgsNets.turkce + lgsNets.inkilap + lgsNets.din + lgsNets.yabanci + lgsNets.matematik + lgsNets.fen)} / 90</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="bg-white/45 border border-[#2D2D2D]/10 p-4 rounded-none text-left space-y-2">
                        <h5 className="font-serif italic text-sm text-[#2D2D2D] flex items-center gap-1">
                          <Info className="w-3.5 h-3.5 text-[#C5A059]" />
                          Gamze Tosun Tercih Önerisi:
                        </h5>
                        <p className="text-xs text-[#2D2D2D]/80 leading-relaxed">
                          {calcAdvice}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center py-12 text-[#2D2D2D]/40 space-y-3">
                      <Calculator className="w-12 h-12 mx-auto text-[#2D2D2D]/20 stroke-1" />
                      <p className="text-xs tracking-wide">
                        Netlerinizi ayarlayıp "Puan & Strateji Hesapla" butonuna tıklayarak simülasyonu başlatın.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WEEKLY STUDY PLANNER */}
          {activeTab === 'planner' && (
            <div id="tool-study-planner" className="p-6 sm:p-10 flex flex-col text-left">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-700 shrink-0">
                  <Calendar className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-extrabold text-xl text-slate-900">
                    Akıllı Ders Çalışma Programı Robotu
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Hedeflediğiniz sınavı ve ders yoğunluğunu seçerek kendinize özel, dengeli bir haftalık çalışma taslağı oluşturun.
                  </p>
                </div>
              </div>

              {/* Selection controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-stone-100 pb-6 mb-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Sınav Hedefi:</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setPlannerExam('yks'); setGeneratedPlan(null); }}
                      className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
                        plannerExam === 'yks'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold'
                          : 'bg-white border-stone-200 hover:bg-stone-50 text-slate-600'
                      }`}
                    >
                      YKS Sınav Kampı
                    </button>
                    <button
                      onClick={() => { setPlannerExam('lgs'); setGeneratedPlan(null); }}
                      className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
                        plannerExam === 'lgs'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold'
                          : 'bg-white border-stone-200 hover:bg-stone-50 text-slate-600'
                      }`}
                    >
                      LGS Sınav Kampı
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Günlük Çalışma Temposu:</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setPlannerLevel('light'); setGeneratedPlan(null); }}
                      className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
                        plannerLevel === 'light'
                          ? 'bg-amber-50 border-amber-600 text-amber-950 font-bold'
                          : 'bg-white border-stone-200 hover:bg-stone-50 text-slate-600'
                      }`}
                    >
                      Hafif (1-2 Saat)
                    </button>
                    <button
                      onClick={() => { setPlannerLevel('moderate'); setGeneratedPlan(null); }}
                      className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
                        plannerLevel === 'moderate'
                          ? 'bg-amber-50 border-amber-600 text-amber-950 font-bold'
                          : 'bg-white border-stone-200 hover:bg-stone-50 text-slate-600'
                      }`}
                    >
                      Orta (3-4 Saat)
                    </button>
                    <button
                      onClick={() => { setPlannerLevel('intense'); setGeneratedPlan(null); }}
                      className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
                        plannerLevel === 'intense'
                          ? 'bg-amber-50 border-amber-600 text-amber-950 font-bold'
                          : 'bg-white border-stone-200 hover:bg-stone-50 text-slate-600'
                      }`}
                    >
                      Yoğun (5-6 Saat)
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions & Result Display */}
              {generatedPlan ? (
                <div className="space-y-6">
                  {/* Copy Plan Bar */}
                  <div className="flex items-center justify-between bg-stone-50 border border-stone-200 p-4 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-600 rounded-full" />
                      <span className="text-xs sm:text-sm font-medium text-slate-700">Haftalık programınız başarıyla hazırlandı!</span>
                    </div>
                    <button
                      onClick={copyPlanToClipboard}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Kopyalandı!' : 'Tümünü Kopyala'}</span>
                    </button>
                  </div>

                  {/* Program grid */}
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                    {generatedPlan.map((d, idx) => (
                      <div key={idx} className="border border-stone-200 rounded-2xl p-4 bg-white shadow-sm flex flex-col space-y-3">
                        <div className="border-b border-stone-100 pb-1.5 text-center">
                          <span className="text-xs font-bold text-slate-800 block">{d.day}</span>
                        </div>
                        <div className="flex-1 space-y-2">
                          {d.tasks.map((task, tIdx) => (
                            <div key={tIdx} className="text-[11px] leading-tight text-slate-600 bg-stone-50 p-2 rounded-lg border border-stone-100 font-medium">
                              {task}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recommendation banner */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <h4 className="font-display font-bold text-slate-900 text-sm flex items-center justify-center sm:justify-start gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                        Bu Taslağı Birlikte Kişiselleştirelim
                      </h4>
                      <p className="text-xs text-slate-600 max-w-xl">
                        Standart programlar her öğrenciye tam uymaz. Gamze Tosun ile öğrenme biçiminize, zayıf olduğunuz derslere ve uyku saatlerinize göre tamamen size özel hale getirelim.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const el = document.getElementById('contact');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all whitespace-nowrap"
                    >
                      Bana Özel Revize Et
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 border-2 border-dashed border-stone-200 rounded-3xl text-center space-y-4 max-w-md mx-auto">
                  <Calendar className="w-12 h-12 mx-auto text-stone-300 stroke-1" />
                  <div className="space-y-1 px-4">
                    <h4 className="font-display font-bold text-slate-900 text-sm">Program Oluşturmaya Hazır</h4>
                    <p className="text-xs text-stone-500">
                      Parametreleri yukarıdan seçip aşağıdaki butona basarak haftalık dengeli ders çalışma çizelgenizi oluşturun.
                    </p>
                  </div>
                  <button
                    onClick={generatePlanner}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Haftalık Program Oluştur
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
