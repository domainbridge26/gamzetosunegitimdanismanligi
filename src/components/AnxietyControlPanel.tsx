import React, { useState, useEffect, useRef } from 'react';
import { 
  HeartPulse, Wind, Eye, Smile, Activity, RotateCcw, Play, Pause, 
  CheckCircle2, Zap, Brain, Palette, Circle, Feather, Shield, Volume2, 
  VolumeX, RefreshCw, Send, Check, Sparkles, HelpCircle, Flame, Target,
  Maximize2, Minimize2, Grid, ChevronRight, X, Award
} from 'lucide-react';

interface AnxietyControlPanelProps {
  onSaveExerciseLog?: (log: { exerciseTitle: string; durationSeconds: number; score: number; details?: string }) => void;
  studentName?: string;
  onClose?: () => void;
}

export default function AnxietyControlPanel({ onSaveExerciseLog, studentName, onClose }: AnxietyControlPanelProps) {
  const [activeTab, setActiveTab] = useState<
    | '54321' 
    | 'box-breathing' 
    | 'long-exhale' 
    | 'muscle-relaxation' 
    | 'color-game' 
    | 'countdown' 
    | 'focal-point'
    | 'butterfly-hug'
  >('54321');

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Audio effect generator using Web Audio API
  const [isSoundOn, setIsSoundOn] = useState(true);

  const playChime = (freq = 440, type: OscillatorType = 'sine', duration = 0.4) => {
    if (!isSoundOn) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio fallback
    }
  };

  // Sound play for 5-4-3-2-1 Auditory Step
  const playSensorySound = (soundType: 'ocean' | 'birds' | 'chime') => {
    if (!isSoundOn) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (soundType === 'ocean') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1.2);
        osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 2.5);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 1.2);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 2.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 2.5);
      } else if (soundType === 'birds') {
        [528, 660, 792, 1056].forEach((f, idx) => {
          setTimeout(() => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, ctx.currentTime);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
          }, idx * 250);
        });
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(639, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 2.0);
      }
    } catch (e) {}
  };

  /* ========================================================================= */
  /* 1. 5-4-3-2-1 DUYU EGZERSİZİ STATE (Görsel & Geometrik Çoktan Seçmeli)      */
  /* ========================================================================= */
  const [senseStep, setSenseStep] = useState<0 | 1 | 2 | 3 | 4 | 5>(0); // 0: Gör (5), 1: Dokun (4), 2: Duy (3), 3: Koku (2), 4: Tat (1), 5: Bitti
  const [senseSubIndex, setSenseSubIndex] = useState(0);
  const [senseScore, setSenseScore] = useState(0);
  const [senseFeedback, setSenseFeedback] = useState<{ isCorrect: boolean; msg: string } | null>(null);

  // 5 ŞEY GÖR Data (Geometrik Şekiller ve Renkler)
  const seeItems = [
    { title: '1. Geometrik Görsel: Mavi Altıgen & Yeşil Daire', q: 'Ekranda yer alan MAVİ ALTIGEN simgesinin yanındaki geometrik şekil hangisidir?', options: ['Yeşil Daire', 'Kırmızı Kare', 'Sarı Üçgen', 'Mor Yıldız'], correct: 'Yeşil Daire', hint: 'Sol taraftaki Mavi Altıgen ve sağındaki Yeşil Daire' },
    { title: '2. Geometrik Görsel: Kırmızı Kare & Sarı Üçgen', q: 'KIRMIZI KARE içerisinde konumlandırılmış ana geometrik simge hangisidir?', options: ['Sarı Üçgen', 'Mavi Daire', 'Turuncu Yıldız', 'Yeşil Beşgen'], correct: 'Sarı Üçgen', hint: 'Kırmızı karenin tam merkezindeki Sarı Üçgen' },
    { title: '3. Geometrik Görsel: Altın Yıldız & Mor Halka', q: 'Işıldayan ALTIN YILDIZ figürünü çevreleyen halkanın rengi nedir?', options: ['Mor Halka', 'Yeşil Kare', 'Mavi Altıgen', 'Siyah Üçgen'], correct: 'Mor Halka', hint: 'Merkezdeki Altın Yıldız ve dışındaki Mor Halka' },
    { title: '4. Geometrik Görsel: Turuncu Beşgen & Turkuaz Çizgi', q: 'TURUNCU BEŞGEN geometrik formunun kesişim noktasındaki detay hangisidir?', options: ['Turkuaz Çizgi', 'Beyaz Daire', 'Gri Dikdörtgen', 'Pembe Yıldız'], correct: 'Turkuaz Çizgi', hint: 'Beşgenin ortasından geçen Turkuaz Çizgi' },
    { title: '5. Geometrik Görsel: Zümrüt Yeşil Baklava & Pembe Küre', q: 'ZÜMRÜT YEŞİLİ BAKLAVA DİLİMİ figürünü tamamlayan geometrik cisim hangisidir?', options: ['Pembe Küre', 'Mavi Kare', 'Sarı Üçgen', 'Kırmızı Çember'], correct: 'Pembe Küre', hint: 'Baklava diliminin altındaki Pembe Küre' }
  ];

  // 4 ŞEYE DOKUN Data
  const touchItems = [
    { title: '1. Doku: Yumuşak Kadife / Pamuk', q: 'Parmak uçlarınızın kadife dokusunda hissettiği duygu:', options: ['İpeksi Yumuşaklık', 'Sıcak Dokunuş', 'Hafif Pürüz', 'Esneklik'], correct: 'İpeksi Yumuşaklık' },
    { title: '2. Doku: Soğuk Kristal Cam', q: 'Avucunuzun içindeki soğuk pürüzsüz camın hissi:', options: ['Ferahlatıcı Soğukluk', 'Sertlik & Netlik', 'Kaygan Yüzey', 'Denge'], correct: 'Ferahlatıcı Soğukluk' },
    { title: '3. Doku: Doğal Sıcak Ahşap', q: 'Ahşap yüzeydeki doğal damarların parmağınızdaki hissi:', options: ['Organik Sıcaklık', 'Hafif Damar Doku', 'Güven & Sağlamlık', 'Mat Yüzey'], correct: 'Organik Sıcaklık' },
    { title: '4. Doku: Serin Deniz Çakıl Taşı', q: 'Deniz suyunun yuvarladığı pürüzsüz taşın elinizdeki hissi:', options: ['Pürüzsüz Dairesellik', 'Doğal Serinlik', 'Ağırlık Hissi', 'Huzur'], correct: 'Pürüzsüz Dairesellik' }
  ];

  // 3 SES DUY Data
  const hearItems = [
    { title: '1. Ses: Okyanus Dalgası & Rüzgar (432 Hz)', soundType: 'ocean' as const, q: 'Dinlediğiniz okyanus sesinin zihninizde yarattığı etki:', options: ['Ritmik Nefes Akışı', 'Ferahlatıcı Rüzgar', 'Derin Dinginlik', 'Sonsuzluk Hissi'], correct: 'Ritmik Nefes Akışı' },
    { title: '2. Ses: Orman Kuşları & Rüzgar (528 Hz)', soundType: 'birds' as const, q: 'Orman kuşlarının cıvıltısında fark edilen duygu:', options: ['Doğal Canlılık & Huzur', 'Taze Bahar Havası', 'Yaprak Hışırtısı', 'Neşe'], correct: 'Doğal Canlılık & Huzur' },
    { title: '3. Ses: Tibet Şifa Çanı (639 Hz)', soundType: 'chime' as const, q: 'Çan sesinin kulaklarınızda çınlayan titreşim etkisi:', options: ['Berrak Zihinsel Odak', 'Yavaşlayan Kalp Atışı', 'Derin Gevşeme', 'Zamanın Durması'], correct: 'Berrak Zihinsel Odak' }
  ];

  // 2 KOKU FARK ET Data
  const smellItems = [
    { title: '1. Koku: Taze Lavanta & Yağmur Sonrası Toprak', q: 'Yağmur sonrası lavanta tarlasının burnunuzdaki aromatik etkisi:', options: ['Ferah Latif Koku', 'Toprak Esintisi', 'Rahatlatıcı Çiçek', 'Tazelik'], correct: 'Ferah Latif Koku' },
    { title: '2. Koku: Taze Nane Yaprağı & Limon Kabuğu', q: 'Ezilmiş nane ve limon kabuğunun nefesinizdeki hissi:', options: ['Canlandırıcı Nane Serinliği', 'Narenciye Kokusu', 'Uyanık Zihin', 'Keskin Tazelik'], correct: 'Canlandırıcı Nane Serinliği' }
  ];

  // 1 TAT HİSSET Data
  const tasteItems = [
    { title: '1. Tat: Bitter Çikolata & Bal Dokunuşu', q: 'Dilinizin üzerinde eriyen kakao ve balın bıraktığı tat:', options: ['Yoğun Tatlı Bitter Dengesi', 'Kadifemsi Bal Tadı', 'Kalıcı Lezzet', 'Hafif Sıcaklık'], correct: 'Yoğun Tatlı Bitter Dengesi' }
  ];

  const handleSenseAnswer = (answer: string, correct: string) => {
    if (senseFeedback !== null) return;
    if (answer === correct) {
      setSenseScore(prev => prev + 1);
      setSenseFeedback({ isCorrect: true, msg: '🎉 Harika! Duyu odağınız tam ve berrak.' });
      playChime(600, 'sine', 0.3);
    } else {
      setSenseFeedback({ isCorrect: false, msg: `Doğrulandı: Doğru duyu odağı "${correct}" seçeneğidir.` });
      playChime(350, 'sine', 0.2);
    }
  };

  const nextSenseSubItem = () => {
    setSenseFeedback(null);
    if (senseStep === 0) {
      if (senseSubIndex + 1 < seeItems.length) setSenseSubIndex(prev => prev + 1);
      else { setSenseStep(1); setSenseSubIndex(0); }
    } else if (senseStep === 1) {
      if (senseSubIndex + 1 < touchItems.length) setSenseSubIndex(prev => prev + 1);
      else { setSenseStep(2); setSenseSubIndex(0); }
    } else if (senseStep === 2) {
      if (senseSubIndex + 1 < hearItems.length) setSenseSubIndex(prev => prev + 1);
      else { setSenseStep(3); setSenseSubIndex(0); }
    } else if (senseStep === 3) {
      if (senseSubIndex + 1 < smellItems.length) setSenseSubIndex(prev => prev + 1);
      else { setSenseStep(4); setSenseSubIndex(0); }
    } else if (senseStep === 4) {
      setSenseStep(5);
    }
  };

  /* ========================================================================= */
  /* 2. KUTU NEFESİ (BOX BREATHING) STATE                                       */
  /* ========================================================================= */
  const [boxActive, setBoxActive] = useState(false);
  const [boxPhase, setBoxPhase] = useState<'Inhale' | 'HoldIn' | 'Exhale' | 'HoldOut'>('Inhale');
  const [boxTimer, setBoxTimer] = useState(4);
  const [boxRounds, setBoxRounds] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (boxActive) {
      interval = setInterval(() => {
        setBoxTimer(prev => {
          if (prev > 1) return prev - 1;
          setBoxPhase(curr => {
            if (curr === 'Inhale') { playChime(523.25, 'sine', 0.5); return 'HoldIn'; } 
            else if (curr === 'HoldIn') { playChime(440, 'sine', 0.5); return 'Exhale'; } 
            else if (curr === 'Exhale') { playChime(349.23, 'sine', 0.5); return 'HoldOut'; } 
            else { playChime(659.25, 'sine', 0.5); setBoxRounds(r => r + 1); return 'Inhale'; }
          });
          return 4;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [boxActive, boxPhase]);

  /* ========================================================================= */
  /* 3. UZUN NEFES VERME TEKNİĞİ STATE                                          */
  /* ========================================================================= */
  const [longBreathingActive, setLongBreathingActive] = useState(false);
  const [longExhaleDuration, setLongExhaleDuration] = useState(7);
  const [longPhase, setLongPhase] = useState<'Inhale' | 'Exhale'>('Inhale');
  const [longTimer, setLongTimer] = useState(4);
  const [longRounds, setLongRounds] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (longBreathingActive) {
      interval = setInterval(() => {
        setLongTimer(prev => {
          if (prev > 1) return prev - 1;
          if (longPhase === 'Inhale') {
            setLongPhase('Exhale');
            playChime(392, 'sine', 0.6);
            return longExhaleDuration;
          } else {
            setLongPhase('Inhale');
            setLongRounds(r => r + 1);
            playChime(587.33, 'sine', 0.6);
            return 4;
          }
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [longBreathingActive, longPhase, longExhaleDuration]);

  /* ========================================================================= */
  /* 4. KAS GEVŞETME EGZERSİZİ STATE                                            */
  /* ========================================================================= */
  const muscleSteps = [
    { title: '1. Eller ve Kollar', desc: 'Ellerini yumruk yap, 5 saniye tüm gücünle sık. Ardından serbest bırak ve parmaklarındaki gevşemeyi hisset.', duration: 5 },
    { title: '2. Omuzlar ve Boyun', desc: 'Omuzlarını kulaklarına doğru 5 saniye yukarı çek ve kas. Sonra birden bırak, gerginliğin aktığını hisset.', duration: 5 },
    { title: '3. Yüz ve Çene', desc: 'Gözlerini kapat, dişlerini ve yüzünü 5 saniye sık. Ardından tüm yüz kaslarını tamamen serbest bırak.', duration: 5 },
    { title: '4. Karın ve Göğüs', desc: 'Derin nefes alıp karın kaslarını 5 saniye sıkı tut. Nefesini verirken karın kaslarının tamamen gevşemesine izin ver.', duration: 5 },
    { title: '5. Bacaklar ve Ayaklar', desc: 'Ayak parmaklarını öne doğru ger ve bacaklarını 5 saniye kas. Sonra gevşet ve tüm vücudundaki hafifliği hisset.', duration: 5 }
  ];
  const [currentMuscleStep, setCurrentMuscleStep] = useState(0);
  const [muscleTimer, setMuscleTimer] = useState(5);
  const [isTensePhase, setIsTensePhase] = useState(true);
  const [muscleActive, setMuscleActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (muscleActive) {
      interval = setInterval(() => {
        setMuscleTimer(prev => {
          if (prev > 1) return prev - 1;
          if (isTensePhase) {
            setIsTensePhase(false);
            playChime(330, 'triangle', 0.5);
            return 8;
          } else {
            setIsTensePhase(true);
            playChime(660, 'sine', 0.5);
            if (currentMuscleStep < muscleSteps.length - 1) {
              setCurrentMuscleStep(s => s + 1);
            } else {
              setMuscleActive(false);
            }
            return 5;
          }
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [muscleActive, isTensePhase, currentMuscleStep]);

  /* ========================================================================= */
  /* 5. RENK & GÖRSEL BULMA OYUNU STATE (Görselli & Çoktan Seçmeli)             */
  /* ========================================================================= */
  const colorVisualTasks = [
    {
      id: 'flower-garden',
      title: 'Doğa & Çiçek Bahçesi Görseli',
      question: 'Görseldeki çiçek bahçesinde kaç adet MAVİ renkli çiçek yer almaktadır?',
      options: ['2 Adet', '4 Adet', '3 Adet', '5 Adet'],
      correct: '4 Adet',
      bgType: 'garden'
    },
    {
      id: 'geometric-art',
      title: 'Geometrik Desen & Renkler',
      question: 'Görselin tam merkezinde yer alan geometrik yıldızın ana rengi hangisidir?',
      options: ['Altın Sarısı', 'Turkuaz Mavi', 'Parlak Pembe', 'Koyu Mor'],
      correct: 'Altın Sarısı',
      bgType: 'geo'
    },
    {
      id: 'night-sky',
      title: 'Gece Gökyüzü & Evler Görseli',
      question: 'Kırmızı çatılı evlerin yanında yer alan ağaçların rengi hangisidir?',
      options: ['Canlı Yeşil', 'Açık Sarı', 'Koyu Mor', 'Turuncu'],
      correct: 'Canlı Yeşil',
      bgType: 'night'
    },
    {
      id: 'ocean-life',
      title: 'Denizaltı Dünyası Görseli',
      question: 'Görselde yüzen turuncu renkli balıkların toplam sayısı kaçtır?',
      options: ['3 Balık', '5 Balık', '4 Balık', '2 Balık'],
      correct: '3 Balık',
      bgType: 'ocean'
    },
    {
      id: 'balloons',
      title: 'Balon Gökyüzü Görseli',
      question: 'Gökyüzünde en yüksekte süzülen sıcak hava balonunun ana rengi hangisidir?',
      options: ['Turkuaz', 'Eflatun', 'Parlak Sarı', 'Kiremit Kırmızı'],
      correct: 'Turkuaz',
      bgType: 'balloon'
    }
  ];

  const [colorTaskIdx, setColorTaskIdx] = useState(0);
  const [selectedColorOpt, setSelectedColorOpt] = useState<string | null>(null);
  const [colorGameScore, setColorGameScore] = useState(0);
  const [colorFeedback, setColorFeedback] = useState<{ isCorrect: boolean; msg: string } | null>(null);

  const handleColorChoiceSelect = (choice: string) => {
    if (selectedColorOpt !== null) return;
    setSelectedColorOpt(choice);
    const currentTask = colorVisualTasks[colorTaskIdx];
    if (choice === currentTask.correct) {
      setColorGameScore(prev => prev + 1);
      setColorFeedback({ isCorrect: true, msg: '✨ Doğru Teşhis! Dikkatiniz yüksek seviyede.' });
      playChime(650, 'sine', 0.4);
    } else {
      setColorFeedback({ isCorrect: false, msg: `❌ Hatalı. Görseldeki doğru yanıt "${currentTask.correct}" idi.` });
      playChime(300, 'sawtooth', 0.3);
    }
  };

  const nextColorTask = () => {
    setSelectedColorOpt(null);
    setColorFeedback(null);
    setColorTaskIdx(prev => (prev + 1) % colorVisualTasks.length);
  };

  /* ========================================================================= */
  /* 6. 100’DEN GERİ SAYMA STATE (3'er, 5'er, 7'şer & Tıklamalı Sayılar)       */
  /* ========================================================================= */
  const [countdownStep, setCountdownStep] = useState<3 | 5 | 7>(7);
  const [currentNum, setCurrentNum] = useState(100);
  const [countdownScore, setCountdownScore] = useState(0);
  const [countdownOptions, setCountdownOptions] = useState<number[]>([]);
  const [countdownFeedback, setCountdownFeedback] = useState<string>('');

  // Generate 4 clickable number options (1 correct, 3 distractors)
  const generateCountdownChoices = (startNum: number, step: number) => {
    const correctNext = startNum - step;
    if (correctNext <= 0) {
      setCountdownOptions([]);
      return;
    }
    const distractors = new Set<number>();
    distractors.add(correctNext + 1);
    distractors.add(correctNext - 2);
    distractors.add(correctNext + 2);
    distractors.add(correctNext - 1);

    const distractorArr = Array.from(distractors).filter(n => n > 0 && n !== correctNext).slice(0, 3);
    const choices = [correctNext, ...distractorArr].sort(() => Math.random() - 0.5);
    setCountdownOptions(choices);
  };

  useEffect(() => {
    generateCountdownChoices(currentNum, countdownStep);
  }, [currentNum, countdownStep]);

  const handleCountdownClick = (clickedNum: number) => {
    const expected = currentNum - countdownStep;
    if (clickedNum === expected) {
      setCurrentNum(expected);
      setCountdownScore(s => s + 1);
      setCountdownFeedback('✨ Harika! Doğru sayıya tıkladınız.');
      playChime(500 + (100 - expected) * 4, 'sine', 0.2);
    } else {
      setCountdownFeedback(`❌ Yanlış! Doğru bir sonraki sayı ${expected} idi.`);
      playChime(260, 'sawtooth', 0.3);
    }
  };

  /* ========================================================================= */
  /* 7. MANDALA BOYAMA & SANAT TERAPİSİ STATE                                 */
  /* ========================================================================= */
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedColor, setSelectedColor] = useState('#C5A059');
  const [brushSize, setBrushSize] = useState(4);
  const [isSymmetry, setIsSymmetry] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;

    const cx = width / 2;
    const cy = height / 2;

    for (let r = 30; r <= 150; r += 30) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 4) * i;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * 160, cy + Math.sin(angle) * 160);
      ctx.stroke();
    }
  }, [activeTab]);

  const drawMandalaPoint = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const mouseX = x - rect.left;
    const mouseY = y - rect.top;

    ctx.fillStyle = selectedColor;

    if (isSymmetry) {
      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      for (let i = 0; i < 8; i++) {
        const symAngle = angle + (Math.PI / 4) * i;
        const px = cx + Math.cos(symAngle) * dist;
        const py = cy + Math.sin(symAngle) * dist;

        ctx.beginPath();
        ctx.arc(px, py, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();

        const mirAngle = -angle + (Math.PI / 4) * i;
        const mpx = cx + Math.cos(mirAngle) * dist;
        const mpy = cy + Math.sin(mirAngle) * dist;

        ctx.beginPath();
        ctx.arc(mpx, mpy, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const clearMandala = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  /* ========================================================================= */
  /* 8. DİKKAT NOKTASI EGZERSİZİ STATE                                         */
  /* ========================================================================= */
  const [focalActive, setFocalActive] = useState(false);
  const [focalTimeLeft, setFocalTimeLeft] = useState(90);

  useEffect(() => {
    let interval: any = null;
    if (focalActive) {
      interval = setInterval(() => {
        setFocalTimeLeft(prev => {
          if (prev <= 1) {
            setFocalActive(false);
            playChime(783.99, 'sine', 1.0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [focalActive]);

  /* ========================================================================= */
  /* 9. KELEBEK KUCAKLAŞMASI (BUTTERFLY HUG) STATE                              */
  /* ========================================================================= */
  const [butterflyActive, setButterflyActive] = useState(false);
  const [butterflySide, setButterflySide] = useState<'left' | 'right'>('left');
  const [butterflyCount, setButterflyCount] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (butterflyActive) {
      interval = setInterval(() => {
        setButterflySide(s => (s === 'left' ? 'right' : 'left'));
        setButterflyCount(c => c + 1);
        const pitch = butterflySide === 'left' ? 329.63 : 392.00;
        playChime(pitch, 'sine', 0.2);
      }, 1200);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [butterflyActive, butterflySide]);

  /* ========================================================================= */
  /* 10. KAYGI BALONU SÖNDÜRME STATE                                           */
  /* ========================================================================= */
  const [worryText, setWorryText] = useState('');
  const [balloonFloating, setBalloonFloating] = useState(false);
  const [balloonHistory, setBalloonHistory] = useState<string[]>([]);

  const handleReleaseBalloon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!worryText.trim()) return;
    setBalloonFloating(true);
    playChime(523, 'sine', 0.8);
    setTimeout(() => {
      setBalloonHistory(prev => [worryText.trim(), ...prev]);
      setWorryText('');
      setBalloonFloating(false);
    }, 2800);
  };

  const exerciseList = [
    { id: '54321', title: '1. 5-4-3-2-1 Duyu Egzersizi', desc: 'Geometrik görsel, işitsel, dokunsal çoktan seçmeli topraklanma', icon: Eye, color: 'text-amber-500', cat: 'Çoklu Duyu' },
    { id: 'box-breathing', title: '2. Kutu Nefesi (Box Breathing)', desc: '4x4x4x4 ritmi ile nabzı yavaşlatma', icon: Wind, color: 'text-blue-500', cat: 'Nefes' },
    { id: 'long-exhale', title: '3. Uzun Nefes Verme', desc: 'Parasempatik sinir sistemini aktif eden gevşeme', icon: Activity, color: 'text-emerald-500', cat: 'Nefes' },
    { id: 'muscle-relaxation', title: '4. Kas Gevşetme (PMR)', desc: 'Fiziksel gerginliği sırayla serbest bırakma', icon: Flame, color: 'text-rose-500', cat: 'Beden' },
    { id: 'color-game', title: '5. Renk & Görsel Bulma Oyunu', desc: 'Geometrik görsellerdeki detayları çoktan seçmeli teşhis etme', icon: Palette, color: 'text-purple-500', cat: 'Görsel Odak' },
    { id: 'countdown', title: '6. 100’den Geri Sayma (3, 5, 7)', desc: 'Ekrandaki sayılara tıklayarak zihinsel odaklanma', icon: Brain, color: 'text-teal-500', cat: 'Zihin' },
    { id: 'focal-point', title: '7. Dikkat Noktası', desc: 'Zihinsel dalgalanmaları durduran odak küresi', icon: Target, color: 'text-indigo-500', cat: 'Meditasyon' },
    { id: 'butterfly-hug', title: '8. Kelebek Kucaklaşması', desc: 'EMDR duyusal omurga & omuz dokunuşu', icon: Feather, color: 'text-[#C5A059]', cat: 'Dokunsal' },
  ];

  return (
    <div className={`bg-[#FAF6EE] flex flex-col transition-all duration-300 ${
      isFullScreen 
        ? 'fixed inset-0 z-[100] h-screen w-screen overflow-y-auto' 
        : 'h-full w-full overflow-hidden'
    }`}>
      
      {/* Top Header Bar */}
      <div className="bg-[#2D2D2D] text-white px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-[#C5A059]/30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#C5A059] text-stone-950 font-bold shadow">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-base sm:text-lg text-white tracking-wide">
                KAYGINI KONTROL ET & SAKİNLEŞME EGZERSİZLERİ
              </h2>
              <span className="text-[10px] font-sans font-extrabold bg-emerald-500 text-stone-950 px-2 py-0.5 uppercase tracking-wider hidden sm:inline-block">
                EĞİTMAN ÖZEL
              </span>
            </div>
            <p className="text-stone-300 text-[11px] sm:text-xs">
              Sınav ve ders öncesi kaygıyı düşüren bilimsel çok duyulu egzersizler.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Exercise List Selection Drawer Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="px-3 py-1.5 text-xs font-bold bg-[#C5A059] hover:bg-[#b08d4b] text-stone-950 flex items-center gap-1.5 transition-all cursor-pointer shadow"
          >
            <Grid className="w-4 h-4" />
            <span>Egzersiz Listesi</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              setIsSoundOn(!isSoundOn);
              playChime(440, 'sine', 0.2);
            }}
            className={`px-3 py-1.5 text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              isSoundOn 
                ? 'bg-[#C5A059]/20 border-[#C5A059] text-amber-300' 
                : 'bg-stone-800 border-stone-700 text-stone-400'
            }`}
          >
            {isSoundOn ? <Volume2 className="w-3.5 h-3.5 text-[#C5A059]" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isSoundOn ? 'Ses Açık' : 'Sessiz'}</span>
          </button>

          {/* Fullscreen Modal Toggle */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="px-3 py-1.5 text-xs font-bold bg-stone-700 hover:bg-stone-600 text-white border border-stone-600 flex items-center gap-1.5 transition-all cursor-pointer"
            title={isFullScreen ? 'Normal Ekran' : 'Tam Ekran'}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullScreen ? 'Küçült' : 'Tam Ekran'}</span>
          </button>
        </div>
      </div>

      {/* Exercise Selection Grid Drawer (Overlay Modal if Open) */}
      {isMenuOpen && (
        <div className="bg-stone-900/95 text-white p-4 sm:p-6 border-b border-[#C5A059]/40 z-50 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
            <h3 className="font-serif font-bold text-base text-[#C5A059] flex items-center gap-2">
              <Grid className="w-5 h-5 text-[#C5A059]" />
              <span>EGZERSİZ SEÇİM LİSTESİ (TÜM EGZERSİZLER)</span>
            </h3>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-1 hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {exerciseList.map((ex) => {
              const IconComp = ex.icon;
              const isActive = activeTab === ex.id;
              return (
                <button
                  key={ex.id}
                  onClick={() => {
                    setActiveTab(ex.id as any);
                    setIsMenuOpen(false);
                    playChime(550, 'sine', 0.2);
                  }}
                  className={`p-3 text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    isActive 
                      ? 'bg-[#C5A059] text-stone-950 border-[#C5A059] font-bold shadow-lg scale-102' 
                      : 'bg-stone-800/80 text-white border-stone-700 hover:border-[#C5A059] hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <IconComp className={`w-5 h-5 ${isActive ? 'text-stone-950' : ex.color}`} />
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 border ${
                      isActive ? 'bg-stone-950 text-[#C5A059] border-stone-950' : 'bg-stone-900 text-stone-300 border-stone-700'
                    }`}>
                      {ex.cat}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-snug">{ex.title}</h4>
                    <p className={`text-[10px] mt-1 line-clamp-2 ${isActive ? 'text-stone-900' : 'text-stone-400'}`}>
                      {ex.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Horizontal Tabs Bar (Compact / Scrollable) */}
      <div className="bg-stone-200/90 border-b border-stone-300 px-3 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0">
        {exerciseList.map((ex) => {
          const IconComp = ex.icon;
          const isActive = activeTab === ex.id;
          return (
            <button
              key={ex.id}
              onClick={() => {
                setActiveTab(ex.id as any);
                playChime(520, 'sine', 0.2);
              }}
              className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-[#2D2D2D] text-white border-[#2D2D2D] shadow'
                  : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
              }`}
            >
              <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-[#C5A059]' : ex.color}`} />
              <span>{ex.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Content Area (Scrollable & Responsive) */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6">
        
        {/* ========================================================================= */}
        {/* TAB 1: 5-4-3-2-1 DUYU EGZERSİZİ (Çoktan Seçmeli Multi-Sensory)           */}
        {/* ========================================================================= */}
        {activeTab === '54321' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-white border border-stone-200 p-4 sm:p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-600 border border-amber-200">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#2D2D2D]">
                    5-4-3-2-1 Topraklanma (Grounding) Duyu Egzersizi
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Görseller, dokunsal uyaranlar ve özel frekanslı sesler eşliğinde çoktan seçmeli duyu odağı sorularını yanıtlayarak zihninizi tamamen şu ana getirin.
                  </p>
                </div>
              </div>

              {/* Step indicator bar */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-xs font-bold">
                <span className="text-[#C5A059] uppercase tracking-wider">
                  {senseStep === 0 && '👁️ Aşama 1: 5 Şey Gör'}
                  {senseStep === 1 && '✋ Aşama 2: 4 Şeye Dokun'}
                  {senseStep === 2 && '🔊 Aşama 3: 3 Ses Duy'}
                  {senseStep === 3 && '🌸 Aşama 4: 2 Koku Fark Et'}
                  {senseStep === 4 && '🍯 Aşama 5: 1 Tat Hisset'}
                  {senseStep === 5 && '🏆 Egzersiz Tamamlandı'}
                </span>
                <span className="font-mono text-stone-500 bg-stone-100 px-2 py-0.5 border">
                  Puan: {senseScore} / 15
                </span>
              </div>
            </div>

            {/* STEP 0: 5 ŞEY GÖR */}
            {senseStep === 0 && seeItems[senseSubIndex] && (
              <div className="bg-white border border-stone-200 p-5 shadow-sm space-y-4 text-center">
                <div className="flex items-center justify-between border-b pb-2 text-xs font-bold">
                  <span className="text-amber-600 font-serif">5 ŞEY GÖR ({senseSubIndex + 1} / 5)</span>
                  <span className="text-stone-400 font-mono">{seeItems[senseSubIndex].title}</span>
                </div>

                {/* Inline SVG Visual Art Frame */}
                <div className="w-full h-48 sm:h-56 bg-gradient-to-br from-slate-900 via-indigo-950 to-stone-900 border border-stone-300 flex items-center justify-center p-4 relative overflow-hidden shadow-inner">
                  <svg className="w-full h-full max-w-sm" viewBox="0 0 300 160">
                    <circle cx="150" cy="80" r="50" fill="none" stroke="#C5A059" strokeWidth="2" opacity="0.6" />
                    <circle cx="150" cy="80" r="30" fill="#C5A059" opacity="0.2" />
                    <path d="M50 130 L100 60 L150 130 Z" fill="#3B82F6" opacity="0.4" />
                    <path d="M150 130 L200 40 L250 130 Z" fill="#10B981" opacity="0.4" />
                    <circle cx="70" cy="40" r="8" fill="#F59E0B" />
                    <line x1="0" y1="130" x2="300" y2="130" stroke="#E2E8F0" strokeWidth="2" />
                  </svg>
                  <span className="absolute bottom-2 right-2 text-[10px] font-mono text-amber-300 bg-black/60 px-2 py-0.5">
                    {seeItems[senseSubIndex].title}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-base text-[#2D2D2D]">{seeItems[senseSubIndex].q}</h4>
                  <p className="text-xs text-stone-500 italic">İpucu: {seeItems[senseSubIndex].hint}</p>
                </div>

                {/* Multiple choice options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {seeItems[senseSubIndex].options.map((opt, idx) => (
                    <button
                      key={idx}
                      disabled={senseFeedback !== null}
                      onClick={() => handleSenseAnswer(opt, seeItems[senseSubIndex].correct)}
                      className="p-3 text-xs font-bold border border-stone-300 bg-stone-50 hover:bg-[#C5A059]/10 hover:border-[#C5A059] transition-all cursor-pointer text-[#2D2D2D]"
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {senseFeedback && (
                  <div className={`p-3 border text-xs font-bold space-y-2 ${
                    senseFeedback.isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'
                  }`}>
                    <p>{senseFeedback.msg}</p>
                    <button
                      onClick={nextSenseSubItem}
                      className="px-4 py-2 bg-[#2D2D2D] hover:bg-[#C5A059] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow"
                    >
                      Sonraki Görsel ➔
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 1: 4 ŞEYE DOKUN */}
            {senseStep === 1 && touchItems[senseSubIndex] && (
              <div className="bg-white border border-stone-200 p-5 shadow-sm space-y-4 text-center">
                <div className="flex items-center justify-between border-b pb-2 text-xs font-bold">
                  <span className="text-emerald-600 font-serif">4 ŞEYE DOKUN ({senseSubIndex + 1} / 4)</span>
                  <span className="text-stone-400 font-mono">{touchItems[senseSubIndex].title}</span>
                </div>

                <div className="p-6 bg-emerald-50/50 border border-emerald-200 space-y-2">
                  <span className="text-3xl">✋</span>
                  <h4 className="font-serif font-bold text-lg text-[#2D2D2D]">{touchItems[senseSubIndex].title}</h4>
                  <p className="text-xs text-stone-600">{touchItems[senseSubIndex].q}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {touchItems[senseSubIndex].options.map((opt, idx) => (
                    <button
                      key={idx}
                      disabled={senseFeedback !== null}
                      onClick={() => handleSenseAnswer(opt, touchItems[senseSubIndex].correct)}
                      className="p-3 text-xs font-bold border border-stone-300 bg-stone-50 hover:bg-emerald-100 transition-all cursor-pointer text-[#2D2D2D]"
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {senseFeedback && (
                  <div className={`p-3 border text-xs font-bold space-y-2 ${
                    senseFeedback.isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'
                  }`}>
                    <p>{senseFeedback.msg}</p>
                    <button
                      onClick={nextSenseSubItem}
                      className="px-4 py-2 bg-[#2D2D2D] hover:bg-[#C5A059] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow"
                    >
                      Sonraki Dokunsal Uyaran ➔
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: 3 SES DUY */}
            {senseStep === 2 && hearItems[senseSubIndex] && (
              <div className="bg-white border border-stone-200 p-5 shadow-sm space-y-4 text-center">
                <div className="flex items-center justify-between border-b pb-2 text-xs font-bold">
                  <span className="text-blue-600 font-serif">3 SES DUY ({senseSubIndex + 1} / 3)</span>
                  <span className="text-stone-400 font-mono">{hearItems[senseSubIndex].title}</span>
                </div>

                <div className="p-6 bg-blue-50/50 border border-blue-200 space-y-3">
                  <button
                    onClick={() => playSensorySound(hearItems[senseSubIndex].soundType)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow flex items-center gap-2 mx-auto"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Sesi Oynat & Dinle (Web Audio)</span>
                  </button>
                  <h4 className="font-serif font-bold text-base text-[#2D2D2D]">{hearItems[senseSubIndex].q}</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {hearItems[senseSubIndex].options.map((opt, idx) => (
                    <button
                      key={idx}
                      disabled={senseFeedback !== null}
                      onClick={() => handleSenseAnswer(opt, hearItems[senseSubIndex].correct)}
                      className="p-3 text-xs font-bold border border-stone-300 bg-stone-50 hover:bg-blue-100 transition-all cursor-pointer text-[#2D2D2D]"
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {senseFeedback && (
                  <div className={`p-3 border text-xs font-bold space-y-2 ${
                    senseFeedback.isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'
                  }`}>
                    <p>{senseFeedback.msg}</p>
                    <button
                      onClick={nextSenseSubItem}
                      className="px-4 py-2 bg-[#2D2D2D] hover:bg-[#C5A059] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow"
                    >
                      Sonraki Ses Uyaranı ➔
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: 2 KOKU FARK ET */}
            {senseStep === 3 && smellItems[senseSubIndex] && (
              <div className="bg-white border border-stone-200 p-5 shadow-sm space-y-4 text-center">
                <div className="flex items-center justify-between border-b pb-2 text-xs font-bold">
                  <span className="text-purple-600 font-serif">2 KOKU FARK ET ({senseSubIndex + 1} / 2)</span>
                  <span className="text-stone-400 font-mono">{smellItems[senseSubIndex].title}</span>
                </div>

                <div className="p-6 bg-purple-50/50 border border-purple-200 space-y-2">
                  <span className="text-3xl">🌸</span>
                  <h4 className="font-serif font-bold text-base text-[#2D2D2D]">{smellItems[senseSubIndex].title}</h4>
                  <p className="text-xs text-stone-600">{smellItems[senseSubIndex].q}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {smellItems[senseSubIndex].options.map((opt, idx) => (
                    <button
                      key={idx}
                      disabled={senseFeedback !== null}
                      onClick={() => handleSenseAnswer(opt, smellItems[senseSubIndex].correct)}
                      className="p-3 text-xs font-bold border border-stone-300 bg-stone-50 hover:bg-purple-100 transition-all cursor-pointer text-[#2D2D2D]"
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {senseFeedback && (
                  <div className={`p-3 border text-xs font-bold space-y-2 ${
                    senseFeedback.isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'
                  }`}>
                    <p>{senseFeedback.msg}</p>
                    <button
                      onClick={nextSenseSubItem}
                      className="px-4 py-2 bg-[#2D2D2D] hover:bg-[#C5A059] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow"
                    >
                      Sonraki Koku Uyaranı ➔
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: 1 TAT HİSSET */}
            {senseStep === 4 && tasteItems[senseSubIndex] && (
              <div className="bg-white border border-stone-200 p-5 shadow-sm space-y-4 text-center">
                <div className="flex items-center justify-between border-b pb-2 text-xs font-bold">
                  <span className="text-rose-600 font-serif">1 TAT HİSSET (1 / 1)</span>
                  <span className="text-stone-400 font-mono">{tasteItems[senseSubIndex].title}</span>
                </div>

                <div className="p-6 bg-rose-50/50 border border-rose-200 space-y-2">
                  <span className="text-3xl">🍯</span>
                  <h4 className="font-serif font-bold text-base text-[#2D2D2D]">{tasteItems[senseSubIndex].title}</h4>
                  <p className="text-xs text-stone-600">{tasteItems[senseSubIndex].q}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {tasteItems[senseSubIndex].options.map((opt, idx) => (
                    <button
                      key={idx}
                      disabled={senseFeedback !== null}
                      onClick={() => handleSenseAnswer(opt, tasteItems[senseSubIndex].correct)}
                      className="p-3 text-xs font-bold border border-stone-300 bg-stone-50 hover:bg-rose-100 transition-all cursor-pointer text-[#2D2D2D]"
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {senseFeedback && (
                  <div className={`p-3 border text-xs font-bold space-y-2 ${
                    senseFeedback.isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'
                  }`}>
                    <p>{senseFeedback.msg}</p>
                    <button
                      onClick={nextSenseSubItem}
                      className="px-4 py-2 bg-[#C5A059] hover:bg-[#b08d4b] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow"
                    >
                      Egzersizi Tamamla 🏆
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: COMPLETED */}
            {senseStep === 5 && (
              <div className="bg-[#2D2D2D] text-white p-8 border border-[#C5A059]/40 text-center space-y-4 shadow-xl">
                <Award className="w-12 h-12 text-[#C5A059] mx-auto animate-bounce" />
                <h3 className="font-serif font-bold text-xl text-amber-300">
                  Tebrikler! Tüm Duyularınızla Şu Ana Bağlandınız
                </h3>
                <p className="text-xs text-stone-300 max-w-md mx-auto leading-relaxed">
                  5 Görsel, 4 Dokusal, 3 İşitsel, 2 Kokusal ve 1 Tatsal uyaranı başarıyla deneyimlediniz. Zihniniz şu an güvende ve tamamen sakinleşti.
                </p>

                <button
                  onClick={() => {
                    setSenseStep(0);
                    setSenseSubIndex(0);
                    setSenseScore(0);
                    setSenseFeedback(null);
                    playChime(600, 'sine', 0.4);
                  }}
                  className="px-6 py-3 bg-[#C5A059] hover:bg-[#b08d4b] text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Yeniden Başlat</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: KUTU NEFESİ (BOX BREATHING)                                         */}
        {/* ========================================================================= */}
        {activeTab === 'box-breathing' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white border border-stone-200 p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-600 border border-blue-200">
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#2D2D2D]">Kutu Nefesi (Box Breathing - 4x4x4x4)</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Otonom sinir sistemini yatıştıran ve nabzı hızla normale döndüren askeri nefes tekniği.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 p-6 sm:p-8 shadow-sm flex flex-col items-center justify-center space-y-6 text-center relative overflow-hidden">
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
                <div 
                  className={`w-full h-full border-4 transition-all duration-1000 flex flex-col items-center justify-center ${
                    boxPhase === 'Inhale' 
                      ? 'border-blue-500 bg-blue-50/50 scale-105 shadow-xl' 
                      : boxPhase === 'HoldIn'
                        ? 'border-amber-500 bg-amber-50/50 scale-105 shadow-lg'
                        : boxPhase === 'Exhale'
                          ? 'border-emerald-500 bg-emerald-50/50 scale-95 shadow'
                          : 'border-purple-500 bg-purple-50/50 scale-95 shadow-inner'
                  }`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-1">
                    {boxPhase === 'Inhale' && '1. Aşama: Nefes Al'}
                    {boxPhase === 'HoldIn' && '2. Aşama: Nefesi Tut'}
                    {boxPhase === 'Exhale' && '3. Aşama: Nefes Ver'}
                    {boxPhase === 'HoldOut' && '4. Aşama: Bekle & Dinlen'}
                  </span>
                  
                  <span className="font-mono text-5xl sm:text-6xl font-extrabold text-[#2D2D2D] my-1">
                    {boxTimer}
                  </span>

                  <span className="text-xs font-serif font-bold text-[#C5A059]">
                    {boxPhase === 'Inhale' && '💨 Yavaşça burnundan nefes çek'}
                    {boxPhase === 'HoldIn' && '🛑 Akciğerlerini dolu tut'}
                    {boxPhase === 'Exhale' && '🌬️ Ağzından sakince ver'}
                    {boxPhase === 'HoldOut' && '🧘 Rahatla ve bekle'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <div className="text-left border-r pr-4">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Tur Sayısı</span>
                  <span className="font-mono text-xl font-bold text-[#2D2D2D]">{boxRounds} Tur</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setBoxActive(!boxActive);
                      playChime(500, 'sine', 0.2);
                    }}
                    className={`px-5 py-2.5 font-bold text-xs uppercase tracking-widest transition-all cursor-pointer shadow flex items-center gap-2 text-white ${
                      boxActive ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#2D2D2D] hover:bg-[#C5A059]'
                    }`}
                  >
                    {boxActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>{boxActive ? 'Duraklat' : 'Nefesi Başlat'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setBoxActive(false);
                      setBoxPhase('Inhale');
                      setBoxTimer(4);
                      setBoxRounds(0);
                    }}
                    className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-300 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: UZUN NEFES VERME TEKNİĞİ                                          */}
        {/* ========================================================================= */}
        {activeTab === 'long-exhale' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white border border-stone-200 p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-600 border border-emerald-200">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#2D2D2D]">Uzun Nefes Verme (Parasempatik Gevşeme)</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Nefes verme süresini alma süresinden daha uzun tutarak kalp atış hızınızı doğrudan yavaşlatın.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 p-6 sm:p-8 shadow-sm flex flex-col items-center justify-center space-y-6 text-center">
              <div className="flex items-center gap-2 bg-stone-100 p-1.5 border border-stone-200 text-xs">
                <span className="font-bold text-stone-600 px-2">Verme Süresi:</span>
                {[6, 7, 8].map(sec => (
                  <button
                    key={sec}
                    onClick={() => setLongExhaleDuration(sec)}
                    className={`px-3 py-1 font-bold transition-all cursor-pointer ${
                      longExhaleDuration === sec 
                        ? 'bg-[#C5A059] text-stone-950 font-extrabold shadow' 
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {sec} Sn
                  </button>
                ))}
              </div>

              <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
                <div 
                  className={`rounded-full border-8 transition-all duration-1000 flex flex-col items-center justify-center ${
                    longPhase === 'Inhale' 
                      ? 'w-48 h-48 sm:w-56 sm:h-56 border-emerald-500 bg-emerald-50 text-emerald-900 scale-100' 
                      : 'w-36 h-36 sm:w-40 sm:h-40 border-teal-600 bg-teal-50 text-teal-900 scale-90'
                  }`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-widest text-stone-500">
                    {longPhase === 'Inhale' ? '4 Sn Nefes Al' : `${longExhaleDuration} Sn Yavaşça Ver`}
                  </span>
                  <span className="font-mono text-4xl sm:text-5xl font-extrabold my-1">{longTimer}</span>
                  <span className="text-[11px] font-semibold text-[#C5A059]">
                    {longPhase === 'Inhale' ? '💨 Derin nefes çek' : '🌬️ Sakince ver'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setLongBreathingActive(!longBreathingActive);
                    playChime(500, 'sine', 0.2);
                  }}
                  className={`px-5 py-2.5 font-bold text-xs uppercase tracking-widest transition-all cursor-pointer shadow flex items-center gap-2 text-white ${
                    longBreathingActive ? 'bg-amber-600' : 'bg-emerald-700 hover:bg-emerald-800'
                  }`}
                >
                  {longBreathingActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{longBreathingActive ? 'Duraklat' : 'Gevşeme Nefesini Başlat'}</span>
                </button>

                <button
                  onClick={() => {
                    setLongBreathingActive(false);
                    setLongPhase('Inhale');
                    setLongTimer(4);
                    setLongRounds(0);
                  }}
                  className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-300 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: KAS GEVŞETME EGZERSİZİ                                             */}
        {/* ========================================================================= */}
        {activeTab === 'muscle-relaxation' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white border border-stone-200 p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 text-rose-600 border border-rose-200">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#2D2D2D]">Progresif Kas Gevşetme (PMR)</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Kas gruplarını sırayla 5 saniye kasıp serbest bırakarak fiziksel gerginliği tamamen boşaltın.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 p-6 sm:p-8 shadow-sm space-y-5 text-center">
              <div className="flex items-center justify-center gap-1.5">
                {muscleSteps.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentMuscleStep(idx);
                      setIsTensePhase(true);
                      setMuscleTimer(5);
                    }}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      currentMuscleStep === idx 
                        ? 'bg-rose-600 text-white font-extrabold scale-110 shadow' 
                        : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <div className="p-5 bg-stone-50 border border-stone-200 space-y-2">
                <h4 className="font-serif font-bold text-lg text-[#2D2D2D]">
                  {muscleSteps[currentMuscleStep].title}
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed max-w-lg mx-auto">
                  {muscleSteps[currentMuscleStep].desc}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center space-y-2">
                <div 
                  className={`w-36 h-36 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-500 ${
                    isTensePhase 
                      ? 'border-rose-500 bg-rose-50 text-rose-900 scale-105' 
                      : 'border-emerald-500 bg-emerald-50 text-emerald-900 scale-95'
                  }`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-widest text-stone-500">
                    {isTensePhase ? '💪 5 Sn Sık & Kas' : '🍃 8 Sn Serbest Bırak'}
                  </span>
                  <span className="font-mono text-4xl sm:text-5xl font-extrabold my-1">{muscleTimer}</span>
                  <span className="text-[10px] font-bold text-[#C5A059]">
                    {isTensePhase ? 'Maksimum kas' : 'Gevşemeyi hisset'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setMuscleActive(!muscleActive);
                    playChime(500, 'sine', 0.2);
                  }}
                  className={`px-5 py-2.5 font-bold text-xs uppercase tracking-widest transition-all cursor-pointer shadow flex items-center gap-2 text-white ${
                    muscleActive ? 'bg-amber-600' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {muscleActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{muscleActive ? 'Duraklat' : 'Kas Gevşetmeyi Başlat'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: RENK & GÖRSEL BULMA OYUNU (Visual & Multiple Choice)               */}
        {/* ========================================================================= */}
        {activeTab === 'color-game' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white border border-stone-200 p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 text-purple-600 border border-purple-200">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#2D2D2D]">
                    Görsel Algı & Renk Bulma Oyunu (Çoktan Seçmeli)
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Aşağıdaki sanatsal görselleri inceleyin ve sorulan detay sorusuna göre doğru seçeneği işaretleyin.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 p-5 sm:p-6 shadow-sm space-y-4 text-center">
              <div className="flex items-center justify-between border-b pb-2 text-xs font-bold text-stone-600">
                <span className="bg-purple-100 text-purple-900 px-2.5 py-0.5 border border-purple-300">
                  GÖRSEL GÖREV #{colorTaskIdx + 1} / {colorVisualTasks.length}
                </span>
                <span className="font-mono text-purple-700">Skor: {colorGameScore} Doğru</span>
              </div>

              {/* Dynamic SVG Visual Art Scene Display */}
              <div className="w-full h-48 sm:h-56 bg-slate-900 border border-stone-300 flex items-center justify-center p-3 relative shadow-inner overflow-hidden">
                <svg className="w-full h-full max-w-md" viewBox="0 0 320 160">
                  {colorVisualTasks[colorTaskIdx].bgType === 'garden' && (
                    <g>
                      <rect width="320" height="160" fill="#0f172a" />
                      <circle cx="50" cy="110" r="14" fill="#3B82F6" />
                      <circle cx="110" cy="120" r="14" fill="#3B82F6" />
                      <circle cx="180" cy="100" r="14" fill="#3B82F6" />
                      <circle cx="250" cy="115" r="14" fill="#3B82F6" />
                      <circle cx="80" cy="80" r="12" fill="#EF4444" />
                      <circle cx="220" cy="70" r="12" fill="#F59E0B" />
                      <rect x="0" y="140" width="320" height="20" fill="#10B981" />
                    </g>
                  )}
                  {colorVisualTasks[colorTaskIdx].bgType === 'geo' && (
                    <g>
                      <rect width="320" height="160" fill="#1e1b4b" />
                      <polygon points="160,30 185,75 235,80 195,115 210,165 160,135 110,165 125,115 85,80 135,75" fill="#C5A059" />
                      <circle cx="60" cy="40" r="18" fill="#06B6D4" />
                      <circle cx="260" cy="40" r="18" fill="#EC4899" />
                    </g>
                  )}
                  {colorVisualTasks[colorTaskIdx].bgType === 'night' && (
                    <g>
                      <rect width="320" height="160" fill="#020617" />
                      <path d="M40 160 L40 100 L70 70 L100 100 L100 160 Z" fill="#334155" />
                      <polygon points="35,100 70,60 105,100" fill="#EF4444" />
                      <path d="M180 160 L180 110 L210 80 L240 110 L240 160 Z" fill="#334155" />
                      <polygon points="175,110 210,70 245,110" fill="#EF4444" />
                      <circle cx="140" cy="120" r="22" fill="#10B981" />
                      <circle cx="280" cy="120" r="22" fill="#10B981" />
                      <circle cx="260" cy="30" r="12" fill="#FACC15" />
                    </g>
                  )}
                  {colorVisualTasks[colorTaskIdx].bgType === 'ocean' && (
                    <g>
                      <rect width="320" height="160" fill="#0284C7" />
                      <ellipse cx="70" cy="70" rx="20" ry="10" fill="#F97316" />
                      <ellipse cx="160" cy="110" rx="20" ry="10" fill="#F97316" />
                      <ellipse cx="240" cy="60" rx="20" ry="10" fill="#F97316" />
                      <path d="M30 160 Q 40 100 30 40" stroke="#166534" strokeWidth="6" fill="none" />
                      <path d="M290 160 Q 280 100 290 40" stroke="#166534" strokeWidth="6" fill="none" />
                    </g>
                  )}
                  {colorVisualTasks[colorTaskIdx].bgType === 'balloon' && (
                    <g>
                      <rect width="320" height="160" fill="#38BDF8" />
                      <ellipse cx="70" cy="90" rx="18" ry="24" fill="#F59E0B" />
                      <ellipse cx="160" cy="35" rx="22" ry="28" fill="#06B6D4" />
                      <ellipse cx="250" cy="85" rx="18" ry="24" fill="#D946EF" />
                    </g>
                  )}
                </svg>
                <span className="absolute top-2 left-2 text-[10px] font-mono text-white bg-black/60 px-2 py-0.5">
                  {colorVisualTasks[colorTaskIdx].title}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-serif font-bold text-base text-[#2D2D2D]">
                  {colorVisualTasks[colorTaskIdx].question}
                </h4>
              </div>

              {/* Multiple Choice Option Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {colorVisualTasks[colorTaskIdx].options.map((opt, idx) => {
                  const isCorrectOpt = opt === colorVisualTasks[colorTaskIdx].correct;
                  const isSelected = selectedColorOpt === opt;
                  let style = "bg-stone-50 text-[#2D2D2D] border-stone-300 hover:bg-purple-50 hover:border-purple-300";
                  if (selectedColorOpt !== null) {
                    if (isCorrectOpt) style = "bg-emerald-600 text-white border-emerald-700 font-extrabold shadow";
                    else if (isSelected) style = "bg-rose-600 text-white border-rose-700 font-bold";
                    else style = "bg-stone-100 text-stone-400 border-stone-200 opacity-40";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={selectedColorOpt !== null}
                      onClick={() => handleColorChoiceSelect(opt)}
                      className={`p-3 text-xs font-bold border transition-all cursor-pointer ${style}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {colorFeedback && (
                <div className={`p-3 border text-xs font-bold space-y-2 ${
                  colorFeedback.isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'
                }`}>
                  <p>{colorFeedback.msg}</p>
                  <button
                    onClick={nextColorTask}
                    className="px-4 py-2 bg-[#2D2D2D] hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow"
                  >
                    Sonraki Görsel Görev ➔
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: 100’DEN GERİ SAYMA (3, 5, 7 - Tıklamalı Sayı Kartları)            */}
        {/* ========================================================================= */}
        {activeTab === 'countdown' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white border border-stone-200 p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-500/10 text-teal-600 border border-teal-200">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#2D2D2D]">
                    100’den Geri Sayma (3'er, 5'er ve 7'şer Tıklamalı Mod)
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    100'den geriye tıklayarak sayıları seçin. Çalışan belleğinizi aktif tutarak duygu merkezindeki kaygıyı dindirin.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 p-6 sm:p-8 shadow-sm space-y-5 text-center">
              {/* Step Mode Selector */}
              <div className="flex flex-wrap items-center justify-center gap-2 bg-stone-100 p-2 border border-stone-200">
                <span className="text-xs font-bold text-stone-600">Adım Seç:</span>
                {([3, 5, 7] as const).map(step => (
                  <button
                    key={step}
                    onClick={() => {
                      setCountdownStep(step);
                      setCurrentNum(100);
                      setCountdownScore(0);
                      setCountdownFeedback('');
                    }}
                    className={`px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      countdownStep === step ? 'bg-teal-700 text-white shadow font-extrabold' : 'bg-white text-stone-600'
                    }`}
                  >
                    {step}'şer Geri Say
                  </button>
                ))}
              </div>

              {/* Current Number Banner */}
              <div className="p-5 bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-xs text-stone-500 font-bold uppercase tracking-wider block">ŞU ANKİ SAYINIZ</span>
                <span className="font-mono text-5xl sm:text-6xl font-extrabold text-[#2D2D2D] block">{currentNum}</span>
                <span className="text-xs text-teal-800 font-bold bg-teal-50 px-2.5 py-1 border border-teal-200 inline-block">
                  👉 1 Bir Sonraki Sayı: ({currentNum} eksi {countdownStep} = ?)
                </span>
              </div>

              {/* Clickable On-Screen Number Cards */}
              {countdownOptions.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-stone-500 font-bold">Aşağıdaki sayılardan doğru sonuca tıklayın:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
                    {countdownOptions.map((num, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleCountdownClick(num)}
                        className="py-4 px-3 bg-stone-100 hover:bg-[#C5A059] hover:text-stone-950 text-[#2D2D2D] font-mono font-black text-2xl border-2 border-stone-300 hover:border-[#C5A059] transition-all cursor-pointer shadow"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold">
                  🏆 Tebrikler! 100'den geriye {countdownStep}'şer sayarak 0'a ulaştınız. Zihniniz tam odağa kavuştu.
                </div>
              )}

              {countdownFeedback && (
                <p className="text-xs font-bold text-[#C5A059] bg-amber-50 p-2.5 border border-amber-200">
                  {countdownFeedback}
                </p>
              )}

              <div className="pt-2 border-t flex items-center justify-between text-xs text-stone-500 font-mono">
                <span>Doğru Tıklama: {countdownScore}</span>
                <button
                  onClick={() => {
                    setCurrentNum(100);
                    setCountdownScore(0);
                    setCountdownFeedback('');
                  }}
                  className="text-stone-500 hover:text-stone-800 underline cursor-pointer"
                >
                  100'e Yeniden Başla
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: MANDALA BOYAMA & SİMETRİ                                           */}
        {/* ========================================================================= */}
        {activeTab === 'mandala' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-white border border-stone-200 p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-600 border border-amber-200">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#2D2D2D]">Mandala Çizimi & Simetrik Sanat Terapisi</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Mandala çizmek sağ ve sol beyni dengeleyerek derin zihinsel sakinleşme sağlar.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 p-5 shadow-sm flex flex-col md:flex-row items-center gap-6">
              <div className="relative bg-white border-2 border-stone-300 shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={340}
                  onMouseDown={(e) => {
                    setIsDrawing(true);
                    drawMandalaPoint(e.clientX, e.clientY);
                  }}
                  onMouseMove={(e) => {
                    if (isDrawing) drawMandalaPoint(e.clientX, e.clientY);
                  }}
                  onMouseUp={() => setIsDrawing(false)}
                  onMouseLeave={() => setIsDrawing(false)}
                  className="cursor-crosshair touch-none"
                />
              </div>

              <div className="space-y-4 text-left flex-1 w-full">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block">Renk Seçimi</label>
                  <div className="flex flex-wrap gap-2">
                    {['#C5A059', '#2D2D2D', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#F59E0B', '#EF4444'].map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        style={{ backgroundColor: color }}
                        className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                          selectedColor === color ? 'border-stone-900 scale-110 shadow' : 'border-white'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block">Fırça Kalınlığı</label>
                  <input
                    type="range"
                    min="2"
                    max="12"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full accent-[#C5A059] cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setIsSymmetry(!isSymmetry)}
                    className={`px-3.5 py-2 text-xs font-bold border transition-all cursor-pointer ${
                      isSymmetry ? 'bg-amber-100 border-[#C5A059] text-amber-900' : 'bg-stone-100 border-stone-300 text-stone-600'
                    }`}
                  >
                    Simetri: {isSymmetry ? 'AÇIK ✨' : 'KAPALI'}
                  </button>

                  <button
                    onClick={clearMandala}
                    className="px-3.5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Temizle</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: DİKKAT NOKTASI EGZERSİZİ                                           */}
        {/* ========================================================================= */}
        {activeTab === 'focal-point' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white border border-stone-200 p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-600 border border-indigo-200">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#2D2D2D]">Dikkat Noktası (Mindfulness Focal Point)</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Noktaya odaklanıp nefesini izle. Dikkatin dağılırsa nazikçe noktaya geri dön.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#2D2D2D] text-white p-8 sm:p-12 shadow-xl flex flex-col items-center justify-center space-y-6 text-center relative overflow-hidden min-h-[300px]">
              <div className="relative flex items-center justify-center">
                <div 
                  className={`rounded-full bg-gradient-to-r from-[#C5A059] to-amber-200 transition-all duration-[4000ms] shadow-[0_0_50px_rgba(197,160,89,0.5)] ${
                    focalActive ? 'w-28 h-28 sm:w-32 sm:h-32 animate-pulse scale-125' : 'w-20 h-20 sm:w-24 sm:h-24'
                  }`}
                />
              </div>

              <div className="space-y-1 max-w-md">
                <span className="font-mono text-3xl font-extrabold text-[#C5A059]">
                  {Math.floor(focalTimeLeft / 60)}:{(focalTimeLeft % 60).toString().padStart(2, '0')}
                </span>
                <p className="text-xs text-stone-300 font-serif italic">
                  "Altın renkli merkeze odaklan... Zihnin dağılırsa sakince noktaya geri dön."
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setFocalActive(!focalActive);
                    playChime(500, 'sine', 0.2);
                  }}
                  className={`px-5 py-2.5 font-bold text-xs uppercase tracking-widest transition-all cursor-pointer shadow flex items-center gap-2 text-stone-950 ${
                    focalActive ? 'bg-amber-400' : 'bg-[#C5A059] hover:bg-[#b08d4b]'
                  }`}
                >
                  {focalActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{focalActive ? 'Duraklat' : 'Noktaya Odaklan'}</span>
                </button>

                <button
                  onClick={() => {
                    setFocalActive(false);
                    setFocalTimeLeft(90);
                  }}
                  className="p-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 9: KELEBEK KUCAKLAŞMASI (BUTTERFLY HUG)                               */}
        {/* ========================================================================= */}
        {activeTab === 'butterfly-hug' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white border border-stone-200 p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-600 border border-amber-200">
                  <Feather className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#2D2D2D]">Kelebek Kucaklaşması (Butterfly Hug - EMDR)</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Ellerini göğsünde çaprazlayıp ritmik dokunarak sağ ve sol beyni uyarın.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 p-6 sm:p-8 shadow-sm flex flex-col items-center justify-center space-y-6 text-center">
              <div className="flex items-center justify-center gap-8 sm:gap-12">
                <div 
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-300 ${
                    butterflySide === 'left' && butterflyActive
                      ? 'bg-amber-100 border-[#C5A059] text-amber-900 scale-110 shadow-lg'
                      : 'bg-stone-50 border-stone-200 text-stone-400'
                  }`}
                >
                  <span className="font-serif font-bold text-xs sm:text-sm">SOL OMUZ</span>
                  <span className="text-[10px] font-bold">Dokun ✋</span>
                </div>

                <div 
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-300 ${
                    butterflySide === 'right' && butterflyActive
                      ? 'bg-amber-100 border-[#C5A059] text-amber-900 scale-110 shadow-lg'
                      : 'bg-stone-50 border-stone-200 text-stone-400'
                  }`}
                >
                  <span className="font-serif font-bold text-xs sm:text-sm">SAĞ OMUZ</span>
                  <span className="text-[10px] font-bold">Dokun ✋</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-[#C5A059]">Dokunuş Sayısı: {butterflyCount}</span>
              </div>

              <button
                onClick={() => {
                  setButterflyActive(!butterflyActive);
                  playChime(500, 'sine', 0.2);
                }}
                className={`px-5 py-2.5 font-bold text-xs uppercase tracking-widest transition-all cursor-pointer shadow flex items-center gap-2 text-white ${
                  butterflyActive ? 'bg-amber-600' : 'bg-[#2D2D2D] hover:bg-[#C5A059]'
                }`}
              >
                {butterflyActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{butterflyActive ? 'Duraklat' : 'Kelebek Ritim Egzersizini Başlat'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 10: KAYGI BALONU SÖNDÜRME                                            */}
        {/* ========================================================================= */}
        {activeTab === 'worry-balloon' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white border border-stone-200 p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-500/10 text-sky-600 border border-sky-200">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#2D2D2D]">Kaygı Balonu Uçurma (Düşünce Özgürleştirme)</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Kaygılandıran düşünceyi balona yükleyip gökyüzüne salın.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-sky-50 border border-sky-200 p-6 sm:p-8 shadow-sm space-y-6 text-center relative overflow-hidden min-h-[280px]">
              {balloonFloating ? (
                <div className="flex flex-col items-center justify-center space-y-3 animate-bounce">
                  <div className="w-20 h-28 sm:w-24 sm:h-32 bg-rose-500 rounded-full text-white flex items-center justify-center p-3 text-xs font-bold shadow-2xl relative">
                    <span className="text-center font-serif leading-tight">{worryText}</span>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-2 h-3 bg-rose-700 rounded" />
                  </div>
                  <span className="text-xs font-bold text-sky-800 animate-pulse">
                    🎈 Düşünceniz balona yüklendi, gökyüzüne süzülüyor...
                  </span>
                </div>
              ) : (
                <form onSubmit={handleReleaseBalloon} className="max-w-md mx-auto space-y-3">
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
                      Şu An Kaygılandıran Düşünce Nedir?
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Örn: Sınavda zamanı yetiştiremezsem diye endişeleniyorum..."
                      value={worryText}
                      onChange={(e) => setWorryText(e.target.value)}
                      className="w-full p-3 bg-white border border-stone-300 text-xs focus:border-[#C5A059] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#2D2D2D] hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Balona Yükle & Uçur 🎈</span>
                  </button>
                </form>
              )}

              {balloonHistory.length > 0 && (
                <div className="pt-3 border-t border-sky-200 text-left space-y-2">
                  <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
                    Serbest Bırakılan Düşünceler ({balloonHistory.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {balloonHistory.map((item, idx) => (
                      <span key={idx} className="bg-white/80 border border-sky-300 text-sky-900 text-[11px] px-2.5 py-0.5 rounded-full line-through opacity-75">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
