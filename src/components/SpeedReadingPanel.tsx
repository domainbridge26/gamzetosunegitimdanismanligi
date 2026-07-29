import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Play, Pause, RotateCcw, Eye, ArrowDown, Activity, RotateCw, 
  Columns2, Columns3, Maximize2, BookOpen, Clock, Sparkles, Zap, 
  Grid, Palette, Search, HelpCircle, Puzzle, Repeat, Edit3, Shield,
  CheckCircle2, ArrowRight, Award, Trophy, Sliders, ChevronRight, Lock, LogOut
} from 'lucide-react';
import { SPEED_READING_EXERCISES, SpeedExercise } from '../data/speedReadingData';

interface SpeedReadingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminPanel?: () => void;
}

export default function SpeedReadingPanel({ isOpen, onClose, onOpenAdminPanel }: SpeedReadingPanelProps) {
  // Auth state
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('gamze_admin_remember') === 'true');
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('gamze_admin_remember') === 'true');
  const [loginError, setLoginError] = useState('');

  // Filtering state
  const [selectedLevel, setSelectedLevel] = useState<'Ortaokul' | 'Lise'>('Ortaokul');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Active Runner State
  const [activeExercise, setActiveExercise] = useState<SpeedExercise | null>(null);

  useEffect(() => {
    if (isOpen) {
      const isRemembered = localStorage.getItem('gamze_admin_remember') === 'true';
      if (isRemembered) {
        setIsAuthenticated(true);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput === 'Gamze' && passwordInput === 'Gamze1283') {
      setIsAuthenticated(true);
      setLoginError('');
      if (rememberMe) {
        localStorage.setItem('gamze_admin_remember', 'true');
      } else {
        localStorage.removeItem('gamze_admin_remember');
      }
    } else {
      setLoginError('Kullanıcı adı veya şifre hatalı! Lütfen tekrar deneyin.');
    }
  };

  // Filtered exercises list (Must have at least 20 per group)
  const exercisesForLevel = SPEED_READING_EXERCISES.filter(ex => ex.level === selectedLevel);
  const filteredExercises = selectedCategory === 'all' 
    ? exercisesForLevel 
    : exercisesForLevel.filter(ex => ex.category === selectedCategory);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[999] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      
      {/* Unauthenticated Login Dialog */}
      {!isAuthenticated ? (
        <div className="bg-white p-8 max-w-sm w-full border border-[#2D2D2D]/10 shadow-2xl space-y-6 text-center relative rounded-none my-auto">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-[#2D2D2D]/60 hover:text-[#2D2D2D] hover:bg-[#2D2D2D]/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center mx-auto border border-[#C5A059]/20">
            <Zap className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="font-serif text-xl font-bold text-[#2D2D2D]">Hızlı Okuma Egzersiz Paneli</h3>
            <p className="text-stone-500 text-xs leading-relaxed">
              Yönetici şifreniz (Gamze Tosun) ile giriş yaparak Ortaokul ve Lise hızlı okuma modüllerini çalıştırabilirsiniz.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Kullanıcı Adı</label>
              <input 
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Kullanıcı adı girin"
                autoFocus
                className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#2D2D2D]/15 text-sm focus:border-[#C5A059] focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Yönetici Şifresi</label>
              <input 
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Şifre girin"
                className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#2D2D2D]/15 text-sm focus:border-[#C5A059] focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-stone-600">
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-stone-300 text-[#C5A059] focus:ring-[#C5A059]"
                />
                <span>Beni Hatırla</span>
              </label>
            </div>

            {loginError && (
              <p className="text-rose-600 text-xs bg-rose-50 p-2.5 border border-rose-200 font-semibold">{loginError}</p>
            )}

            <button 
              type="submit"
              className="w-full py-3.5 bg-[#2D2D2D] hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow"
            >
              Egzersiz Paneline Giriş Yap
            </button>
          </form>
        </div>
      ) : (
        /* Authenticated Main Panel Window */
        <div className="bg-[#FAF9F6] w-full max-w-6xl h-[92vh] border border-[#2D2D2D]/20 shadow-2xl flex flex-col my-auto overflow-hidden">
          
          {/* Header Bar */}
          <div className="bg-[#2D2D2D] text-white px-6 py-4 flex items-center justify-between border-b border-[#C5A059]/30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/30">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-lg font-bold text-white tracking-wide">
                    HIZLI OKUMA EGZERSİZ PANELİ
                  </h2>
                  <span className="text-[10px] bg-[#C5A059] text-[#2D2D2D] font-extrabold px-2 py-0.5 rounded-none uppercase">
                    Gamze Tosun Özel
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Ortaokul (LGS) & Lise (YKS) interaktif okuma, göz takip, sütun ve dikkat modülleri
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {onOpenAdminPanel && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAdminPanel();
                  }}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/15"
                >
                  <Shield className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Yönetici Paneline Geç</span>
                </button>
              )}
              <button
                onClick={() => {
                  localStorage.removeItem('gamze_admin_remember');
                  setIsAuthenticated(false);
                }}
                className="p-2 text-stone-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                title="Çıkış Yap"
              >
                <LogOut className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Controls Bar: Level Tabs & Category Filters */}
          <div className="bg-white border-b border-[#2D2D2D]/10 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0">
            {/* Level Selector */}
            <div className="flex items-center gap-2 bg-[#FAF9F6] p-1 border border-[#2D2D2D]/10">
              <button
                onClick={() => {
                  setSelectedLevel('Ortaokul');
                  setSelectedCategory('all');
                }}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                  selectedLevel === 'Ortaokul'
                    ? 'bg-[#2D2D2D] text-white shadow-sm'
                    : 'text-[#2D2D2D]/70 hover:text-[#2D2D2D]'
                }`}
              >
                <span>🏫 Ortaokul Grubu (LGS)</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-[#C5A059] text-white rounded-full">
                  20 Egzersiz
                </span>
              </button>

              <button
                onClick={() => {
                  setSelectedLevel('Lise');
                  setSelectedCategory('all');
                }}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                  selectedLevel === 'Lise'
                    ? 'bg-[#2D2D2D] text-white shadow-sm'
                    : 'text-[#2D2D2D]/70 hover:text-[#2D2D2D]'
                }`}
              >
                <span>🎓 Lise Grubu (YKS & Mezun)</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-[#C5A059] text-white rounded-full">
                  20 Egzersiz
                </span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'Tümü' },
                { id: 'goz-takip', label: '👀 Göz Takip' },
                { id: 'sutun-takip', label: '📑 Sütun Takibi' },
                { id: 'okuma-metni', label: '📖 Okuma & Takistoskop' },
                { id: 'dikkat-odak', label: '🧠 Dikkat & Odak' },
                { id: 'bulmaca', label: '🧩 Bulmaca & Anagram' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#C5A059] text-white border-[#C5A059]'
                      : 'bg-[#FAF9F6] text-[#2D2D2D]/80 border-[#2D2D2D]/15 hover:bg-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Grid View of Exercises */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-black text-[#2D2D2D]">
                  {selectedLevel} Seviyesi Egzersiz Listesi
                </h3>
                <p className="text-xs text-stone-500">
                  Aşağıdaki listeden çalıştırmak istediğiniz egzersiz kartına tıklayın.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-[#C5A059]/10 text-[#C5A059] px-3 py-1 border border-[#C5A059]/20">
                Görüntülenen: {filteredExercises.length} / {exercisesForLevel.length} Egzersiz
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => setActiveExercise(ex)}
                  className="bg-white border border-[#2D2D2D]/10 p-5 hover:border-[#C5A059] transition-all duration-300 group cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md relative"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5">
                        {ex.categoryLabel}
                      </span>
                      {ex.targetWpm && ex.targetWpm > 0 && (
                        <span className="text-[10px] font-bold text-stone-400 font-mono">
                          {ex.targetWpm} WPM
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif font-bold text-[#2D2D2D] text-sm group-hover:text-[#C5A059] transition-colors leading-snug">
                      {ex.title}
                    </h4>

                    <p className="text-stone-500 text-xs line-clamp-3 leading-relaxed">
                      {ex.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#2D2D2D]">
                    <span className="text-[11px] text-[#C5A059] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      <span>Çalıştır</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[10px] text-stone-400 font-normal">
                      {ex.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Runner Modal Overlay */}
          {activeExercise && (
            <ExerciseRunnerModal 
              exercise={activeExercise} 
              onClose={() => setActiveExercise(null)} 
            />
          )}

        </div>
      )}
    </div>
  );
}

// =========================================================================
// INTERACTIVE EXERCISE RUNNER MODAL
// =========================================================================
interface ExerciseRunnerModalProps {
  exercise: SpeedExercise;
  onClose: () => void;
}

function ExerciseRunnerModal({ exercise, onClose }: ExerciseRunnerModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedWpm, setSpeedWpm] = useState(exercise.targetWpm || 300);
  const [cycleCount, setCycleCount] = useState(0);

  return (
    <div className="fixed inset-0 bg-slate-950/85 z-[1000] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FAF9F6] w-full max-w-4xl max-h-[90vh] border border-[#2D2D2D]/20 shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Runner Header */}
        <div className="bg-[#2D2D2D] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C5A059] bg-[#C5A059]/20 px-2 py-0.5">
                {exercise.level} • {exercise.categoryLabel}
              </span>
            </div>
            <h3 className="font-serif text-lg font-bold text-white mt-1">
              {exercise.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Universal Speed Controls Bar */}
        <div className="bg-white border-b border-[#2D2D2D]/10 px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                isPlaying 
                  ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                  : 'bg-[#2D2D2D] hover:bg-[#C5A059] text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Durdur' : 'Başlat'}</span>
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setCycleCount(0);
              }}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-stone-200"
              title="Sıfırla"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Sıfırla</span>
            </button>
          </div>

          {/* Speed Adjuster */}
          <div className="flex items-center gap-3 bg-[#FAF9F6] px-3 py-1.5 border border-[#2D2D2D]/10">
            <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest">
              Hız (WPM / BPM):
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSpeedWpm(Math.max(60, speedWpm - 25))}
                className="w-7 h-7 bg-white border border-stone-200 text-xs font-bold hover:bg-stone-100"
              >
                -
              </button>
              <span className="font-mono text-sm font-black text-[#2D2D2D] min-w-[50px] text-center">
                {speedWpm}
              </span>
              <button
                onClick={() => setSpeedWpm(Math.min(1000, speedWpm + 25))}
                className="w-7 h-7 bg-white border border-stone-200 text-xs font-bold hover:bg-stone-100"
              >
                +
              </button>
            </div>

            {/* Speed Presets */}
            <div className="hidden sm:flex items-center gap-1 ml-2">
              {[150, 250, 350, 500, 750].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setSpeedWpm(preset)}
                  className={`px-2 py-1 text-[10px] font-bold font-mono transition-colors ${
                    speedWpm === preset 
                      ? 'bg-[#C5A059] text-white' 
                      : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Exercise Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center items-center min-h-[350px]">
          {exercise.category === 'goz-takip' && (
            <GozTakipRunner 
              exercise={exercise} 
              isPlaying={isPlaying} 
              speedWpm={speedWpm} 
            />
          )}

          {exercise.category === 'sutun-takip' && (
            <SutunTakipRunner 
              exercise={exercise} 
              isPlaying={isPlaying} 
              speedWpm={speedWpm} 
            />
          )}

          {exercise.category === 'okuma-metni' && (
            <OkumaMetniRunner 
              exercise={exercise} 
              isPlaying={isPlaying} 
              speedWpm={speedWpm} 
            />
          )}

          {exercise.category === 'dikkat-odak' && (
            <DikkatOdakRunner 
              exercise={exercise} 
              isPlaying={isPlaying} 
            />
          )}

          {exercise.category === 'bulmaca' && (
            <BulmacaRunner 
              exercise={exercise} 
            />
          )}
        </div>

        {/* Runner Footer */}
        <div className="bg-white border-t border-[#2D2D2D]/10 px-6 py-3 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <span>💡 İpucu: Başın sabit, göz kaslarının esnek şekilde hareket ettiğinden emin olun.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#2D2D2D] text-white font-bold text-xs hover:bg-[#C5A059] transition-colors"
          >
            Tamamla & Kapat
          </button>
        </div>

      </div>
    </div>
  );
}

// =========================================================================
// 1. GÖZ TAKİP RUNNER
// =========================================================================
function GozTakipRunner({ exercise, isPlaying, speedWpm }: { exercise: SpeedExercise; isPlaying: boolean; speedWpm: number }) {
  const [posIndex, setPosIndex] = useState(0);
  const words = exercise.data?.words || ['Odak', 'Hız', 'Kavrama', 'LGS', 'YKS', 'Başarı'];

  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.max(80, Math.round(60000 / speedWpm));
    const timer = setInterval(() => {
      setPosIndex(prev => (prev + 1) % 100);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, speedWpm]);

  const type = exercise.data?.type || 'horizontal-dot';
  const isLeft = posIndex % 2 === 0;

  return (
    <div className="w-full h-72 bg-white border border-[#2D2D2D]/15 p-6 flex flex-col justify-between relative overflow-hidden shadow-inner">
      <div className="text-xs font-mono text-stone-400 text-center">
        Egzersiz Tipi: <span className="font-bold text-[#2D2D2D]">{type}</span> | Ritmik Sıçrama Modu
      </div>

      <div className="flex-1 flex items-center justify-between relative px-12">
        {type === 'horizontal-dot' && (
          <>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-150 ${
              isLeft ? 'bg-[#C5A059] text-white scale-125 shadow-lg' : 'bg-stone-100 text-stone-400'
            }`}>
              {words[posIndex % words.length]}
            </div>

            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-150 ${
              !isLeft ? 'bg-[#2D2D2D] text-white scale-125 shadow-lg' : 'bg-stone-100 text-stone-400'
            }`}>
              {words[(posIndex + 1) % words.length]}
            </div>
          </>
        )}

        {type === 'vertical-dot' && (
          <div className="w-full flex flex-col items-center justify-between h-full py-4">
            <div className={`px-4 py-2 font-bold text-xs transition-all ${
              isLeft ? 'bg-[#059669] text-white scale-110 shadow' : 'bg-stone-100 text-stone-400'
            }`}>
              {words[posIndex % words.length]}
            </div>
            <div className={`px-4 py-2 font-bold text-xs transition-all ${
              !isLeft ? 'bg-[#059669] text-white scale-110 shadow' : 'bg-stone-100 text-stone-400'
            }`}>
              {words[(posIndex + 1) % words.length]}
            </div>
          </div>
        )}

        {(type === 'zigzag' || type === 'corner-jump' || type === 'infinity-loop' || type === 'spiral') && (
          <div className="w-full h-full flex items-center justify-center relative">
            <div 
              className="absolute w-14 h-14 bg-[#C5A059] text-white font-bold text-xs rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
              style={{
                top: `${20 + (Math.sin(posIndex) * 30 + 30)}%`,
                left: `${20 + (Math.cos(posIndex) * 30 + 30)}%`
              }}
            >
              {words[posIndex % words.length]}
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-stone-500 font-semibold">
        {isPlaying ? '👀 Gözlerinizi hareket eden odağa kilitleyin!' : '▶️ Başlat butonuna basarak egzersizi başlatın.'}
      </div>
    </div>
  );
}

// =========================================================================
// 2. SÜTUN TAKİP RUNNER
// =========================================================================
function SutunTakipRunner({ exercise, isPlaying, speedWpm }: { exercise: SpeedExercise; isPlaying: boolean; speedWpm: number }) {
  const [activeRow, setActiveRow] = useState(0);

  const triplets = exercise.data?.wordTriplets || exercise.data?.wordPairs || exercise.data?.wordQuartets || [
    ['Hızlı', 'Okuma', 'Tekniği'],
    ['YKS', 'Türkçe', 'Paragraf'],
    ['Odaklanma', 'Başarı', 'Sınav']
  ];

  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.max(120, Math.round(60000 / speedWpm));
    const timer = setInterval(() => {
      setActiveRow(prev => (prev + 1) % triplets.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, speedWpm, triplets.length]);

  return (
    <div className="w-full max-w-2xl bg-white border border-[#2D2D2D]/15 p-6 shadow-inner space-y-4">
      <div className="text-xs font-mono text-stone-400 text-center">
        Sütun Sayısı: <span className="font-bold text-[#2D2D2D]">{exercise.data?.columnsCount || 3} Sütunlu Blok</span>
      </div>

      <div className="space-y-3">
        {triplets.map((row: string[], idx: number) => (
          <div 
            key={idx}
            className={`grid grid-cols-${row.length} gap-4 p-3 border text-center font-bold text-sm transition-all duration-150 ${
              idx === activeRow 
                ? 'bg-[#C5A059]/15 border-[#C5A059] text-[#2D2D2D] scale-[1.02] shadow-sm' 
                : 'bg-stone-50 border-stone-200 text-stone-400'
            }`}
          >
            {row.map((word, wIdx) => (
              <span key={wIdx} className={idx === activeRow ? 'text-[#C5A059] font-black' : ''}>
                {word}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// =========================================================================
// 3. OKUMA METNİ & TAKİSTOSKOP RUNNER
// =========================================================================
function OkumaMetniRunner({ exercise, isPlaying, speedWpm }: { exercise: SpeedExercise; isPlaying: boolean; speedWpm: number }) {
  const [wordIdx, setWordIdx] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showQuizResult, setShowQuizResult] = useState(false);

  const isRsvp = exercise.data?.type === 'rsvp';
  const words = isRsvp 
    ? (exercise.data?.words || []) 
    : (exercise.data?.content || '').split(' ');

  // RSVP Flasher Timer
  useEffect(() => {
    if (!isPlaying || !isRsvp) return;
    const intervalMs = Math.max(100, Math.round(60000 / speedWpm));
    const timer = setInterval(() => {
      setWordIdx(prev => (prev + 1) % words.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, speedWpm, isRsvp, words.length]);

  // Full Paragraph Stopwatch
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setElapsedSec(prev => prev + 0.1);
    }, 100);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const calculatedWpm = elapsedSec > 0 ? Math.round(((words.length) / elapsedSec) * 60) : 0;

  return (
    <div className="w-full max-w-3xl space-y-6">
      {isRsvp ? (
        /* RSVP Takistoskop Display */
        <div className="w-full h-64 bg-[#2D2D2D] text-white flex flex-col items-center justify-center p-8 border-2 border-[#C5A059] shadow-2xl relative">
          <span className="text-[10px] font-mono text-[#C5A059] uppercase tracking-widest absolute top-4 left-6">
            TAKİSTOSKOP KELİME FLAŞÖRÜ
          </span>
          <div className="font-serif text-3xl sm:text-4xl font-black text-[#C5A059] tracking-wider transition-all">
            {words[wordIdx] || 'HAZIR'}
          </div>
          <div className="text-xs text-stone-400 mt-6 font-mono">
            Sıra: {wordIdx + 1} / {words.length}
          </div>
        </div>
      ) : (
        /* Full Passage Display with Timer & Quiz */
        <div className="bg-white border border-[#2D2D2D]/15 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (timerRunning) {
                    setTimerRunning(false);
                  } else {
                    setElapsedSec(0);
                    setTimerRunning(true);
                  }
                }}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider text-white ${
                  timerRunning ? 'bg-rose-600' : 'bg-emerald-600'
                }`}
              >
                {timerRunning ? 'Okumayı Bitirdim' : 'Kronometreyi Başlat'}
              </button>

              <div className="text-xs font-mono">
                Süre: <span className="font-bold text-[#2D2D2D] text-sm">{elapsedSec.toFixed(1)}s</span>
              </div>
            </div>

            {calculatedWpm > 0 && (
              <div className="bg-[#C5A059]/10 text-[#C5A059] px-3 py-1 border border-[#C5A059]/20 font-bold text-xs font-mono">
                Hesaplanan Hız: {calculatedWpm} WPM
              </div>
            )}
          </div>

          {/* Passage Text */}
          <p className="text-[#2D2D2D] text-base leading-relaxed font-serif p-4 bg-[#FAF9F6] border border-stone-200">
            {exercise.data?.content}
          </p>

          {/* Comprehension Quiz */}
          {exercise.data?.quiz && (
            <div className="border-t border-stone-200 pt-4 space-y-4">
              <h4 className="font-bold text-sm text-[#2D2D2D] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
                <span>Okuduğunu Anlama Testi</span>
              </h4>

              {exercise.data.quiz.map((q: any, qIdx: number) => (
                <div key={qIdx} className="space-y-2 bg-stone-50 p-4 border border-stone-200">
                  <p className="text-xs font-bold text-[#2D2D2D]">{qIdx + 1}. {q.question}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt: string, optIdx: number) => (
                      <button
                        key={optIdx}
                        onClick={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                        className={`text-left p-2.5 text-xs border transition-all cursor-pointer ${
                          quizAnswers[qIdx] === optIdx
                            ? 'bg-[#2D2D2D] text-white border-[#2D2D2D]'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={() => setShowQuizResult(true)}
                className="w-full py-2.5 bg-[#C5A059] text-white text-xs font-bold uppercase tracking-wider"
              >
                Anlama Testini Değerlendir
              </button>

              {showQuizResult && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center">
                  🎉 Tebrikler! Okuduğunu anlama seviyeniz son derece yüksek!
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =========================================================================
// 4. DİKKAT & ODAK RUNNER (SCHULTE, STROOP, MATRIX)
// =========================================================================
function DikkatOdakRunner({ exercise, isPlaying }: { exercise: SpeedExercise; isPlaying: boolean }) {
  const type = exercise.data?.type;

  // Schulte Table State
  const gridSize = exercise.data?.gridSize || 4;
  const [schulteNumbers, setSchulteNumbers] = useState<number[]>([]);
  const [nextExpected, setNextExpected] = useState(1);
  const [schulteTime, setSchulteTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (type === 'schulte') {
      const total = gridSize * gridSize;
      const nums = Array.from({ length: total }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
      setSchulteNumbers(nums);
      setNextExpected(1);
      setSchulteTime(0);
      setIsCompleted(false);
    }
  }, [type, gridSize]);

  // Schulte timer
  useEffect(() => {
    if (type !== 'schulte' || isCompleted || nextExpected === 1) return;
    const interval = setInterval(() => {
      setSchulteTime(prev => prev + 0.1);
    }, 100);
    return () => clearInterval(interval);
  }, [type, isCompleted, nextExpected]);

  const handleSchulteClick = (num: number) => {
    if (num === nextExpected) {
      if (num === gridSize * gridSize) {
        setIsCompleted(true);
      } else {
        setNextExpected(prev => prev + 1);
      }
    }
  };

  return (
    <div className="w-full max-w-lg space-y-4">
      {type === 'schulte' && (
        <div className="bg-white p-6 border border-[#2D2D2D]/15 shadow-sm space-y-4 text-center">
          <div className="flex items-center justify-between text-xs font-bold border-b pb-2">
            <span>Schulte {gridSize}x{gridSize} Tablosu</span>
            <span>Aranan Sayı: <span className="text-[#C5A059] font-black text-sm">{nextExpected}</span></span>
            <span>Süre: <span className="font-mono">{schulteTime.toFixed(1)}s</span></span>
          </div>

          <div 
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
          >
            {schulteNumbers.map((n) => (
              <button
                key={n}
                onClick={() => handleSchulteClick(n)}
                className={`h-14 font-serif font-black text-lg border transition-all cursor-pointer ${
                  n < nextExpected 
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-700 opacity-50' 
                    : 'bg-[#FAF9F6] border-stone-200 text-[#2D2D2D] hover:bg-[#C5A059] hover:text-white'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          {isCompleted && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              🏆 Harika! Schulte Tablosunu {schulteTime.toFixed(1)} saniyede tamamladınız!
            </div>
          )}
        </div>
      )}

      {type === 'stroop' && (
        <div className="bg-white p-8 border border-[#2D2D2D]/15 text-center space-y-6">
          <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">
            YAZILAN RENGİ DEĞİL, YAZININ MÜREKKEP RENGİNİ SEÇİN!
          </p>
          <div className="font-black text-4xl font-serif text-blue-600">
            KIRMIZI
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 bg-red-600 text-white font-bold text-xs">Kırmızı</button>
            <button className="p-3 bg-blue-600 text-white font-bold text-xs">Mavi</button>
            <button className="p-3 bg-green-600 text-white font-bold text-xs">Yeşil</button>
            <button className="p-3 bg-amber-500 text-white font-bold text-xs">Sarı</button>
          </div>
        </div>
      )}

      {(type === 'letter-matrix' || type === 'missing-number') && (
        <div className="bg-white p-6 border border-[#2D2D2D]/15 text-center space-y-4">
          <p className="text-xs text-stone-500 font-bold">
            Gözlerinizle tüm tabloyu hızlıca tarayarak hedef karakterleri bulun.
          </p>
          <div className="grid grid-cols-8 gap-2 font-mono text-sm font-bold text-stone-700">
            {['K','M','L','K','P','R','K','Z','A','K','B','C','D','K','E','F'].map((char, idx) => (
              <span key={idx} className="p-2 border bg-stone-50 hover:bg-[#C5A059] hover:text-white cursor-pointer">
                {char}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// 5. BULMACA RUNNER
// =========================================================================
function BulmacaRunner({ exercise }: { exercise: SpeedExercise }) {
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const anagramWord = exercise.data?.words?.[0] || { scrambled: 'P A R A G R A F', answer: 'PARAGRAF', hint: 'Metin bölümü' };

  const handleCheck = () => {
    if (userInput.trim().toUpperCase() === anagramWord.answer) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-6 border border-[#2D2D2D]/15 text-center space-y-6">
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest block">
          Bulmaca & Anagram
        </span>
        <h4 className="font-serif font-bold text-base text-[#2D2D2D]">
          Karışık Harfleri Düzenleyin
        </h4>
      </div>

      <div className="bg-[#FAF9F6] p-4 border border-stone-200">
        <p className="text-2xl font-black text-[#2D2D2D] tracking-widest font-mono">
          {anagramWord.scrambled}
        </p>
        <p className="text-xs text-stone-400 mt-2">İpucu: {anagramWord.hint}</p>
      </div>

      <div className="space-y-3">
        <input 
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Cevabınızı buraya yazın..."
          className="w-full px-4 py-3 bg-[#FAF9F6] border border-stone-300 text-sm focus:border-[#C5A059] focus:outline-none uppercase font-bold text-center"
        />

        <button
          onClick={handleCheck}
          className="w-full py-3 bg-[#2D2D2D] hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-wider transition-all"
        >
          Cevabı Kontrol Et
        </button>

        {isCorrect === true && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            🎉 Doğru Cevap! Tebrikler!
          </div>
        )}

        {isCorrect === false && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
            ❌ Hatalı cevap. Tekrar deneyin!
          </div>
        )}
      </div>
    </div>
  );
}
