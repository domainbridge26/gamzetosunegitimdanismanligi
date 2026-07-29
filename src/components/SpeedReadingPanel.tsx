import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Play, Pause, RotateCcw, Eye, ArrowDown, Activity, RotateCw, 
  Columns2, Columns3, Maximize2, BookOpen, Clock, Sparkles, Zap, 
  Grid, Palette, Search, HelpCircle, Puzzle, Repeat, Edit3, Shield,
  CheckCircle2, ArrowRight, Award, Trophy, Sliders, ChevronRight, Lock, LogOut,
  Volume2, VolumeX, User, UserPlus, Trash2, Key, GraduationCap, Star, Check, RefreshCw,
  Target, Brain, Timer
} from 'lucide-react';
import { SPEED_READING_EXERCISES, SpeedExercise } from '../data/speedReadingData';
import { StudentAccount, ExerciseResult } from '../types';
import { dbGetStudents, dbAddStudent, dbDeleteStudent, dbUpdateStudent, DEFAULT_STUDENTS } from '../lib/firebase';

// =========================================================================
// RICH TURKISH SPEED READING & ACCELERATED VOCABULARY POOL
// =========================================================================
const TURKISH_WORD_POOL = [
  'Odaklanma', 'Konsantrasyon', 'Kavrayış', 'Performans', 'Gelişim', 'Hızlı Okuma', 'Disiplin', 'Muhakeme', 
  'Akıl Yürütme', 'Analitik', 'Hafıza', 'Süreç', 'Teknik', 'Metot', 'Başarı', 'Derinlik', 'Strateji', 
  'Algılama', 'Mantık', 'Vizyon', 'Göz Esnekliği', 'Koni Genişletme', 'Kavram', 'Hipotez', 'Metin', 
  'Çıkarım', 'Paradoks', 'Sentez', 'Paragraf', 'Analiz', 'Somut', 'Soyut', 'Tümdengelim', 'Tümevarım', 
  'Nesnel', 'Öznel', 'Neden-Sonuç', 'Amaç-Sonuç', 'Yalınlık', 'Özgünlük', 'Bütünlük', 'Bilinç', 
  'Zaman Yönetimi', 'Turlama Taktiği', 'Dikkat Süresi', 'Nöroplastisite', 'Zihinsel Güç', 'Motivasyon',
  'Derece', 'Felsefe', 'Edebiyat', 'Kuantum', 'Biyoloji', 'Toplumcu', 'Epistemoloji', 'Ontoloji', 'Aksiyoloji'
];

// Helper to get array of N random unique words from pool
function getRandomWords(count: number, exclude?: string[]): string[] {
  const available = TURKISH_WORD_POOL.filter(w => !exclude?.includes(w));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// =========================================================================
// WEB AUDIO SYNTHESIZER FOR EXERCISES
// =========================================================================
let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const playExerciseTickSound = (isSoundEnabled: boolean = true) => {
  if (!isSoundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.04);
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {}
};

export const playExerciseStartSound = (isSoundEnabled: boolean = true) => {
  if (!isSoundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.frequency.setValueAtTime(523.25, now);
    gain1.gain.setValueAtTime(0.1, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.1);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.frequency.setValueAtTime(659.25, now + 0.08);
    gain2.gain.setValueAtTime(0.12, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.22);
  } catch (e) {}
};

export const playExerciseSuccessSound = (isSoundEnabled: boolean = true) => {
  if (!isSoundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.12, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.18);
    });
  } catch (e) {}
};

export const playExerciseClickSound = (isSoundEnabled: boolean = true) => {
  if (!isSoundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.035);
  } catch (e) {}
};

interface SpeedReadingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminPanel?: () => void;
}

export default function SpeedReadingPanel({ isOpen, onClose, onOpenAdminPanel }: SpeedReadingPanelProps) {
  // Auth state
  const [loginRole, setLoginRole] = useState<'trainer' | 'student'>('student');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('gamze_speedreading_remember') === 'true';
  });
  const [loginError, setLoginError] = useState('');

  // Active User Session
  const [currentUser, setCurrentUser] = useState<{
    role: 'trainer' | 'student';
    username: string;
    fullName: string;
    studentClass?: string;
  } | null>(() => {
    const isRemembered = localStorage.getItem('gamze_speedreading_remember') === 'true';
    if (isRemembered) {
      const rawUser = localStorage.getItem('gamze_speedreading_user');
      if (rawUser) {
        try { return JSON.parse(rawUser); } catch(e){}
      }
      return { role: 'trainer', username: 'Gamze', fullName: 'Gamze Tosun' };
    }
    return null;
  });

  // Students Data list
  const [students, setStudents] = useState<StudentAccount[]>(DEFAULT_STUDENTS);

  // Student Accounts Management Modal (Trainer view)
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentUsername, setNewStudentUsername] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('8. Sınıf (LGS)');
  const [studentActionMsg, setStudentActionMsg] = useState('');

  // Global Audio Enable state
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // Filtering state
  const [selectedLevel, setSelectedLevel] = useState<'Ortaokul' | 'Lise'>('Ortaokul');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Active Runner State
  const [activeExercise, setActiveExercise] = useState<SpeedExercise | null>(null);

  // Load student credentials from Firestore / localStorage
  useEffect(() => {
    dbGetStudents().then(data => {
      setStudents(data);
    });
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const isRemembered = localStorage.getItem('gamze_speedreading_remember') === 'true';
      if (isRemembered && !currentUser) {
        const rawUser = localStorage.getItem('gamze_speedreading_user');
        if (rawUser) {
          try { setCurrentUser(JSON.parse(rawUser)); } catch(e){}
        } else {
          setCurrentUser({ role: 'trainer', username: 'Gamze', fullName: 'Gamze Tosun' });
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    playExerciseClickSound(isSoundEnabled);

    if (loginRole === 'trainer') {
      if (usernameInput.trim() === 'Gamze' && passwordInput === 'Gamze1283') {
        const trainerUser = { role: 'trainer' as const, username: 'Gamze', fullName: 'Gamze Tosun' };
        setCurrentUser(trainerUser);
        if (rememberMe) {
          localStorage.setItem('gamze_speedreading_remember', 'true');
          localStorage.setItem('gamze_speedreading_user', JSON.stringify(trainerUser));
        } else {
          localStorage.removeItem('gamze_speedreading_remember');
          localStorage.removeItem('gamze_speedreading_user');
        }
      } else {
        setLoginError('Eğitmen kullanıcı adı veya şifre hatalı! (Gamze / Gamze1283)');
      }
    } else {
      // Student Login Check
      const targetUser = usernameInput.trim();
      const match = students.find(s => s.username.toLowerCase() === targetUser.toLowerCase() && s.password === passwordInput);
      
      if (match) {
        const studentUser = {
          role: 'student' as const,
          username: match.username,
          fullName: match.fullName,
          studentClass: match.studentClass
        };
        setCurrentUser(studentUser);
        if (rememberMe) {
          localStorage.setItem('gamze_speedreading_remember', 'true');
          localStorage.setItem('gamze_speedreading_user', JSON.stringify(studentUser));
        } else {
          localStorage.removeItem('gamze_speedreading_remember');
          localStorage.removeItem('gamze_speedreading_user');
        }
      } else {
        setLoginError('Öğrenci kullanıcı adı veya şifre hatalı! Lütfen eğitmeninizden hesabınızı kontrol etmesini isteyin.');
      }
    }
  };

  const handleLogout = () => {
    playExerciseClickSound(isSoundEnabled);
    setCurrentUser(null);
    localStorage.removeItem('gamze_speedreading_remember');
    localStorage.removeItem('gamze_speedreading_user');
    setUsernameInput('');
    setPasswordInput('');
  };

  // Student creation handler
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentUsername || !newStudentPassword) {
      setStudentActionMsg('Lütfen tüm alanları doldurunuz.');
      return;
    }
    const cleanUsername = newStudentUsername.trim().toLowerCase();
    if (students.some(s => s.username.toLowerCase() === cleanUsername)) {
      setStudentActionMsg('Bu kullanıcı adı zaten kullanılıyor! Başka bir kullanıcı adı seçin.');
      return;
    }

    const created = await dbAddStudent({
      fullName: newStudentName.trim(),
      username: cleanUsername,
      password: newStudentPassword.trim(),
      studentClass: newStudentClass,
      createdAt: new Date().toLocaleDateString('tr-TR')
    });

    setStudents(prev => [...prev, created]);
    setNewStudentName('');
    setNewStudentUsername('');
    setNewStudentPassword('');
    setStudentActionMsg(`✅ "${created.fullName}" öğrencisi başarıyla eklendi!`);
    playExerciseSuccessSound(isSoundEnabled);
    setTimeout(() => setStudentActionMsg(''), 4000);
  };

  // Student deletion handler
  const handleDeleteStudent = async (id: string, name: string) => {
    if (window.confirm(`"${name}" adlı öğrenciyi silmek istediğinize emin misiniz?`)) {
      await dbDeleteStudent(id);
      setStudents(prev => prev.filter(s => s.id !== id));
      playExerciseClickSound(isSoundEnabled);
    }
  };

  // Filtered exercises list
  const exercisesForLevel = SPEED_READING_EXERCISES.filter(ex => ex.level === selectedLevel);
  const filteredExercises = selectedCategory === 'all' 
    ? exercisesForLevel 
    : exercisesForLevel.filter(ex => ex.category === selectedCategory);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[999] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      
      {/* Unauthenticated Login Dialog */}
      {!currentUser ? (
        <div className="bg-white p-6 sm:p-8 max-w-md w-full border border-[#2D2D2D]/10 shadow-2xl space-y-6 text-center relative rounded-none my-auto">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-[#2D2D2D]/60 hover:text-[#2D2D2D] hover:bg-[#2D2D2D]/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center mx-auto border border-[#C5A059]/20">
            <Zap className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="font-serif text-xl font-bold text-[#2D2D2D]">Hızlı Okuma Portalı Girişi</h3>
            <p className="text-stone-500 text-xs">
              Egzersiz panelini çalıştırmak için kullanıcı türünüzü seçip giriş yapın.
            </p>
          </div>

          {/* Login Type Tabs */}
          <div className="grid grid-cols-2 p-1 bg-stone-100 border border-stone-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setLoginRole('student');
                setLoginError('');
                playExerciseClickSound(isSoundEnabled);
              }}
              className={`py-2.5 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                loginRole === 'student'
                  ? 'bg-white text-[#C5A059] shadow-sm font-extrabold border border-stone-200'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Öğrenci Girişi</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginRole('trainer');
                setLoginError('');
                playExerciseClickSound(isSoundEnabled);
              }}
              className={`py-2.5 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                loginRole === 'trainer'
                  ? 'bg-white text-[#2D2D2D] shadow-sm font-extrabold border border-stone-200'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Shield className="w-4 h-4 text-[#C5A059]" />
              <span>Eğitmen Girişi</span>
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">
                {loginRole === 'trainer' ? 'Eğitmen Kullanıcı Adı' : 'Öğrenci Kullanıcı Adı'}
              </label>
              <input 
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder={loginRole === 'trainer' ? 'Gamze' : 'Örn: ogrenci1'}
                autoFocus
                className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#2D2D2D]/15 text-sm focus:border-[#C5A059] focus:outline-none transition-colors font-medium text-[#2D2D2D]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Şifre</label>
              <input 
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#2D2D2D]/15 text-sm focus:border-[#C5A059] focus:outline-none transition-colors font-medium text-[#2D2D2D]"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1 select-none">
              <label className="flex items-center gap-2 cursor-pointer text-stone-600 font-medium">
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-[#C5A059] rounded cursor-pointer"
                />
                <span>Beni Hatırla</span>
              </label>

              {loginRole === 'trainer' ? (
                <span className="text-[10px] text-stone-400 font-mono">Gamze / Gamze1283</span>
              ) : (
                <span className="text-[10px] text-stone-400 font-mono">Demo: ogrenci1 / 123456</span>
              )}
            </div>

            {loginError && (
              <p className="text-rose-600 text-xs bg-rose-50 p-2.5 border border-rose-200 font-semibold">{loginError}</p>
            )}

            <button 
              type="submit"
              className="w-full py-3.5 bg-[#C5A059] hover:bg-[#b08d4b] text-white text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{loginRole === 'trainer' ? 'Eğitmen Paneline Giriş Yap' : 'Öğrenci Paneline Giriş Yap'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-400">
            {loginRole === 'student' ? (
              <p>Eğitmeniniz Gamze Tosun size özel kullanıcı adı ve şifre tanımlamaktadır.</p>
            ) : (
              <p>Eğitmen paneli ile öğrencilerinize yeni şifreler ve hesaplar tanımlayabilirsiniz.</p>
            )}
          </div>
        </div>
      ) : (
        /* Authenticated Main Panel Window */
        <div className="bg-[#FAF9F6] w-full max-w-6xl h-[92vh] border border-[#2D2D2D]/20 shadow-2xl flex flex-col overflow-hidden relative rounded-none">
          
          {/* Header Bar */}
          <div className="bg-[#2D2D2D] text-white p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#C5A059]/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#C5A059] text-white">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-sm sm:text-base text-white tracking-wide flex items-center gap-2">
                  <span>HIZLI OKUMA EGZERSİZ VE ÖLÇÜM PORTALI</span>
                  <span className="text-[10px] font-sans font-extrabold bg-[#C5A059] text-stone-950 px-2 py-0.5 rounded-full uppercase">
                    PRO
                  </span>
                </h2>
                <p className="text-stone-400 text-[11px]">
                  Gamze Tosun Eğitim & Danışmanlık • Ortaokul (LGS) ve Lise (YKS) Modülleri
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Sound Toggle */}
              <button
                onClick={() => {
                  setIsSoundEnabled(!isSoundEnabled);
                  playExerciseClickSound(!isSoundEnabled);
                }}
                className={`p-2 border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isSoundEnabled 
                    ? 'border-[#C5A059]/50 text-[#C5A059] bg-[#C5A059]/10 hover:bg-[#C5A059]/20' 
                    : 'border-stone-600 text-stone-400 bg-stone-800 hover:bg-stone-700'
                }`}
                title={isSoundEnabled ? 'Egzersiz sesleri açık (Sesi kapat)' : 'Egzersiz sesleri kapalı (Sesi aç)'}
              >
                {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline">{isSoundEnabled ? 'Ses Açık' : 'Ses Kapalı'}</span>
              </button>

              {/* User Identity Info */}
              <div className="px-3 py-1.5 bg-stone-800 border border-stone-700 text-xs flex items-center gap-2">
                {currentUser.role === 'trainer' ? (
                  <>
                    <Shield className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="font-bold text-amber-300">Eğitmen: {currentUser.fullName}</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-bold text-emerald-300">Öğrenci: {currentUser.fullName}</span>
                  </>
                )}
              </div>

              {/* Student Management Button for Trainer */}
              {currentUser.role === 'trainer' && (
                <button
                  onClick={() => {
                    setIsStudentModalOpen(true);
                    playExerciseClickSound(isSoundEnabled);
                  }}
                  className="px-3 py-1.5 bg-[#C5A059] hover:bg-[#b08d4b] text-stone-950 text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Öğrenci Hesap Yönetimi</span>
                </button>
              )}

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="p-2 border border-stone-700 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
                title="Çıkış Yap"
              >
                <LogOut className="w-4 h-4" />
              </button>

              <button 
                onClick={onClose}
                className="p-2 border border-stone-700 text-stone-400 hover:text-white hover:bg-rose-950 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Level Tabs: ORTAOKUL (LGS) vs LİSE (YKS) */}
          <div className="bg-stone-200/70 border-b border-stone-300 px-4 pt-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedLevel('Ortaokul');
                  setSelectedCategory('all');
                  setActiveExercise(null);
                  playExerciseClickSound(isSoundEnabled);
                }}
                className={`px-6 py-2.5 text-xs font-bold uppercase tracking-widest border-t-2 transition-all cursor-pointer ${
                  selectedLevel === 'Ortaokul'
                    ? 'bg-[#FAF9F6] border-[#C5A059] text-[#2D2D2D] shadow-sm font-extrabold'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                🏫 Ortaokul Modülü (LGS Hazırlık)
              </button>

              <button
                onClick={() => {
                  setSelectedLevel('Lise');
                  setSelectedCategory('all');
                  setActiveExercise(null);
                  playExerciseClickSound(isSoundEnabled);
                }}
                className={`px-6 py-2.5 text-xs font-bold uppercase tracking-widest border-t-2 transition-all cursor-pointer ${
                  selectedLevel === 'Lise'
                    ? 'bg-[#FAF9F6] border-[#C5A059] text-[#2D2D2D] shadow-sm font-extrabold'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                🎓 Lise & YKS Modülü (TYT / AYT)
              </button>
            </div>

            <div className="text-xs font-bold text-stone-600 hidden lg:block">
              Toplam Egzersiz: <span className="text-[#C5A059] font-extrabold font-mono">{exercisesForLevel.length} Adet</span>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* Active Exercise Runner Mode */}
            {activeExercise ? (
              <ExerciseRunner 
                exercise={activeExercise} 
                onBack={() => setActiveExercise(null)} 
                isSoundEnabled={isSoundEnabled}
              />
            ) : (
              /* Exercises Library / Grid View */
              <>
                {/* Category Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-4">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mr-2">Kategoriler:</span>
                  {[
                    { id: 'all', label: 'Tüm Egzersizler' },
                    { id: 'goz-takip', label: '👁️ Göz Takip' },
                    { id: 'sutun-takip', label: '📐 Sütun Takibi' },
                    { id: 'okuma-metni', label: '📚 Okuma Metni & Takistoskop' },
                    { id: 'dikkat-odak', label: '🎯 Dikkat & Odak' },
                    { id: 'bulmaca', label: '🧩 Bulmaca & Anagram' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        playExerciseClickSound(isSoundEnabled);
                      }}
                      className={`px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer rounded-none border ${
                        selectedCategory === cat.id
                          ? 'bg-[#2D2D2D] text-white border-[#2D2D2D]'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Exercises Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredExercises.map((ex) => (
                    <div 
                      key={ex.id}
                      className="bg-white border border-[#2D2D2D]/15 p-5 shadow-sm hover:shadow-md hover:border-[#C5A059]/60 transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-stone-100 text-stone-600 border border-stone-200">
                            {ex.categoryLabel}
                          </span>
                          {ex.targetWpm ? (
                            <span className="text-[10px] font-mono font-bold text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 border border-[#C5A059]/20">
                              Hedef: {ex.targetWpm} WPM
                            </span>
                          ) : null}
                        </div>

                        <h3 className="font-serif font-bold text-base text-[#2D2D2D] group-hover:text-[#C5A059] transition-colors">
                          {ex.title}
                        </h3>

                        <p className="text-stone-500 text-xs leading-relaxed line-clamp-2">
                          {ex.description}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-stone-400 font-mono">
                          ID: {ex.id}
                        </span>

                        <button
                          onClick={() => {
                            setActiveExercise(ex);
                            playExerciseStartSound(isSoundEnabled);
                          }}
                          className="px-4 py-2 bg-[#2D2D2D] hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Egzersizi Başlat</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Student Accounts Management Modal for Trainer (Gamze Hanım) */}
      {isStudentModalOpen && currentUser?.role === 'trainer' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] border border-[#2D2D2D]/20 shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-[#2D2D2D] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#C5A059]" />
                <h3 className="font-serif font-bold text-base text-white">Öğrenci Hesap Yönetimi (Eğitmen Paneli)</h3>
              </div>
              <button 
                onClick={() => setIsStudentModalOpen(false)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Form to Create New Student */}
              <form onSubmit={handleCreateStudent} className="bg-[#FAF9F6] p-5 border border-stone-200 space-y-4">
                <h4 className="font-serif font-bold text-sm text-[#2D2D2D] flex items-center gap-2 border-b pb-2">
                  <UserPlus className="w-4 h-4 text-[#C5A059]" />
                  <span>Yeni Öğrenci Hesabı Oluştur</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase">Öğrenci Adı Soyadı</label>
                    <input 
                      type="text"
                      required
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      placeholder="Örn: Mehmet Demir"
                      className="w-full px-3 py-2 bg-white border border-stone-300 text-xs font-medium focus:border-[#C5A059] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase">Sınıf / Seviye</label>
                    <select
                      value={newStudentClass}
                      onChange={(e) => setNewStudentClass(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-300 text-xs font-medium focus:border-[#C5A059] focus:outline-none"
                    >
                      <option value="8. Sınıf (LGS)">8. Sınıf (LGS)</option>
                      <option value="12. Sınıf (YKS)">12. Sınıf (YKS)</option>
                      <option value="Ortaokul">Ortaokul Genel</option>
                      <option value="Lise">Lise Genel</option>
                      <option value="Mezun">Mezun</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase">Kullanıcı Adı</label>
                    <input 
                      type="text"
                      required
                      value={newStudentUsername}
                      onChange={(e) => setNewStudentUsername(e.target.value)}
                      placeholder="Örn: mehmet"
                      className="w-full px-3 py-2 bg-white border border-stone-300 text-xs font-medium focus:border-[#C5A059] focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase">Şifre</label>
                    <input 
                      type="text"
                      required
                      value={newStudentPassword}
                      onChange={(e) => setNewStudentPassword(e.target.value)}
                      placeholder="Örn: 123456"
                      className="w-full px-3 py-2 bg-white border border-stone-300 text-xs font-medium focus:border-[#C5A059] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {studentActionMsg && (
                  <p className="text-xs p-2.5 font-bold bg-amber-50 text-amber-900 border border-amber-200">
                    {studentActionMsg}
                  </p>
                )}

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#b08d4b] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Öğrenci Hesabını Kaydet ve Tanımla</span>
                </button>
              </form>

              {/* Registered Students Table */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-sm text-[#2D2D2D] flex items-center justify-between">
                  <span>Kayıtlı Öğrenci Listesi ({students.length})</span>
                  <span className="text-[10px] text-stone-400 font-sans font-normal">Bu şifreler ile öğrenciler panele giriş yapabilir</span>
                </h4>

                <div className="border border-stone-200 overflow-x-auto bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-stone-100 text-stone-600 font-bold border-b border-stone-200 uppercase text-[10px] tracking-wider">
                        <th className="p-3">Adı Soyadı</th>
                        <th className="p-3">Sınıf</th>
                        <th className="p-3">Kullanıcı Adı</th>
                        <th className="p-3">Şifre</th>
                        <th className="p-3 text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {students.map((st) => (
                        <tr key={st.id} className="hover:bg-stone-50 font-medium">
                          <td className="p-3 font-bold text-[#2D2D2D]">{st.fullName}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-stone-100 border text-[10px]">
                              {st.studentClass}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-[#C5A059]">{st.username}</td>
                          <td className="p-3 font-mono text-stone-600">{st.password}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteStudent(st.id, st.fullName)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 transition-colors rounded cursor-pointer"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// =========================================================================
// ACTIVE EXERCISE RUNNER COMPONENT WITH RESULT & COMPREHENSION SCORING
// =========================================================================
function ExerciseRunner({ exercise, onBack, isSoundEnabled }: { exercise: SpeedExercise; onBack: () => void; isSoundEnabled: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedBpm, setSpeedBpm] = useState(exercise.data?.defaultSpeedBpm || 140);
  
  // Active Timer state
  const [elapsedSec, setElapsedSec] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval: any;
    if (timerActive) {
      interval = setInterval(() => {
        setElapsedSec(prev => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const toggleTimer = () => {
    if (!timerActive) {
      setTimerActive(true);
      playExerciseStartSound(isSoundEnabled);
    } else {
      setTimerActive(false);
      playExerciseClickSound(isSoundEnabled);
    }
  };

  // Scoring Result Modal State
  const [resultModal, setResultModal] = useState<{
    wpm: number;
    accuracy: number;
    effectiveWpm: number;
    score: number;
    timeSec: number;
  } | null>(null);

  const handleFinishExercise = (calcWpm?: number, calcAccuracy?: number, durationSec?: number) => {
    setTimerActive(false);
    const finalTime = durationSec || (elapsedSec > 0 ? elapsedSec : 35);
    const finalWpm = calcWpm || exercise.targetWpm || Math.round(speedBpm * 1.8);
    const finalAccuracy = calcAccuracy !== undefined ? calcAccuracy : 95;
    const finalEffectiveWpm = Math.round(finalWpm * (finalAccuracy / 100));

    // Calculate overall 0-100 score
    const target = exercise.targetWpm || 300;
    const speedScore = Math.min(100, Math.round((finalEffectiveWpm / Math.max(target, 100)) * 100));
    const finalScore = Math.min(100, Math.round((speedScore * 0.5) + (finalAccuracy * 0.5)));

    setResultModal({
      wpm: finalWpm,
      accuracy: finalAccuracy,
      effectiveWpm: finalEffectiveWpm,
      score: finalScore,
      timeSec: Math.round(finalTime)
    });

    playExerciseSuccessSound(isSoundEnabled);
  };

  return (
    <div className="space-y-6">
      {/* Top Runner Header Bar */}
      <div className="bg-white p-4 border border-[#2D2D2D]/15 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="px-3 py-1.5 border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors flex items-center gap-1 cursor-pointer"
          >
            ← Geri Dön
          </button>
          <div>
            <h3 className="font-serif font-bold text-base text-[#2D2D2D] flex items-center gap-2">
              <span>{exercise.title}</span>
              <span className="text-[10px] font-sans uppercase font-extrabold px-2 py-0.5 bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30">
                {exercise.level} • {exercise.categoryLabel}
              </span>
            </h3>
            <p className="text-xs text-stone-500">{exercise.description}</p>
          </div>
        </div>

        {/* Global Stopwatch & Finish Controls */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-stone-100 border border-stone-200 text-xs font-mono font-bold text-stone-800 flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Süre: {elapsedSec.toFixed(1)}s</span>
          </div>

          <button
            onClick={() => handleFinishExercise()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow flex items-center gap-2"
          >
            <Award className="w-4 h-4" />
            <span>Egzersizi Tamamla ve Puanla</span>
          </button>
        </div>
      </div>

      {/* Exercise Active Canvas Area */}
      <div className="min-h-[420px] bg-white border border-[#2D2D2D]/15 p-6 shadow-sm flex flex-col items-center justify-center relative">
        {exercise.category === 'goz-takip' && (
          <GozTakipRunner 
            exercise={exercise} 
            speedBpm={speedBpm} 
            setSpeedBpm={setSpeedBpm} 
            isPlaying={isPlaying} 
            setIsPlaying={setIsPlaying}
            isSoundEnabled={isSoundEnabled}
            onCompleteResult={(wpm, acc, time) => handleFinishExercise(wpm, acc, time)}
          />
        )}

        {exercise.category === 'sutun-takip' && (
          <SutunTakipRunner 
            exercise={exercise} 
            isSoundEnabled={isSoundEnabled}
            onCompleteResult={(wpm, acc, time) => handleFinishExercise(wpm, acc, time)}
          />
        )}

        {exercise.category === 'okuma-metni' && (
          <OkumaMetniRunner 
            exercise={exercise} 
            isSoundEnabled={isSoundEnabled} 
            onCompleteResult={(wpm, acc, time) => handleFinishExercise(wpm, acc, time)}
          />
        )}

        {exercise.category === 'dikkat-odak' && (
          <DikkatOdakRunner 
            exercise={exercise} 
            isPlaying={isPlaying} 
            isSoundEnabled={isSoundEnabled}
            onCompleteResult={(wpm, acc, time) => handleFinishExercise(wpm, acc, time)}
          />
        )}

        {exercise.category === 'bulmaca' && (
          <BulmacaRunner 
            exercise={exercise} 
            isSoundEnabled={isSoundEnabled}
            onCompleteResult={(wpm, acc, time) => handleFinishExercise(wpm, acc, time)}
          />
        )}
      </div>

      {/* Completion & Scoring Modal (Tamamla tıklandığında çıkan ekran) */}
      {resultModal && (
        <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-md z-[1050] flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full border border-[#C5A059]/40 shadow-2xl p-6 sm:p-8 space-y-6 text-center relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setResultModal(null)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center mx-auto border-2 border-[#C5A059] rounded-full">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C5A059] bg-[#C5A059]/10 px-3 py-1 border border-[#C5A059]/30">
                EGZERSİZ TAMAMLAMA VE PUANLAMA ANALİZİ
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#2D2D2D] pt-2">
                {exercise.title}
              </h3>
            </div>

            {/* Main Metric Cards Grid */}
            <div className="grid grid-cols-2 gap-3 text-left">
              
              {/* Score */}
              <div className="p-4 bg-stone-900 text-white border border-stone-800 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Performans Puanı</span>
                <div className="text-3xl font-black font-mono text-amber-300">
                  {resultModal.score} <span className="text-xs font-normal text-stone-400">/ 100</span>
                </div>
              </div>

              {/* Dakikadaki Anlayarak Okuma Hızı */}
              <div className="p-4 bg-[#C5A059]/15 border-2 border-[#C5A059] space-y-1">
                <span className="text-[10px] font-extrabold text-[#9A7B39] uppercase tracking-wider block">
                  🎯 DAKİKADAKİ ANLAYARAK OKUMA HIZI
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-[#2D2D2D]">
                  {resultModal.effectiveWpm} <span className="text-xs font-bold text-[#C5A059]">KDK</span>
                </div>
              </div>

              {/* Okuma Hızı (WPM) */}
              <div className="p-4 bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Okuma Hızı (WPM)</span>
                <div className="text-xl font-bold font-mono text-stone-800">
                  {resultModal.wpm} <span className="text-xs font-normal text-stone-500">Kelime/Dk</span>
                </div>
              </div>

              {/* Comprehension % */}
              <div className="p-4 bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Tamamlama & Anlama</span>
                <div className="text-xl font-bold font-mono text-emerald-600">
                  %{resultModal.accuracy}
                </div>
              </div>

            </div>

            {/* Pedagogical Evaluation Note */}
            <div className="p-4 bg-[#FAF9F6] border border-stone-200 text-left text-xs space-y-1">
              <span className="font-bold text-[#2D2D2D] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Eğitmen Gamze Tosun Değerlendirmesi:</span>
              </span>
              <p className="text-stone-600 leading-relaxed">
                {resultModal.effectiveWpm >= 350
                  ? 'Tebrikler! Anlayarak okuma hızınız üst düzey akademik standartların üzerinde. Düzenli günlük 15 dakika tekrar ile dikkatinizi zirvede tutun.'
                  : resultModal.effectiveWpm >= 220
                  ? 'Harika ilerleme! Anlayarak okuma kapasiteniz hedef seviyeye oldukça yakın. Sütun takibi ve takistoskop egzersizlerini artırarak hızınızı daha da katlayabilirsiniz.'
                  : 'Egzerzisi başarıyla tamamladınız. Göz esnekliği ve odak egzersizlerini her gün tekrarlayarak anlayarak okuma hızınızı kısa sürede 300 KDK seviyesine çıkarabilirsiniz.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setResultModal(null)}
                className="flex-1 py-3 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Egzersize Devam Et
              </button>
              <button
                onClick={() => {
                  setResultModal(null);
                  onBack();
                }}
                className="flex-1 py-3 bg-[#C5A059] hover:bg-[#b08d4b] text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow"
              >
                Sonraki Egzersize Geç
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// 1. GÖZ TAKİP RUNNER (Dynaically Changing Turkish Words)
// =========================================================================
function GozTakipRunner({ exercise, speedBpm, setSpeedBpm, isPlaying, setIsPlaying, isSoundEnabled, onCompleteResult }: any) {
  const type = exercise.data?.type;

  // Dynamic Word Generator
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordList, setWordList] = useState<string[]>(() => {
    return getRandomWords(20, exercise.data?.words);
  });

  const [position, setPosition] = useState<'left' | 'right' | 'top' | 'bottom'>('left');

  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.max(100, Math.round((60 / speedBpm) * 1000));

    const timer = setInterval(() => {
      if (type === 'horizontal-dot') {
        setPosition(prev => (prev === 'left' ? 'right' : 'left'));
      } else if (type === 'vertical-dot') {
        setPosition(prev => (prev === 'top' ? 'bottom' : 'top'));
      } else if (type === 'zigzag') {
        setPosition(prev => (prev === 'left' ? 'right' : 'left'));
      }
      
      // Rotate words dynamically
      setCurrentWordIndex(prev => {
        const next = prev + 1;
        if (next >= wordList.length) {
          setWordList(getRandomWords(20));
          return 0;
        }
        return next;
      });

      playExerciseTickSound(isSoundEnabled);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, speedBpm, type, wordList.length, isSoundEnabled]);

  const activeWordLeft = wordList[currentWordIndex] || 'Gelişim';
  const activeWordRight = wordList[(currentWordIndex + 1) % wordList.length] || 'Odaklanma';

  return (
    <div className="w-full max-w-xl space-y-6 text-center">
      {/* Canvas */}
      <div className="h-64 bg-[#FAF9F6] border border-stone-200 relative flex items-center justify-between p-8 overflow-hidden select-none">
        {type === 'horizontal-dot' && (
          <>
            <div className={`transition-all duration-150 ${position === 'left' ? 'opacity-100 scale-125 text-[#C5A059]' : 'opacity-20 text-stone-300'}`}>
              <div className="w-6 h-6 rounded-full bg-[#C5A059] mx-auto mb-2 animate-ping" />
              <span className="font-serif font-black text-xl">{activeWordLeft}</span>
            </div>
            <div className={`transition-all duration-150 ${position === 'right' ? 'opacity-100 scale-125 text-[#C5A059]' : 'opacity-20 text-stone-300'}`}>
              <div className="w-6 h-6 rounded-full bg-[#C5A059] mx-auto mb-2 animate-ping" />
              <span className="font-serif font-black text-xl">{activeWordRight}</span>
            </div>
          </>
        )}

        {type === 'vertical-dot' && (
          <div className="w-full h-full flex flex-col justify-between items-center py-4">
            <div className={`transition-all duration-150 ${position === 'top' ? 'opacity-100 scale-125 text-emerald-600' : 'opacity-20 text-stone-300'}`}>
              <span className="font-serif font-black text-xl">{activeWordLeft}</span>
            </div>
            <div className={`transition-all duration-150 ${position === 'bottom' ? 'opacity-100 scale-125 text-emerald-600' : 'opacity-20 text-stone-300'}`}>
              <span className="font-serif font-black text-xl">{activeWordRight}</span>
            </div>
          </div>
        )}

        {(type === 'zigzag' || type === 'infinity-loop' || type === 'spiral' || type === 'corner-jump') && (
          <div className="w-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full border-4 border-[#C5A059] border-t-transparent animate-spin mx-auto" />
              <p className="font-serif font-black text-2xl text-[#2D2D2D]">{activeWordLeft}</p>
              <p className="text-xs text-stone-400 font-mono">Göz kaslarınızı esneterek odak kelimeyi yakalayın</p>
            </div>
          </div>
        )}
      </div>

      {/* Speed Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-50 p-4 border border-stone-200">
        <button
          onClick={() => {
            setIsPlaying(!isPlaying);
            playExerciseClickSound(isSoundEnabled);
          }}
          className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer flex items-center gap-2 ${
            isPlaying ? 'bg-amber-600' : 'bg-[#2D2D2D]'
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isPlaying ? 'Duraklat' : 'Egzersizi Başlat'}</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-stone-600">Tempo (BPM):</span>
          <input 
            type="range"
            min="60"
            max="400"
            step="10"
            value={speedBpm}
            onChange={(e) => setSpeedBpm(Number(e.target.value))}
            className="w-32 accent-[#C5A059] cursor-pointer"
          />
          <span className="font-mono font-bold text-sm text-[#C5A059]">{speedBpm} BPM</span>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 2. SÜTUN TAKİP RUNNER (Dynamically refreshing word blocks)
// =========================================================================
function SutunTakipRunner({ exercise, isSoundEnabled, onCompleteResult }: any) {
  const [activeRow, setActiveRow] = useState(0);

  // Generate dynamic word sets if needed
  const [rows, setRows] = useState<string[][]>(() => {
    if (exercise.data?.wordPairs) return exercise.data.wordPairs;
    if (exercise.data?.wordTriplets) return exercise.data.wordTriplets;
    if (exercise.data?.wordQuartets) return exercise.data.wordQuartets;
    
    // Fallback dynamic generator
    const colsCount = exercise.data?.columnsCount || 2;
    const generated: string[][] = [];
    for (let i = 0; i < 8; i++) {
      generated.push(getRandomWords(colsCount));
    }
    return generated;
  });

  const handleNextRow = () => {
    playExerciseClickSound(isSoundEnabled);
    if (activeRow + 1 >= rows.length) {
      // Refresh rows with new vocabulary when reaching bottom
      const colsCount = rows[0].length;
      const generated: string[][] = [];
      for (let i = 0; i < 8; i++) {
        generated.push(getRandomWords(colsCount));
      }
      setRows(generated);
      setActiveRow(0);
    } else {
      setActiveRow(prev => prev + 1);
    }
  };

  return (
    <div className="w-full max-w-xl space-y-6 text-center">
      <p className="text-xs text-stone-500 font-medium">
        Bakış açınızı merkeze sabitleyerek sütunlardaki kelimeleri tek hamlede algılayın.
      </p>

      <div className="bg-[#FAF9F6] border border-stone-200 p-6 space-y-3">
        {rows.map((row: string[], idx: number) => (
          <div 
            key={idx}
            onClick={() => {
              setActiveRow(idx);
              playExerciseClickSound(isSoundEnabled);
            }}
            className={`grid gap-4 py-3 px-4 border transition-all cursor-pointer select-none ${
              activeRow === idx 
                ? 'bg-[#C5A059]/15 border-[#C5A059] shadow-sm font-black scale-[1.02]' 
                : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
            }`}
            style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }}
          >
            {row.map((word, wIdx) => (
              <span key={wIdx} className="font-serif text-base text-[#2D2D2D]">
                {word}
              </span>
            ))}
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={handleNextRow}
          className="px-6 py-2.5 bg-[#2D2D2D] hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow"
        >
          <ChevronRight className="w-4 h-4" />
          <span>Sonraki Satıra Sıçra & Kelimeleri Yenile</span>
        </button>
      </div>
    </div>
  );
}

// =========================================================================
// 3. OKUMA METNİ & TAKİSTOSKOP RUNNER
// =========================================================================
function OkumaMetniRunner({ exercise, isSoundEnabled, onCompleteResult }: any) {
  const isRSVP = exercise.data?.type === 'rsvp';
  const words = exercise.data?.words || TURKISH_WORD_POOL;
  const [wordIdx, setWordIdx] = useState(0);
  const [isPlayingRSVP, setIsPlayingRSVP] = useState(false);

  // Passage Timer State
  const [elapsedSec, setElapsedSec] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [calculatedWpm, setCalculatedWpm] = useState(0);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  // Timer interval
  useEffect(() => {
    let interval: any;
    if (timerRunning) {
      interval = setInterval(() => {
        setElapsedSec(prev => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  // RSVP interval
  useEffect(() => {
    if (!isPlayingRSVP || !isRSVP) return;
    const timer = setInterval(() => {
      setWordIdx(prev => {
        if (prev + 1 >= words.length) {
          setIsPlayingRSVP(false);
          return 0;
        }
        return prev + 1;
      });
      playExerciseTickSound(isSoundEnabled);
    }, 380);

    return () => clearInterval(timer);
  }, [isPlayingRSVP, isRSVP, words.length, isSoundEnabled]);

  const handleFinishReadingPassage = () => {
    setTimerRunning(false);
    const wordCount = exercise.data?.wordCount || 45;
    const finalSec = Math.max(elapsedSec, 1);
    const wpm = Math.round((wordCount / finalSec) * 60);
    setCalculatedWpm(wpm);

    // Calculate accuracy if quiz completed
    const quizList = exercise.data?.quiz || [];
    let correctCount = 0;
    quizList.forEach((q: any, idx: number) => {
      if (quizAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const accuracy = quizList.length > 0 ? Math.round((correctCount / quizList.length) * 100) : 95;
    onCompleteResult(wpm, accuracy, Math.round(finalSec));
  };

  return (
    <div className="w-full max-w-2xl space-y-6">
      {isRSVP ? (
        /* RSVP Takistoskop */
        <div className="bg-[#FAF9F6] border border-stone-200 p-8 text-center space-y-6">
          <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest block">
            Takistoskop Flaşör Egzersizi
          </span>
          <div className="h-28 flex items-center justify-center">
            <span className="font-serif font-black text-3xl sm:text-4xl text-[#2D2D2D] transition-all duration-75">
              {words[wordIdx]}
            </span>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                setIsPlayingRSVP(!isPlayingRSVP);
                playExerciseClickSound(isSoundEnabled);
              }}
              className="px-6 py-2.5 bg-[#2D2D2D] hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              {isPlayingRSVP ? 'Duraklat' : 'Flaşör Okumayı Başlat'}
            </button>
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
                    handleFinishReadingPassage();
                  } else {
                    setElapsedSec(0);
                    setTimerRunning(true);
                    playExerciseStartSound(isSoundEnabled);
                  }
                }}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer ${
                  timerRunning ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {timerRunning ? 'Okumayı Bitirdim ve Değerlendir' : 'Kronometreyi Başlat'}
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
          <p className="text-[#2D2D2D] text-base leading-relaxed font-serif p-5 bg-[#FAF9F6] border border-stone-200 shadow-inner">
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
                        onClick={() => {
                          setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
                          playExerciseClickSound(isSoundEnabled);
                        }}
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
                onClick={() => {
                  handleFinishReadingPassage();
                }}
                className="w-full py-3 bg-[#C5A059] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#b08d4b] transition-all cursor-pointer shadow"
              >
                Anlama Testini Değerlendir ve Puanla
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =========================================================================
// 4. DİKKAT & ODAK RUNNER (SCHULTE, STROOP, WORD MATRIX)
// =========================================================================
function DikkatOdakRunner({ exercise, isPlaying, isSoundEnabled, onCompleteResult }: any) {
  const type = exercise.data?.type;

  // ---------------- SCHULTE TABLE ENGINE ----------------
  const gridSize = exercise.data?.gridSize || 4;
  const [schulteNumbers, setSchulteNumbers] = useState<number[]>([]);
  const [nextExpected, setNextExpected] = useState(1);
  const [schulteTime, setSchulteTime] = useState(0);
  const [schulteCompleted, setSchulteCompleted] = useState(false);

  useEffect(() => {
    if (type === 'schulte') {
      const total = gridSize * gridSize;
      const nums = Array.from({ length: total }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
      setSchulteNumbers(nums);
      setNextExpected(1);
      setSchulteTime(0);
      setSchulteCompleted(false);
    }
  }, [type, gridSize]);

  useEffect(() => {
    if (type !== 'schulte' || schulteCompleted || nextExpected === 1) return;
    const interval = setInterval(() => {
      setSchulteTime(prev => prev + 0.1);
    }, 100);
    return () => clearInterval(interval);
  }, [type, schulteCompleted, nextExpected]);

  const handleSchulteClick = (num: number) => {
    if (num === nextExpected) {
      playExerciseClickSound(isSoundEnabled);
      if (num === gridSize * gridSize) {
        setSchulteCompleted(true);
        const calcWpm = Math.round((gridSize * gridSize / Math.max(schulteTime, 1)) * 60);
        onCompleteResult(calcWpm, 100, Math.round(schulteTime));
      } else {
        setNextExpected(prev => prev + 1);
      }
    }
  };

  // ---------------- STROOP TEST ENGINE ----------------
  const COLOR_PALETTE = [
    { name: 'KIRMIZI', colorHex: '#DC2626', bgClass: 'bg-red-600 hover:bg-red-700' },
    { name: 'MAVİ', colorHex: '#2563EB', bgClass: 'bg-blue-600 hover:bg-blue-700' },
    { name: 'YEŞİL', colorHex: '#16A34A', bgClass: 'bg-green-600 hover:bg-green-700' },
    { name: 'SARI', colorHex: '#D97706', bgClass: 'bg-amber-500 hover:bg-amber-600' },
    { name: 'MOR', colorHex: '#9333EA', bgClass: 'bg-purple-600 hover:bg-purple-700' },
    { name: 'TURUNCU', colorHex: '#EA580C', bgClass: 'bg-orange-600 hover:bg-orange-700' },
  ];

  const [stroopWord, setStroopWord] = useState('KIRMIZI');
  const [stroopInkIndex, setStroopInkIndex] = useState(1); // MAVİ ink
  const [stroopScore, setStroopScore] = useState(0);
  const [stroopTotal, setStroopTotal] = useState(0);
  const [stroopFeedback, setStroopFeedback] = useState('');

  const generateNewStroop = useCallback(() => {
    const wordObj = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    let inkIdx = Math.floor(Math.random() * COLOR_PALETTE.length);
    // Ensure word and ink differ 80% of the time for optimal challenge
    if (COLOR_PALETTE[inkIdx].name === wordObj.name && Math.random() > 0.2) {
      inkIdx = (inkIdx + 1) % COLOR_PALETTE.length;
    }
    setStroopWord(wordObj.name);
    setStroopInkIndex(inkIdx);
  }, []);

  useEffect(() => {
    if (type === 'stroop') {
      generateNewStroop();
      setStroopScore(0);
      setStroopTotal(0);
      setStroopFeedback('');
    }
  }, [type, generateNewStroop]);

  const handleStroopColorAnswer = (selectedColorName: string) => {
    playExerciseClickSound(isSoundEnabled);
    const correctInkName = COLOR_PALETTE[stroopInkIndex].name;
    const isCorrect = selectedColorName === correctInkName;

    setStroopTotal(prev => prev + 1);
    if (isCorrect) {
      setStroopScore(prev => prev + 1);
      setStroopFeedback('✅ Doğru! (+1 Puan)');
    } else {
      setStroopFeedback(`❌ Hata! Yazı rengi: ${correctInkName} idi.`);
    }

    // Instantly generate new color and word!
    generateNewStroop();
  };

  // ---------------- DENSE WORD MATRIX ENGINE ----------------
  const [matrixTargetWord, setMatrixTargetWord] = useState('ODAK');
  const [matrixCells, setMatrixCells] = useState<{ word: string; isTarget: boolean; clicked: boolean }[]>([]);
  const [matrixScore, setMatrixScore] = useState(0);
  const [matrixTotalTargets, setMatrixTotalTargets] = useState(0);

  const generateNewWordMatrix = useCallback(() => {
    const targets = ['ODAK', 'HIZ', 'HAF IZA', 'MANTIK', 'PARAGRAF', 'BAŞARI', 'SÜREÇ', 'DİKKAT', 'SENTEZ'];
    const chosenTarget = targets[Math.floor(Math.random() * targets.length)];
    setMatrixTargetWord(chosenTarget);

    const poolWithoutTarget = TURKISH_WORD_POOL.filter(w => w.toUpperCase() !== chosenTarget);
    const cells: { word: string; isTarget: boolean; clicked: boolean }[] = [];
    
    // Create 36 cells (6x6) with target appearing 5 to 7 times
    const targetCount = Math.floor(Math.random() * 3) + 5;
    setMatrixTotalTargets(targetCount);
    setMatrixScore(0);

    const targetIndices = new Set<number>();
    while (targetIndices.size < targetCount) {
      targetIndices.add(Math.floor(Math.random() * 36));
    }

    for (let i = 0; i < 36; i++) {
      if (targetIndices.has(i)) {
        cells.push({ word: chosenTarget, isTarget: true, clicked: false });
      } else {
        const randomFiller = poolWithoutTarget[Math.floor(Math.random() * poolWithoutTarget.length)].toUpperCase();
        cells.push({ word: randomFiller, isTarget: false, clicked: false });
      }
    }

    setMatrixCells(cells);
  }, []);

  useEffect(() => {
    if (type === 'letter-matrix' || type === 'missing-number') {
      generateNewWordMatrix();
    }
  }, [type, generateNewWordMatrix]);

  const handleMatrixCellClick = (idx: number) => {
    if (matrixCells[idx].clicked) return;
    playExerciseClickSound(isSoundEnabled);

    const updated = [...matrixCells];
    updated[idx].clicked = true;
    setMatrixCells(updated);

    if (updated[idx].isTarget) {
      setMatrixScore(prev => prev + 1);
      playExerciseSuccessSound(isSoundEnabled);
    }
  };

  return (
    <div className="w-full max-w-xl space-y-6">
      
      {/* 1. SCHULTE TABLE */}
      {type === 'schulte' && (
        <div className="bg-white p-6 border border-[#2D2D2D]/15 shadow-sm space-y-4 text-center">
          <div className="flex items-center justify-between text-xs font-bold border-b pb-2">
            <span>Schulte {gridSize}x{gridSize} Tablosu</span>
            <span>Aranan Sayı: <span className="text-[#C5A059] font-black text-base">{nextExpected}</span></span>
            <span>Süre: <span className="font-mono">{schulteTime.toFixed(1)}s</span></span>
          </div>

          <div 
            className="grid gap-2 select-none"
            style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
          >
            {schulteNumbers.map((n) => (
              <button
                key={n}
                onClick={() => handleSchulteClick(n)}
                className={`h-14 font-serif font-black text-lg border transition-all cursor-pointer ${
                  n < nextExpected 
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-700 opacity-50' 
                    : 'bg-[#FAF9F6] border-stone-200 text-[#2D2D2D] hover:bg-[#C5A059] hover:text-white shadow-sm'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. STROOP COLOR CONFLICT TEST */}
      {type === 'stroop' && (
        <div className="bg-white p-6 sm:p-8 border border-[#2D2D2D]/15 shadow-sm text-center space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C5A059] bg-[#C5A059]/10 px-3 py-1 border border-[#C5A059]/30">
              STROOP RENK ÇELİŞKİ DİKKAT TESTİ
            </span>
            <p className="text-stone-500 text-xs font-bold pt-1">
              YAZILAN KELİME NEYİ İŞARET EDERSE ETSİN, SADECE <span className="text-rose-600 font-extrabold underline">MÜREKKEP RENGİNİ</span> SEÇİN!
            </p>
          </div>

          {/* Active Stroop Target Word */}
          <div className="py-8 bg-[#FAF9F6] border border-stone-200 shadow-inner flex items-center justify-center">
            <span 
              className="font-black text-4xl sm:text-5xl font-serif tracking-widest transition-all duration-100 select-none"
              style={{ color: COLOR_PALETTE[stroopInkIndex].colorHex }}
            >
              {stroopWord}
            </span>
          </div>

          {/* Color Answer Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {COLOR_PALETTE.map((item) => (
              <button 
                key={item.name}
                onClick={() => handleStroopColorAnswer(item.name)}
                className={`py-3.5 px-4 text-white font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow flex items-center justify-center gap-1.5 ${item.bgClass}`}
              >
                <span>{item.name}</span>
              </button>
            ))}
          </div>

          {/* Stroop Score & Feedback */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-200 text-xs font-bold">
            <div className="text-stone-600">
              Doğru: <span className="text-emerald-600 font-mono text-sm">{stroopScore}</span> / {stroopTotal}
            </div>
            {stroopFeedback && (
              <span className="text-amber-700 bg-amber-50 px-2.5 py-1 border border-amber-200">
                {stroopFeedback}
              </span>
            )}
            <button
              onClick={() => {
                const acc = stroopTotal > 0 ? Math.round((stroopScore / stroopTotal) * 100) : 90;
                onCompleteResult(320, acc, 30);
              }}
              className="px-4 py-2 bg-[#C5A059] hover:bg-[#b08d4b] text-white uppercase text-[11px] tracking-wider shadow cursor-pointer"
            >
              Testi Tamamla
            </button>
          </div>
        </div>
      )}

      {/* 3. DENSE WORD MATRIX SCANNER */}
      {(type === 'letter-matrix' || type === 'missing-number') && (
        <div className="bg-white p-6 border border-[#2D2D2D]/15 shadow-sm text-center space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C5A059] bg-[#C5A059]/10 px-3 py-1 border border-[#C5A059]/30">
              YOĞUN KELİME & ODAK MATRİKSİ
            </span>
            <div className="pt-2">
              <span className="text-sm font-bold text-[#2D2D2D]">
                HEDEF KELİME: <span className="text-base font-mono font-black text-[#C5A059] bg-[#C5A059]/10 px-3 py-1 border border-[#C5A059]/30">"{matrixTargetWord}"</span>
              </span>
            </div>
            <p className="text-xs text-stone-500 pt-1">
              Tablodaki tüm <span className="font-bold text-[#2D2D2D]">"{matrixTargetWord}"</span> kelimelerini tıklayarak hızlıca tespit edin.
            </p>
          </div>

          {/* Matrix Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 bg-[#FAF9F6] p-4 border border-stone-200">
            {matrixCells.map((cell, idx) => (
              <button
                key={idx}
                onClick={() => handleMatrixCellClick(idx)}
                className={`py-3 px-1 text-xs font-serif font-bold transition-all border cursor-pointer select-none rounded-none ${
                  cell.clicked
                    ? cell.isTarget
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md font-black scale-105'
                      : 'bg-rose-100 text-rose-700 border-rose-300 opacity-60'
                    : 'bg-white text-stone-800 border-stone-200 hover:border-[#C5A059] hover:bg-[#C5A059]/10'
                }`}
              >
                {cell.word}
              </button>
            ))}
          </div>

          {/* Matrix Controls & Score */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200 text-xs font-bold">
            <div className="text-stone-700">
              Bulunan: <span className="text-emerald-600 font-mono text-base font-black">{matrixScore}</span> / {matrixTotalTargets} Target
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={generateNewWordMatrix}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white uppercase text-[11px] tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Yeni Matriks Oluştur</span>
              </button>

              <button
                onClick={() => {
                  const acc = matrixTotalTargets > 0 ? Math.round((matrixScore / matrixTotalTargets) * 100) : 100;
                  onCompleteResult(350, acc, 25);
                }}
                className="px-4 py-2 bg-[#C5A059] hover:bg-[#b08d4b] text-white uppercase text-[11px] tracking-wider shadow cursor-pointer"
              >
                Tamamla ve Puanla
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// =========================================================================
// 5. BULMACA RUNNER
// =========================================================================
function BulmacaRunner({ exercise, isSoundEnabled, onCompleteResult }: any) {
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const anagramWord = exercise.data?.words?.[0] || { scrambled: 'P A R A G R A F', answer: 'PARAGRAF', hint: 'Metin bölümü' };

  const handleCheck = () => {
    if (userInput.trim().toUpperCase() === anagramWord.answer) {
      setIsCorrect(true);
      playExerciseSuccessSound(isSoundEnabled);
      onCompleteResult(320, 100, 20);
    } else {
      setIsCorrect(false);
      playExerciseClickSound(isSoundEnabled);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-6 border border-[#2D2D2D]/15 text-center space-y-6 shadow-sm">
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
          className="w-full py-3 bg-[#2D2D2D] hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow"
        >
          Cevabı Kontrol Et ve Değerlendir
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
