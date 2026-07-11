import React, { useState, useEffect, useRef } from 'react';
import { SPEED_TEST_TEXTS } from '../data';
import { 
  BookOpen, Calculator, Calendar, Play, CheckCircle2, 
  RotateCcw, Sparkles, ChevronRight, Copy, Check, Info, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function InteractiveTools() {
  const [activeTab, setActiveTab] = useState<'reading' | 'calculator' | 'planner'>('reading');

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
  const [yksNets, setYksNets] = useState({ turkce: 30, sosyal: 12, matematik: 28, fen: 10, obp: 85, track: 'sayisal' });
  const [lgsNets, setLgsNets] = useState({ turkce: 16, matematik: 12, fen: 15, inkilap: 9, din: 9, yabanci: 8 });
  const [estimatedScore, setEstimatedScore] = useState<number | null>(null);
  const [estimatedPercentile, setEstimatedPercentile] = useState<string | null>(null);
  const [calcAdvice, setCalcAdvice] = useState<string>('');

  const calculateScore = () => {
    if (calcExam === 'yks') {
      // Basic estimated scoring simulation (TYT score + OBP contribution)
      const tytNet = yksNets.turkce + yksNets.sosyal + yksNets.matematik + yksNets.fen;
      // Let's estimate a mock score mapping
      const baseScore = 150;
      const netScoreContribution = tytNet * 3.1;
      const obpContribution = yksNets.obp * 0.6;
      const score = Math.round(Math.min(baseScore + netScoreContribution + obpContribution, 500));
      setEstimatedScore(score);

      // Advisory & Percentiles
      if (score >= 430) {
        setEstimatedPercentile('%0.5 - %2.5');
        setCalcAdvice('Mükemmel bir başarı! Boğaziçi, ODTÜ, İTÜ, Hacettepe gibi seçkin üniversitelerin mühendislik veya tıp bölümleri için çok güçlü bir adaysınız. Tercih dönemini riske atmamak için Gamze Tosun ile stratejik lise/üniversite tercih danışmanlığı almanızı şiddetle tavsiye ederiz.');
      } else if (score >= 350) {
        setEstimatedPercentile('%3.0 - %8.5');
        setCalcAdvice('Çok iyi bir performans! Devlet üniversitelerinin popüler bölümlerine yerleşme olasılığınız oldukça yüksek. Doğru yerleştirme stratejisiyle hedefinize ulaşabilirsiniz. İletişim formundan ücretsiz ön görüşme talep edebilirsiniz.');
      } else {
        setEstimatedPercentile('%10.0 - %25.0');
        setCalcAdvice('İyi bir temeliniz var. Önümüzdeki aylarda netlerinizi artırmak için öğrenci koçluğu desteğiyle ders programınızı revize edebilir, eksiklerinizi hızla kapatabilirsiniz.');
      }
    } else {
      // LGS simulated scoring: MEB weights (Turkish: 4, Math: 4, Science: 4, others: 1)
      const rawWeight = (lgsNets.turkce * 4) + (lgsNets.matematik * 4) + (lgsNets.fen * 4) + (lgsNets.inkilap * 1) + (lgsNets.din * 1) + (lgsNets.yabanci * 1);
      const score = Math.round(Math.min(190 + (rawWeight * 1.25), 500));
      setEstimatedScore(score);

      if (score >= 460) {
        setEstimatedPercentile('%0.1 - %1.5');
        setCalcAdvice('Muazzam LGS performansı! Kabataş Erkek Lisesi, İstanbul Erkek Lisesi, Galatasaray Lisesi veya Ankara Fen Lisesi gibi en üst düzey okullar için yarıştasınız. Doğru tercih listesi hayatınızı belirleyecek, bizden mutlaka profesyonel destek alın.');
      } else if (score >= 380) {
        setEstimatedPercentile('%2.0 - %7.5');
        setCalcAdvice('Çok güçlü bir lise adayı. Nitelikli proje okulları ve Anadolu liseleri için harika bir yerdesiniz. Tercih dönemindeki kaymaları analiz etmek için hazırız.');
      } else {
        setEstimatedPercentile('%8.0 - %20.0');
        setCalcAdvice('İyi bir sonuç. Sınav maratonunu tamamladınız. Adrese dayalı veya yerel yerleştirme ile en nitelikli okulları seçmek için rehberlik alabilirsiniz.');
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
          <h2 className="text-3xl sm:text-4xl font-serif text-[#2D2D2D] tracking-tight">
            Akıllı İnteraktif Eğitim Araçlarımız
          </h2>
          <p className="text-[#2D2D2D]/80 text-sm sm:text-base leading-relaxed">
            Okuma hızınızı test edin, deneme netlerinizi puanlayın veya seviyenize en uygun haftalık ders çalışma planını anında ücretsiz oluşturun.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex justify-center mb-10">
          <div className="bg-[#2D2D2D]/5 p-1.5 rounded-none flex gap-1 border border-[#2D2D2D]/10 w-full max-w-lg">
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
            <button
              onClick={() => setActiveTab('planner')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === 'planner'
                  ? 'bg-white text-[#2D2D2D] border border-[#2D2D2D]/10 shadow-sm'
                  : 'text-[#2D2D2D]/60 hover:text-[#2D2D2D] hover:bg-white/45'
              }`}
            >
              <Calendar className="w-4 h-4 text-[#C5A059]" />
              <span>Ders Programı</span>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 flex justify-between">
                          <span>Türkçe Net (0-40):</span>
                          <span className="font-mono text-emerald-800 font-bold">{yksNets.turkce}</span>
                        </label>
                        <input 
                          type="range" min="0" max="40" step="1"
                          value={yksNets.turkce}
                          onChange={(e) => setYksNets({ ...yksNets, turkce: Number(e.target.value) })}
                          className="w-full accent-emerald-600 h-1.5 bg-stone-200 rounded-lg appearance-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 flex justify-between">
                          <span>Matematik Net (0-40):</span>
                          <span className="font-mono text-emerald-800 font-bold">{yksNets.matematik}</span>
                        </label>
                        <input 
                          type="range" min="0" max="40" step="1"
                          value={yksNets.matematik}
                          onChange={(e) => setYksNets({ ...yksNets, matematik: Number(e.target.value) })}
                          className="w-full accent-emerald-600 h-1.5 bg-stone-200 rounded-lg appearance-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 flex justify-between">
                          <span>Fen Bilimleri Net (0-20):</span>
                          <span className="font-mono text-emerald-800 font-bold">{yksNets.fen}</span>
                        </label>
                        <input 
                          type="range" min="0" max="20" step="1"
                          value={yksNets.fen}
                          onChange={(e) => setYksNets({ ...yksNets, fen: Number(e.target.value) })}
                          className="w-full accent-emerald-600 h-1.5 bg-stone-200 rounded-lg appearance-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 flex justify-between">
                          <span>Sosyal Bilimler Net (0-20):</span>
                          <span className="font-mono text-emerald-800 font-bold">{yksNets.sosyal}</span>
                        </label>
                        <input 
                          type="range" min="0" max="20" step="1"
                          value={yksNets.sosyal}
                          onChange={(e) => setYksNets({ ...yksNets, sosyal: Number(e.target.value) })}
                          className="w-full accent-emerald-600 h-1.5 bg-stone-200 rounded-lg appearance-none"
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-semibold text-slate-500 flex justify-between">
                          <span>Ortaöğretim Başarı Puanı (OBP - 50-100):</span>
                          <span className="font-mono text-emerald-800 font-bold">{yksNets.obp}</span>
                        </label>
                        <input 
                          type="range" min="50" max="100" step="1"
                          value={yksNets.obp}
                          onChange={(e) => setYksNets({ ...yksNets, obp: Number(e.target.value) })}
                          className="w-full accent-emerald-600 h-1.5 bg-stone-200 rounded-lg appearance-none"
                        />
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
