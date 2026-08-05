import React, { useState, useEffect, useRef } from 'react';
import { 
  HeartPulse, Wind, Eye, Smile, Activity, RotateCcw, Play, Pause, 
  CheckCircle2, Zap, Brain, Palette, Circle, Feather, Shield, Volume2, 
  VolumeX, RefreshCw, Send, Check, Sparkles, HelpCircle, Flame, Target
} from 'lucide-react';

export default function AnxietyControlPanel() {
  const [activeTab, setActiveTab] = useState<
    | '54321' 
    | 'box-breathing' 
    | 'long-exhale' 
    | 'muscle-relaxation' 
    | 'color-game' 
    | 'countdown' 
    | 'mandala' 
    | 'focal-point'
    | 'butterfly-hug'
    | 'worry-balloon'
  >('54321');

  // Audio effect generator using Web Audio API (no external files needed)
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
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio context fallbacks handled
    }
  };

  /* ========================================================================= */
  /* 1. 5-4-3-2-1 DUYU EGZERSİZİ STATE                                          */
  /* ========================================================================= */
  const [senseInputs, setSenseInputs] = useState({
    see: ['', '', '', '', ''],
    touch: ['', '', '', ''],
    hear: ['', '', ''],
    smell: ['', ''],
    taste: ['']
  });
  const [senseCompleted, setSenseCompleted] = useState(false);

  const handleSenseChange = (category: keyof typeof senseInputs, index: number, value: string) => {
    setSenseInputs(prev => {
      const updated = { ...prev[category] };
      updated[index] = value;
      return { ...prev, [category]: updated };
    });
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
          // Phase transition
          setBoxPhase(curr => {
            if (curr === 'Inhale') {
              playChime(523.25, 'sine', 0.5); // C5
              return 'HoldIn';
            } else if (curr === 'HoldIn') {
              playChime(440, 'sine', 0.5); // A4
              return 'Exhale';
            } else if (curr === 'Exhale') {
              playChime(349.23, 'sine', 0.5); // F4
              return 'HoldOut';
            } else {
              playChime(659.25, 'sine', 0.5); // E5
              setBoxRounds(r => r + 1);
              return 'Inhale';
            }
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
  const [longExhaleDuration, setLongExhaleDuration] = useState(7); // 6, 7 or 8 sec
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
            playChime(392, 'sine', 0.6); // G4
            return longExhaleDuration;
          } else {
            setLongPhase('Inhale');
            setLongRounds(r => r + 1);
            playChime(587.33, 'sine', 0.6); // D5
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
            return 8; // 8 seconds relaxation phase
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
  /* 5. RENK BULMA OYUNU STATE                                                  */
  /* ========================================================================= */
  const colorTasks = [
    { color: 'Mavi', bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-300', target: 5, prompt: 'Ortamda 5 tane MAVİ nesne bul ve gözlerinle odaklan.' },
    { color: 'Yeşil', bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-300', target: 5, prompt: 'Ortamda 5 tane YEŞİL nesne bul ve say.' },
    { color: 'Yuvarlak', bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-300', target: 5, prompt: 'Ortamda 5 tane YUVARLAK (Dairesel) nesne bul.' },
    { color: 'Kırmızı', bg: 'bg-rose-500', text: 'text-rose-600', border: 'border-rose-300', target: 3, prompt: 'Ortamda 3 tane KIRMIZI veya CANLI RENKLİ nesne bul.' },
    { color: 'Ahşap/Kahverengi', bg: 'bg-amber-800', text: 'text-amber-800', border: 'border-amber-400', target: 5, prompt: 'Ortamda 5 tane KAHVERENGİ veya AHŞAP dokulu nesne bul.' }
  ];
  const [colorTaskIdx, setColorTaskIdx] = useState(0);
  const [foundCount, setFoundCount] = useState(0);

  /* ========================================================================= */
  /* 6. 100'DEN GERİ SAYMA STATE                                                */
  /* ========================================================================= */
  const [countdownStep, setCountdownStep] = useState<3 | 7>(7);
  const [currentNum, setCurrentNum] = useState(100);
  const [userNumInput, setUserNumInput] = useState('');
  const [countdownFeedback, setCountdownFeedback] = useState('');
  const [countdownScore, setCountdownScore] = useState(0);

  const handleCountdownSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(userNumInput.trim());
    const expected = currentNum - countdownStep;
    if (val === expected) {
      setCurrentNum(expected);
      setCountdownScore(s => s + 1);
      setCountdownFeedback('✨ Harika! Doğru sayı. Zihnin odaklanıyor.');
      setUserNumInput('');
      playChime(600, 'sine', 0.2);
    } else {
      setCountdownFeedback(`❌ Doğru sayı ${expected} olmalıydı. Tekrar dene!`);
      playChime(250, 'sawtooth', 0.3);
    }
  };

  /* ========================================================================= */
  /* 7. MANDALA BOYAMA & SANAT TERAPİSİ                                         */
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

    // Draw initial mandala guidelines
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;

    // Background circle guides
    const cx = width / 2;
    const cy = height / 2;

    for (let r = 30; r <= 150; r += 30) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 8 radial lines
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
      // 8-fold symmetry drawing
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

        // Mirrored angle
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
  const [focalTimeLeft, setFocalTimeLeft] = useState(90); // 90 seconds default

  useEffect(() => {
    let interval: any = null;
    if (focalActive) {
      interval = setInterval(() => {
        setFocalTimeLeft(prev => {
          if (prev <= 1) {
            setFocalActive(false);
            playChime(783.99, 'sine', 1.0); // G5 victory chime
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
  /* 10. KAYGI BALONU SÖNDÜRME (WORRY BALLOON) STATE                            */
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

  return (
    <div className="bg-[#FAF9F6] h-full flex flex-col overflow-hidden text-[#2D2D2D]">
      
      {/* Top Banner & Sound Toggle */}
      <div className="bg-[#2D2D2D] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#C5A059]/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#C5A059] text-stone-950 font-bold shadow">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-lg text-white tracking-wide">
                KAYGINI KONTROL ET & SAKİNLEŞME EGZERSİZLERİ
              </h2>
              <span className="text-[10px] font-sans font-extrabold bg-emerald-500 text-stone-950 px-2.5 py-0.5 uppercase tracking-wider">
                EĞİTMAN ÖZEL
              </span>
            </div>
            <p className="text-stone-300 text-xs mt-0.5">
              Sınav öncesi ve anında kaygıyı düşürmek, odağı şu ana getirmek için bilimsel nefes, beden ve zihin egzersizleri.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setIsSoundOn(!isSoundOn);
            playChime(440, 'sine', 0.2);
          }}
          className={`px-3.5 py-2 text-xs font-bold border flex items-center gap-2 transition-all cursor-pointer ${
            isSoundOn 
              ? 'bg-[#C5A059]/20 border-[#C5A059] text-amber-300 hover:bg-[#C5A059]/30' 
              : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-white'
          }`}
        >
          {isSoundOn ? <Volume2 className="w-4 h-4 text-[#C5A059]" /> : <VolumeX className="w-4 h-4" />}
          <span>{isSoundOn ? 'Ses Efektleri Açık' : 'Sessiz Mod'}</span>
        </button>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-stone-200/80 border-b border-stone-300 px-4 py-2.5 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('54321')}
          className={`px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
            activeTab === '54321'
              ? 'bg-[#2D2D2D] text-white border-[#2D2D2D] shadow'
              : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-amber-500" />
          <span>1. 5-4-3-2-1 Duyu Egzersizi</span>
        </button>

        <button
          onClick={() => setActiveTab('box-breathing')}
          className={`px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
            activeTab === 'box-breathing'
              ? 'bg-[#2D2D2D] text-white border-[#2D2D2D] shadow'
              : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
          }`}
        >
          <Wind className="w-3.5 h-3.5 text-blue-500" />
          <span>2. Kutu Nefesi (Box Breathing)</span>
        </button>

        <button
          onClick={() => setActiveTab('long-exhale')}
          className={`px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
            activeTab === 'long-exhale'
              ? 'bg-[#2D2D2D] text-white border-[#2D2D2D] shadow'
              : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
          <span>3. Uzun Nefes Verme</span>
        </button>

        <button
          onClick={() => setActiveTab('muscle-relaxation')}
          className={`px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
            activeTab === 'muscle-relaxation'
              ? 'bg-[#2D2D2D] text-white border-[#2D2D2D] shadow'
              : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-rose-500" />
          <span>4. Kas Gevşetme (PMR)</span>
        </button>

        <button
          onClick={() => setActiveTab('color-game')}
          className={`px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
            activeTab === 'color-game'
              ? 'bg-[#2D2D2D] text-white border-[#2D2D2D] shadow'
              : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-purple-500" />
          <span>5. Renk Bulma Oyunu</span>
        </button>

        <button
          onClick={() => setActiveTab('countdown')}
          className={`px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
            activeTab === 'countdown'
              ? 'bg-[#2D2D2D] text-white border-[#2D2D2D] shadow'
              : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
          }`}
        >
          <Brain className="w-3.5 h-3.5 text-teal-500" />
          <span>6. 100’den Geri Sayma</span>
        </button>

        <button
          onClick={() => setActiveTab('mandala')}
          className={`px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
            activeTab === 'mandala'
              ? 'bg-[#2D2D2D] text-white border-[#2D2D2D] shadow'
              : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>7. Mandala & Simetri</span>
        </button>

        <button
          onClick={() => setActiveTab('focal-point')}
          className={`px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
            activeTab === 'focal-point'
              ? 'bg-[#2D2D2D] text-white border-[#2D2D2D] shadow'
              : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-indigo-500" />
          <span>8. Dikkat Noktası</span>
        </button>

        <button
          onClick={() => setActiveTab('butterfly-hug')}
          className={`px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
            activeTab === 'butterfly-hug'
              ? 'bg-[#2D2D2D] text-white border-[#2D2D2D] shadow'
              : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
          }`}
        >
          <Feather className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>9. Kelebek Kucaklaşması</span>
        </button>

        <button
          onClick={() => setActiveTab('worry-balloon')}
          className={`px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
            activeTab === 'worry-balloon'
              ? 'bg-[#2D2D2D] text-white border-[#2D2D2D] shadow'
              : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
          }`}
        >
          <Send className="w-3.5 h-3.5 text-sky-500" />
          <span>10. Kaygı Balonu Söndürme</span>
        </button>
      </div>

      {/* Main Interactive Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        
        {/* ========================================================================= */}
        {/* TAB 1: 5-4-3-2-1 DUYU EGZERSİZİ                                           */}
        {/* ========================================================================= */}
        {activeTab === '54321' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white border border-stone-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-600 border border-amber-200">
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#2D2D2D]">5-4-3-2-1 Topraklanma (Grounding) Duyu Egzersizi</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Bu egzersiz, sınav stresi ve kaygı anında dikkatinizi geçmiş ve geleceğin olumsuz senaryolarından alıp fiziksel çevrenize (şu ana) getirir.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 5 Şey Gör */}
              <div className="bg-white border border-stone-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-serif font-bold text-sm text-[#2D2D2D] flex items-center gap-2">
                    <span className="w-6 h-6 bg-amber-500 text-white font-mono text-xs flex items-center justify-center font-bold">5</span>
                    <span>5 ŞEY GÖR</span>
                  </span>
                  <span className="text-[11px] text-stone-400">Çevrendeki 5 nesneye bak</span>
                </div>
                <div className="space-y-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Gördüğün ${i + 1}. nesne...`}
                      value={senseInputs.see[i]}
                      onChange={(e) => handleSenseChange('see', i, e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 text-xs focus:bg-white focus:border-[#C5A059] focus:outline-none"
                    />
                  ))}
                </div>
              </div>

              {/* 4 Şeye Dokun */}
              <div className="bg-white border border-stone-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-serif font-bold text-sm text-[#2D2D2D] flex items-center gap-2">
                    <span className="w-6 h-6 bg-emerald-600 text-white font-mono text-xs flex items-center justify-center font-bold">4</span>
                    <span>4 ŞEYE DOKUN</span>
                  </span>
                  <span className="text-[11px] text-stone-400">Hissedebildiğin 4 doku</span>
                </div>
                <div className="space-y-2">
                  {[0, 1, 2, 3].map((i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Dokunduğun ${i + 1}. şey (Masa, Kıyafet, Saç...)...`}
                      value={senseInputs.touch[i]}
                      onChange={(e) => handleSenseChange('touch', i, e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 text-xs focus:bg-white focus:border-[#C5A059] focus:outline-none"
                    />
                  ))}
                </div>
              </div>

              {/* 3 Ses Duy */}
              <div className="bg-white border border-stone-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-serif font-bold text-sm text-[#2D2D2D] flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-600 text-white font-mono text-xs flex items-center justify-center font-bold">3</span>
                    <span>3 SES DUY</span>
                  </span>
                  <span className="text-[11px] text-stone-400">Ortamdaki 3 farklı ses</span>
                </div>
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Duyduğun ${i + 1}. ses (Kuş, Nefes, Saat...)...`}
                      value={senseInputs.hear[i]}
                      onChange={(e) => handleSenseChange('hear', i, e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 text-xs focus:bg-white focus:border-[#C5A059] focus:outline-none"
                    />
                  ))}
                </div>
              </div>

              {/* 2 Koku Fark Et & 1 Tat Hisset */}
              <div className="bg-white border border-stone-200 p-5 shadow-sm space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b pb-1">
                    <span className="font-serif font-bold text-sm text-[#2D2D2D] flex items-center gap-2">
                      <span className="w-5 h-5 bg-purple-600 text-white font-mono text-xs flex items-center justify-center font-bold">2</span>
                      <span>2 KOKU FARK ET</span>
                    </span>
                  </div>
                  {[0, 1].map((i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Fark ettiğin ${i + 1}. koku...`}
                      value={senseInputs.smell[i]}
                      onChange={(e) => handleSenseChange('smell', i, e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 text-xs focus:bg-white focus:border-[#C5A059] focus:outline-none"
                    />
                  ))}
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center justify-between border-b pb-1">
                    <span className="font-serif font-bold text-sm text-[#2D2D2D] flex items-center gap-2">
                      <span className="w-5 h-5 bg-rose-600 text-white font-mono text-xs flex items-center justify-center font-bold">1</span>
                      <span>1 TAT HİSSET</span>
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Ağzındaki veya zihnindeki 1 tat..."
                    value={senseInputs.taste[0]}
                    onChange={(e) => handleSenseChange('taste', 0, e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 text-xs focus:bg-white focus:border-[#C5A059] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#2D2D2D] text-white p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="font-serif font-bold text-sm text-amber-300">Zihnini Şu Ana Odakladın!</h4>
                <p className="text-xs text-stone-300">Tüm duyularını çalıştırarak bedeninin şu an güvende olduğunu zihnine hatırlattın.</p>
              </div>
              <button
                onClick={() => {
                  setSenseInputs({ see: ['', '', '', '', ''], touch: ['', '', '', ''], hear: ['', '', ''], smell: ['', ''], taste: [''] });
                  playChime(600, 'sine', 0.4);
                }}
                className="px-4 py-2 bg-[#C5A059] hover:bg-[#b08d4b] text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 shadow"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Egzersizi Sıfırla</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: KUTU NEFESİ (BOX BREATHING)                                         */}
        {/* ========================================================================= */}
        {activeTab === 'box-breathing' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white border border-stone-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-600 border border-blue-200">
                  <Wind className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#2D2D2D]">Kutu Nefesi (Box Breathing - 4x4x4x4)</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Askeri ve spor tıbbında kullanılan bu teknik, otonom sinir sistemini yatıştırır ve nabzı hızla normale döndürür. (5-10 tur önerilir)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 p-8 shadow-sm flex flex-col items-center justify-center space-y-6 text-center relative overflow-hidden">
              
              {/* Dynamic Animated Box Indicator */}
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Box frame */}
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
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">
                    {boxPhase === 'Inhale' && '1. Aşama: Nefes Al'}
                    {boxPhase === 'HoldIn' && '2. Aşama: Nefesi Tut'}
                    {boxPhase === 'Exhale' && '3. Aşama: Nefes Ver'}
                    {boxPhase === 'HoldOut' && '4. Aşama: Bekle & Dinlen'}
                  </span>
                  
                  <span className="font-mono text-6xl font-extrabold text-[#2D2D2D] my-1">
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

              {/* Rounds Counter & Controls */}
              <div className="flex items-center gap-6 pt-2">
                <div className="text-left border-r pr-6">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Tamamlanan Tur</span>
                  <span className="font-mono text-2xl font-bold text-[#2D2D2D]">{boxRounds} / 10 Tur</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setBoxActive(!boxActive);
                      playChime(500, 'sine', 0.2);
                    }}
                    className={`px-6 py-3 font-bold text-xs uppercase tracking-widest transition-all cursor-pointer shadow flex items-center gap-2 text-white ${
                      boxActive ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#2D2D2D] hover:bg-[#C5A059]'
                    }`}
                  >
                    {boxActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>{boxActive ? 'Duraklat' : 'Nefes Egzersizini Başlat'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setBoxActive(false);
                      setBoxPhase('Inhale');
                      setBoxTimer(4);
                      setBoxRounds(0);
                    }}
                    className="p-3 bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-300 transition-colors cursor-pointer"
                    title="Sıfırla"
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
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white border border-stone-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-600 border border-emerald-200">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#2D2D2D]">Uzun Nefes Verme (Parasempatik Gevşeme)</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Nefes verme süresini nefes alma süresinden daha uzun tutmak (4 sn Alma / 6-8 sn Verme) kalp atış hızınızı doğrudan yavaşlatır.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 p-8 shadow-sm flex flex-col items-center justify-center space-y-6 text-center">
              
              {/* Exhale duration adjustment selector */}
              <div className="flex items-center gap-3 bg-stone-100 p-1.5 border border-stone-200 text-xs">
                <span className="font-bold text-stone-600 px-2">Nefes Verme Süresi:</span>
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
                    {sec} Saniye Verme
                  </button>
                ))}
              </div>

              {/* Pulsing Breathing Ring */}
              <div className="relative w-56 h-56 flex items-center justify-center">
                <div 
                  className={`rounded-full border-8 transition-all duration-1000 flex flex-col items-center justify-center ${
                    longPhase === 'Inhale' 
                      ? 'w-56 h-56 border-emerald-500 bg-emerald-50 text-emerald-900 scale-100' 
                      : 'w-40 h-40 border-teal-600 bg-teal-50 text-teal-900 scale-90'
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-500">
                    {longPhase === 'Inhale' ? '4 Sn Nefes Al' : `${longExhaleDuration} Sn Yavaşça Ver`}
                  </span>
                  <span className="font-mono text-5xl font-extrabold my-1">{longTimer}</span>
                  <span className="text-[11px] font-semibold text-[#C5A059]">
                    {longPhase === 'Inhale' ? '💨 Derin nefes çek' : '🌬️ Sakince ve uzun ver'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setLongBreathingActive(!longBreathingActive);
                    playChime(500, 'sine', 0.2);
                  }}
                  className={`px-6 py-3 font-bold text-xs uppercase tracking-widest transition-all cursor-pointer shadow flex items-center gap-2 text-white ${
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
                  className="p-3 bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-300 transition-colors cursor-pointer"
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
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white border border-stone-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-500/10 text-rose-600 border border-rose-200">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#2D2D2D]">Progresif Kas Gevşetme (PMR)</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Vücuttaki fiziksel gerginlik ile zihinsel kaygı doğrudan bağlantılıdır. Kas gruplarını 5 saniye kasıp serbest bırakarak bedenini tamamen rahatlat.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 p-8 shadow-sm space-y-6 text-center">
              
              {/* Step indicator */}
              <div className="flex items-center justify-center gap-2">
                {muscleSteps.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentMuscleStep(idx);
                      setIsTensePhase(true);
                      setMuscleTimer(5);
                    }}
                    className={`w-8 h-8 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      currentMuscleStep === idx 
                        ? 'bg-rose-600 text-white font-extrabold scale-110 shadow' 
                        : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {/* Current Body Part Focus Card */}
              <div className="p-6 bg-stone-50 border border-stone-200 space-y-3">
                <h4 className="font-serif font-bold text-xl text-[#2D2D2D]">
                  {muscleSteps[currentMuscleStep].title}
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed max-w-lg mx-auto">
                  {muscleSteps[currentMuscleStep].desc}
                </p>
              </div>

              {/* Active Tension / Release Timer */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <div 
                  className={`w-40 h-40 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-500 ${
                    isTensePhase 
                      ? 'border-rose-500 bg-rose-50 text-rose-900 scale-105' 
                      : 'border-emerald-500 bg-emerald-50 text-emerald-900 scale-95'
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-500">
                    {isTensePhase ? '💪 5 Sn Sık & Kas' : '🍃 8 Sn Serbest Bırak'}
                  </span>
                  <span className="font-mono text-5xl font-extrabold my-1">{muscleTimer}</span>
                  <span className="text-[10px] font-bold text-[#C5A059]">
                    {isTensePhase ? 'Kasları maksimum kas' : 'Gevşemeyi ve süzülmeyi hisset'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setMuscleActive(!muscleActive);
                    playChime(500, 'sine', 0.2);
                  }}
                  className={`px-6 py-3 font-bold text-xs uppercase tracking-widest transition-all cursor-pointer shadow flex items-center gap-2 text-white ${
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
        {/* TAB 5: RENK BULMA OYUNU                                                   */}
        {/* ========================================================================= */}
        {activeTab === 'color-game' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white border border-stone-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/10 text-purple-600 border border-purple-200">
                  <Palette className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#2D2D2D]">Renk & Şekil Bulma Oyunu</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Beyin aynı anda hem kaygılı düşünceleri hem de aktif algısal nesne arama görevini çalıştıramaz. Dikkati çevrenize yönlendirerek sakinleşin.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 p-8 shadow-sm space-y-6 text-center">
              
              <div className="p-6 bg-stone-50 border border-stone-200 space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-stone-200 px-3 py-1 text-stone-700">
                  GÖREV #{colorTaskIdx + 1} / {colorTasks.length}
                </span>

                <h4 className={`font-serif font-bold text-xl ${colorTasks[colorTaskIdx].text}`}>
                  {colorTasks[colorTaskIdx].prompt}
                </h4>

                {/* Counter */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  {[1, 2, 3, 4, 5].slice(0, colorTasks[colorTaskIdx].target).map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        if (num <= foundCount + 1) {
                          setFoundCount(num);
                          playChime(400 + num * 80, 'sine', 0.2);
                        }
                      }}
                      className={`w-12 h-12 rounded-full font-mono text-base font-bold transition-all cursor-pointer border-2 flex items-center justify-center ${
                        num <= foundCount
                          ? 'bg-[#C5A059] border-[#C5A059] text-stone-950 font-extrabold scale-110 shadow'
                          : 'bg-white border-stone-300 text-stone-400 hover:border-stone-400'
                      }`}
                    >
                      {num <= foundCount ? <Check className="w-5 h-5 stroke-[3]" /> : num}
                    </button>
                  ))}
                </div>

                <p className="text-xs text-stone-500 font-semibold">
                  Bulduğun her nesne için üzerindeki sayıya tıkla! ({foundCount} / {colorTasks[colorTaskIdx].target})
                </p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setColorTaskIdx((idx) => (idx + 1) % colorTasks.length);
                    setFoundCount(0);
                    playChime(550, 'sine', 0.2);
                  }}
                  className="px-6 py-3 bg-[#2D2D2D] hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Sonraki Görevi Getir</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: 100’DEN GERİ SAYMA                                                 */}
        {/* ========================================================================= */}
        {activeTab === 'countdown' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white border border-stone-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-500/10 text-teal-600 border border-teal-200">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#2D2D2D]">100’den Geri Sayma (Zihinsel Reset)</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    100’den 7’şer veya 3’er geri saymak prefrontal korteksinizi ve çalışan belleğinizi meşgul ederek duygu merkezindeki kaygı döngüsünü kırar.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 p-8 shadow-sm space-y-6 text-center">
              
              {/* Step selector */}
              <div className="flex items-center justify-center gap-3 bg-stone-100 p-2 border border-stone-200">
                <span className="text-xs font-bold text-stone-600">Adım Hızı Seç:</span>
                <button
                  onClick={() => {
                    setCountdownStep(7);
                    setCurrentNum(100);
                    setCountdownScore(0);
                  }}
                  className={`px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    countdownStep === 7 ? 'bg-teal-700 text-white shadow' : 'bg-white text-stone-600'
                  }`}
                >
                  7'şer Geri Say (Zor & Etkili)
                </button>
                <button
                  onClick={() => {
                    setCountdownStep(3);
                    setCurrentNum(100);
                    setCountdownScore(0);
                  }}
                  className={`px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    countdownStep === 3 ? 'bg-teal-700 text-white shadow' : 'bg-white text-stone-600'
                  }`}
                >
                  3'er Geri Say (Orta)
                </button>
              </div>

              {/* Display Current Number */}
              <div className="p-6 bg-stone-50 border border-stone-200 space-y-2">
                <span className="text-xs text-stone-500 font-bold uppercase tracking-wider block">Mevcut Sayın</span>
                <span className="font-mono text-6xl font-extrabold text-[#2D2D2D] block">{currentNum}</span>
                <span className="text-xs text-stone-600 font-bold">
                  ({currentNum} eksi {countdownStep} kaç eder?)
                </span>
              </div>

              <form onSubmit={handleCountdownSubmit} className="max-w-xs mx-auto space-y-3">
                <input
                  type="number"
                  placeholder="Cevabını yaz..."
                  value={userNumInput}
                  onChange={(e) => setUserNumInput(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-300 font-mono text-center text-xl font-bold focus:bg-white focus:border-teal-600 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow"
                >
                  Kontrol Et ve İlerle
                </button>
              </form>

              {countdownFeedback && (
                <p className="text-xs font-bold text-[#C5A059] bg-amber-50 p-3 border border-amber-200">
                  {countdownFeedback}
                </p>
              )}

              <div className="pt-2 border-t flex items-center justify-between text-xs text-stone-500 font-mono">
                <span>Başarılı Adım: {countdownScore}</span>
                <button
                  onClick={() => {
                    setCurrentNum(100);
                    setCountdownScore(0);
                    setCountdownFeedback('');
                  }}
                  className="text-stone-400 hover:text-stone-700 underline cursor-pointer"
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
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white border border-stone-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-600 border border-amber-200">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#2D2D2D]">Mandala Çizimi & Simetrik Sanat Terapisi</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Mandala ve simetrik motif çizmek sağ ve sol beyin yarım kürelerini dengeleyerek derin bir dinginlik ve zihinsel sakinleşme sağlar.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
              
              {/* Canvas Board */}
              <div className="relative bg-white border-2 border-stone-300 shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={360}
                  height={360}
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

              {/* Tool Controls */}
              <div className="space-y-4 text-left flex-1 w-full">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block">Renk Seçimi</label>
                  <div className="flex flex-wrap gap-2">
                    {['#C5A059', '#2D2D2D', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#F59E0B', '#EF4444'].map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        style={{ backgroundColor: color }}
                        className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                          selectedColor === color ? 'border-stone-900 scale-110 shadow' : 'border-white'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
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

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setIsSymmetry(!isSymmetry)}
                    className={`px-4 py-2 text-xs font-bold border transition-all cursor-pointer ${
                      isSymmetry ? 'bg-amber-100 border-[#C5A059] text-amber-900' : 'bg-stone-100 border-stone-300 text-stone-600'
                    }`}
                  >
                    8'li Simetri Modu: {isSymmetry ? 'AÇIK ✨' : 'KAPALI'}
                  </button>

                  <button
                    onClick={clearMandala}
                    className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Tuvali Temizle</span>
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
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white border border-stone-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-600 border border-indigo-200">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#2D2D2D]">Dikkat Noktası (Mindfulness Focal Point)</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Noktaya odaklanıp sadece nefesini izle (1-2 dakika). Zihnine bir düşünce gelirse yargılamadan nazikçe tekrar noktaya dön.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#2D2D2D] text-white p-12 shadow-xl flex flex-col items-center justify-center space-y-8 text-center relative overflow-hidden min-h-[340px]">
              
              {/* Mesmerizing Breathing Orb */}
              <div className="relative flex items-center justify-center">
                <div 
                  className={`rounded-full bg-gradient-to-r from-[#C5A059] to-amber-200 transition-all duration-[4000ms] shadow-[0_0_50px_rgba(197,160,89,0.5)] ${
                    focalActive ? 'w-32 h-32 animate-pulse scale-125' : 'w-24 h-24'
                  }`}
                />
              </div>

              <div className="space-y-2 max-w-md">
                <span className="font-mono text-3xl font-extrabold text-[#C5A059]">
                  {Math.floor(focalTimeLeft / 60)}:{(focalTimeLeft % 60).toString().padStart(2, '0')}
                </span>
                <p className="text-xs text-stone-300 font-serif italic">
                  "Sadece altın renkli merkeze odaklan... Zihnin dağılırsa fark et ve sakince noktaya geri gel."
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setFocalActive(!focalActive);
                    playChime(500, 'sine', 0.2);
                  }}
                  className={`px-6 py-3 font-bold text-xs uppercase tracking-widest transition-all cursor-pointer shadow flex items-center gap-2 text-stone-950 ${
                    focalActive ? 'bg-amber-400' : 'bg-[#C5A059] hover:bg-[#b08d4b]'
                  }`}
                >
                  {focalActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{focalActive ? 'Duraklat' : 'Noktaya Odaklanmayı Başlat'}</span>
                </button>

                <button
                  onClick={() => {
                    setFocalActive(false);
                    setFocalTimeLeft(90);
                  }}
                  className="p-3 bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors cursor-pointer"
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
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white border border-stone-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-600 border border-amber-200">
                  <Feather className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#2D2D2D]">Kelebek Kucaklaşması (Butterfly Hug - EMDR)</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Ellerini göğsünde çaprazla (sol el sağ omuzda, sağ el sol omuzda). Sırayla ritmik şekilde hafifçe dokun. Sağ ve sol beyni uyarır.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 p-8 shadow-sm flex flex-col items-center justify-center space-y-8 text-center">
              
              <div className="flex items-center justify-center gap-12">
                <div 
                  className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-300 ${
                    butterflySide === 'left' && butterflyActive
                      ? 'bg-amber-100 border-[#C5A059] text-amber-900 scale-110 shadow-lg'
                      : 'bg-stone-50 border-stone-200 text-stone-400'
                  }`}
                >
                  <span className="font-serif font-bold text-sm">SOL OMUZ</span>
                  <span className="text-[10px] font-bold">Dokun ✋</span>
                </div>

                <div 
                  className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-300 ${
                    butterflySide === 'right' && butterflyActive
                      ? 'bg-amber-100 border-[#C5A059] text-amber-900 scale-110 shadow-lg'
                      : 'bg-stone-50 border-stone-200 text-stone-400'
                  }`}
                >
                  <span className="font-serif font-bold text-sm">SAĞ OMUZ</span>
                  <span className="text-[10px] font-bold">Dokun ✋</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-[#C5A059]">Dokunuş Sayısı: {butterflyCount}</span>
                <p className="text-xs text-stone-500">Ritim ile birlikte gözlerini kapatıp 1-2 dakika uygulayabilirsin.</p>
              </div>

              <button
                onClick={() => {
                  setButterflyActive(!butterflyActive);
                  playChime(500, 'sine', 0.2);
                }}
                className={`px-6 py-3 font-bold text-xs uppercase tracking-widest transition-all cursor-pointer shadow flex items-center gap-2 text-white ${
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
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white border border-stone-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-500/10 text-sky-600 border border-sky-200">
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#2D2D2D]">Kaygı Balonu Uçurma (Düşünce Özgürleştirme)</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Aklını kurcalayan, seni kaygılandıran düşünceyi yaz, balona yükle ve gökyüzüne süzülerek yok oluşunu izle.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-sky-50 border border-sky-200 p-8 shadow-sm space-y-6 text-center relative overflow-hidden min-h-[300px]">
              
              {balloonFloating ? (
                <div className="flex flex-col items-center justify-center space-y-4 animate-bounce">
                  <div className="w-24 h-32 bg-rose-500 rounded-full text-white flex items-center justify-center p-3 text-xs font-bold shadow-2xl relative">
                    <span className="text-center font-serif leading-tight">{worryText}</span>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-2 h-3 bg-rose-700 rounded" />
                  </div>
                  <span className="text-xs font-bold text-sky-800 animate-pulse">
                    🎈 Düşüncen balona yüklendi, gökyüzüne süzülüp serbest kalıyor...
                  </span>
                </div>
              ) : (
                <form onSubmit={handleReleaseBalloon} className="max-w-md mx-auto space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
                      Seni Şu An Kaygılandıran Düşünce Nedir?
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Örn: Sınavda sürem yetişmezse diye endişeleniyorum..."
                      value={worryText}
                      onChange={(e) => setWorryText(e.target.value)}
                      className="w-full p-3 bg-white border border-stone-300 text-xs focus:border-[#C5A059] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#2D2D2D] hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Balona Yükle & Gökyüzüne Uçur 🎈</span>
                  </button>
                </form>
              )}

              {balloonHistory.length > 0 && (
                <div className="pt-4 border-t border-sky-200 text-left space-y-2">
                  <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
                    Gökyüzüne Serbest Bırakılan Düşünceler ({balloonHistory.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {balloonHistory.map((item, idx) => (
                      <span key={idx} className="bg-white/80 border border-sky-300 text-sky-900 text-[11px] px-3 py-1 rounded-full line-through opacity-75">
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
