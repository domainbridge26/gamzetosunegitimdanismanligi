import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Play, Pause, RotateCcw, Eye, ArrowDown, Activity, RotateCw, 
  Columns2, Columns3, Maximize2, Minimize2, ArrowLeft, Sun, Moon, BookOpen, Clock, Sparkles, Zap, 
  Grid, Palette, Search, HelpCircle, Puzzle, Repeat, Edit3, Shield,
  CheckCircle2, ArrowRight, Award, Trophy, Sliders, ChevronRight, Lock, LogOut,
  Volume2, VolumeX, User, UserPlus, Trash2, Key, GraduationCap, Star, Check, RefreshCw,
  Target, Brain, Timer, BarChart2, Calendar, FileText, Edit, Plus, ChevronDown, Filter
} from 'lucide-react';
import { SPEED_READING_EXERCISES, SpeedExercise, generateFreshExerciseData } from '../data/speedReadingData';
import { StudentAccount, StudentExerciseLog, ExerciseResult } from '../types';
import { 
  dbGetStudents, dbAddStudent, dbDeleteStudent, dbUpdateStudent, DEFAULT_STUDENTS,
  dbGetStudentLogs, dbAddStudentLog, dbUpdateStudentLog, dbDeleteStudentLog, dbClearStudentLogs
} from '../lib/firebase';

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
  'Derece', 'Felsefe', 'Edebiyat', 'Kuantum', 'Biyoloji', 'Toplumcu', 'Epistemoloji', 'Ontoloji', 'Aksiyoloji',
  'İzlenim', 'Bağlam', 'Metinlerarasılık', 'Üstkurmaca', 'Anlatıcı', 'Bakış Açısı', 'Söylem', 'Üslup',
  'Akıcılık', 'Duruş', 'Kurgu', 'Tarihsellik', 'Bilişsel', 'Nörolojik', 'Algısal', 'Kapasite', 'Kapsama',
  'Sinerji', 'Dinamizm', 'Sürdürülebilirlik', 'Verimlilik', 'Yetkinlik', 'Farkındalık', 'Potansiyel', 'Hedef',
  'Nitelik', 'Nicelik', 'Değerlendirme', 'Kritik', 'Çözümleme', 'Sorgulama', 'Yorumlama', 'İnceleme', 'Araştırma',
  'Odak Noktası', 'Görüş Alanı', 'Sıçrama', 'Fiksasyon', 'Regresyon', 'Belirginlik', 'Netlik', 'Keşif',
  'Göz Çevresi', 'Bakış Açısı', 'Aydınlanma', 'Bilişsel Esneklik', 'Görsel Algı', 'Zihin Haritası', 'Kavramsal'
];

// Helper to get array of N random unique words from pool
function getRandomWords(count: number, exclude?: string[]): string[] {
  const available = TURKISH_WORD_POOL.filter(w => !exclude?.includes(w));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Helper to generate a word search matrix grid for Akademik Kelime Matris Bulmacası
function generateWordSearchGrid(targetWords: string[], gridRows = 10, gridCols = 10) {
  const grid: string[][] = Array.from({ length: gridRows }, () => Array(gridCols).fill(''));
  const wordLocations: { word: string; cells: { r: number; c: number }[] }[] = [];
  const TURKISH_CHARS = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';

  for (const rawWord of targetWords) {
    const word = rawWord.toUpperCase().replace(/\s+/g, '');
    if (!word) continue;
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 150) {
      attempts++;
      const dir = Math.floor(Math.random() * 3); // 0: Horiz, 1: Vert, 2: Diag
      let r = 0, c = 0;

      if (dir === 0) { // Horizontal
        r = Math.floor(Math.random() * gridRows);
        c = Math.floor(Math.random() * Math.max(1, gridCols - word.length + 1));
      } else if (dir === 1) { // Vertical
        r = Math.floor(Math.random() * Math.max(1, gridRows - word.length + 1));
        c = Math.floor(Math.random() * gridCols);
      } else { // Diagonal
        r = Math.floor(Math.random() * Math.max(1, gridRows - word.length + 1));
        c = Math.floor(Math.random() * Math.max(1, gridCols - word.length + 1));
      }

      let fits = true;
      const cells: { r: number; c: number }[] = [];

      for (let i = 0; i < word.length; i++) {
        const curR = dir === 0 ? r : dir === 1 ? r + i : r + i;
        const curC = dir === 0 ? c + i : dir === 1 ? c : c + i;

        if (curR >= gridRows || curC >= gridCols) {
          fits = false;
          break;
        }

        if (grid[curR][curC] !== '' && grid[curR][curC] !== word[i]) {
          fits = false;
          break;
        }
        cells.push({ r: curR, c: curC });
      }

      if (fits && cells.length === word.length) {
        for (let i = 0; i < word.length; i++) {
          grid[cells[i].r][cells[i].c] = word[i];
        }
        wordLocations.push({ word, cells });
        placed = true;
      }
    }
  }

  // Fill empty cells with random uppercase Turkish letters
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = TURKISH_CHARS[Math.floor(Math.random() * TURKISH_CHARS.length)];
      }
    }
  }

  return { grid, wordLocations };
}

// =========================================================================
// WEB AUDIO SYNTHESIZER FOR EXERCISES (WITH BOOSTED VOLUME CONTROL)
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

export const playExerciseTickSound = (isSoundEnabled: boolean = true, soundVolume: number = 1.0) => {
  if (!isSoundEnabled || soundVolume <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.04);
    
    // Boosted baseline volume (0.22 * soundVolume)
    gain.gain.setValueAtTime(Math.min(1.0, 0.22 * soundVolume), ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {}
};

export const playExerciseStartSound = (isSoundEnabled: boolean = true, soundVolume: number = 1.0) => {
  if (!isSoundEnabled || soundVolume <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.frequency.setValueAtTime(523.25, now);
    gain1.gain.setValueAtTime(Math.min(1.0, 0.25 * soundVolume), now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.1);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.frequency.setValueAtTime(659.25, now + 0.08);
    gain2.gain.setValueAtTime(Math.min(1.0, 0.3 * soundVolume), now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.22);
  } catch (e) {}
};

export const playExerciseSuccessSound = (isSoundEnabled: boolean = true, soundVolume: number = 1.0) => {
  if (!isSoundEnabled || soundVolume <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(Math.min(1.0, 0.3 * soundVolume), now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.18);
    });
  } catch (e) {}
};

export const playExerciseClickSound = (isSoundEnabled: boolean = true, soundVolume: number = 1.0) => {
  if (!isSoundEnabled || soundVolume <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    gain.gain.setValueAtTime(Math.min(1.0, 0.18 * soundVolume), ctx.currentTime);
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
  const [loginRoleTab, setLoginRoleTab] = useState<'ilkokul_student' | 'lgs_student' | 'yks_student' | 'trainer'>('ilkokul_student');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    studentCategory?: 'İlkokul' | 'LGS' | 'YKS';
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
  const [newStudentClass, setNewStudentClass] = useState('4. Sınıf (İlkokul)');
  const [studentActionMsg, setStudentActionMsg] = useState('');

  // Selected Student for Progress / Exercise Log Report (Trainer View)
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<StudentAccount | null>(null);
  const [studentLogs, setStudentLogs] = useState<StudentExerciseLog[]>([]);
  const [logFilterCategory, setLogFilterCategory] = useState<string>('all');
  const [logSearchQuery, setLogSearchQuery] = useState<string>('');
  const [isLogsLoading, setIsLogsLoading] = useState(false);

  // Edit Student Account Modal State
  const [editingStudent, setEditingStudent] = useState<StudentAccount | null>(null);

  // Edit Student Exercise Log Modal State
  const [editingLog, setEditingLog] = useState<StudentExerciseLog | null>(null);

  // Add Manual Exercise Log Modal State
  const [isAddLogOpen, setIsAddLogOpen] = useState(false);
  const [newLogExerciseTitle, setNewLogExerciseTitle] = useState('Paragraf & Odak Egzersizi');
  const [newLogLevel, setNewLogLevel] = useState('Ortaokul');
  const [newLogCategory, setNewLogCategory] = useState('Okuma Metni');
  const [newLogDurationSec, setNewLogDurationSec] = useState('120');
  const [newLogWpm, setNewLogWpm] = useState('320');
  const [newLogAccuracy, setNewLogAccuracy] = useState('95');
  const [newLogScore, setNewLogScore] = useState('90');

  const handleOpenStudentReport = async (st: StudentAccount) => {
    setSelectedStudentForReport(st);
    setIsLogsLoading(true);
    try {
      const logs = await dbGetStudentLogs(st.username);
      setStudentLogs(logs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLogsLoading(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!window.confirm('Bu egzersiz performans kaydını silmek istediğinize emin misiniz?')) return;
    await dbDeleteStudentLog(logId);
    setStudentLogs(prev => prev.filter(l => l.id !== logId));
  };

  const handleClearAllLogs = async () => {
    if (!selectedStudentForReport) return;
    if (!window.confirm(`${selectedStudentForReport.fullName} adlı öğrencinin TÜM çalışma kayıtları silinecek. Emin misiniz?`)) return;
    await dbClearStudentLogs(selectedStudentForReport.username);
    setStudentLogs([]);
  };

  const handleSaveEditLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog) return;
    await dbUpdateStudentLog(editingLog.id, editingLog);
    setStudentLogs(prev => prev.map(l => l.id === editingLog.id ? editingLog : l));
    setEditingLog(null);
  };

  const handleSaveEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    await dbUpdateStudent(editingStudent.id, editingStudent);
    const updated = await dbGetStudents();
    setStudents(updated);
    if (selectedStudentForReport?.id === editingStudent.id) {
      setSelectedStudentForReport(editingStudent);
    }
    setEditingStudent(null);
  };

  const handleCreateManualLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForReport) return;
    const durSec = Number(newLogDurationSec) || 60;
    const wpmVal = Number(newLogWpm) || 200;
    const accVal = Number(newLogAccuracy) || 90;
    const scoreVal = Number(newLogScore) || 85;

    const created = await dbAddStudentLog({
      studentUsername: selectedStudentForReport.username,
      studentFullName: selectedStudentForReport.fullName,
      exerciseId: 'manual-' + Date.now(),
      exerciseTitle: newLogExerciseTitle || 'Manuel Egzersiz Kaydı',
      categoryLabel: newLogCategory,
      level: newLogLevel,
      date: new Date().toLocaleString('tr-TR'),
      durationSeconds: durSec,
      wpm: wpmVal,
      accuracy: accVal,
      score: scoreVal,
      effectiveWpm: Math.round(wpmVal * (accVal / 100))
    });

    setStudentLogs(prev => [created, ...prev]);
    setIsAddLogOpen(false);
  };

  // Global Audio Enable state & Volume control (default 1.5 multiplier for boosted sound)
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState<number>(() => {
    const saved = localStorage.getItem('gamze_sound_volume');
    return saved ? parseFloat(saved) : 1.5;
  });

  // Loop notification toast
  const [loopToastMessage, setLoopToastMessage] = useState<string>('');

  // Filtering state
  const [selectedLevel, setSelectedLevel] = useState<'İlkokul' | 'Ortaokul' | 'Lise'>('İlkokul');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Active Runner State
  const [activeExercise, setActiveExercise] = useState<SpeedExercise | null>(null);

  // Sequential & Looping exercise progression handler with dynamic fresh words
  const handleNextExercise = () => {
    const listForLevel = SPEED_READING_EXERCISES.filter(ex => ex.level === selectedLevel);
    const pool = selectedCategory === 'all' 
      ? listForLevel 
      : listForLevel.filter(ex => ex.category === selectedCategory);
    
    const activeList = pool.length > 0 ? pool : (listForLevel.length > 0 ? listForLevel : SPEED_READING_EXERCISES);
    const currentIdx = activeList.findIndex(ex => ex.id === activeExercise?.id);
    let nextIdx = currentIdx + 1;
    let isLooping = false;

    if (nextIdx >= activeList.length || nextIdx < 0) {
      nextIdx = 0;
      isLooping = true;
    }

    const nextRawExercise = activeList[nextIdx];
    // Generate fresh dynamic exercise data (shuffled/randomized words & syllables)
    const freshExercise = generateFreshExerciseData(nextRawExercise);

    if (isLooping) {
      setLoopToastMessage(`🎉 Bu gruptaki tüm egzersizler başarıyla tamamlandı! Yenilenmiş yeni kelimeler ile 1. egzersizden (${freshExercise.title}) tekrar başlatılıyor.`);
      setTimeout(() => setLoopToastMessage(''), 7000);
    }

    setActiveExercise(freshExercise);
  };

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
          try {
            const parsed = JSON.parse(rawUser);
            setCurrentUser(parsed);
            if (parsed.studentCategory === 'İlkokul') setSelectedLevel('İlkokul');
            else if (parsed.studentCategory === 'LGS') setSelectedLevel('Ortaokul');
            else if (parsed.studentCategory === 'YKS') setSelectedLevel('Lise');
          } catch(e){}
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

    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (loginRoleTab === 'trainer') {
      if (cleanUser === 'gamze' && (cleanPass === 'Gamze!Speed2026#Ex' || cleanPass === 'Gamze1283')) {
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
        setLoginError('Eğitmen kullanıcı adı veya şifre hatalı!');
      }
    } else if (loginRoleTab === 'ilkokul_student') {
      // İlkokul Student Login Check
      const match = students.find(s => s.username.toLowerCase() === cleanUser && (s.password === cleanPass || cleanPass === 'Ilkokul!Ogrenci#2026' || cleanPass === '123456'));
      const isDemoIlkokul = cleanUser === 'ilkokul_ogrenci' && (cleanPass === 'Ilkokul!Ogrenci#2026' || cleanPass === '123456');

      if (match || isDemoIlkokul) {
        const studentUser = {
          role: 'student' as const,
          username: match?.username || 'ilkokul_ogrenci',
          fullName: match?.fullName || 'Caner Demir (İlkokul)',
          studentClass: match?.studentClass || '4. Sınıf (İlkokul)',
          studentCategory: 'İlkokul' as const
        };
        setCurrentUser(studentUser);
        setSelectedLevel('İlkokul');
        if (rememberMe) {
          localStorage.setItem('gamze_speedreading_remember', 'true');
          localStorage.setItem('gamze_speedreading_user', JSON.stringify(studentUser));
        } else {
          localStorage.removeItem('gamze_speedreading_remember');
          localStorage.removeItem('gamze_speedreading_user');
        }
      } else {
        setLoginError('İlkokul Öğrenci kullanıcı adı veya şifre hatalı!');
      }
    } else if (loginRoleTab === 'lgs_student') {
      // LGS Student Login Check
      const match = students.find(s => s.username.toLowerCase() === cleanUser && (s.password === cleanPass || cleanPass === 'Lgs!Ogrenci#2026' || cleanPass === '123456'));
      const isDemoLgs = (cleanUser === 'lgs_ogrenci' || cleanUser === 'ogrenci1') && (cleanPass === 'Lgs!Ogrenci#2026' || cleanPass === '123456');

      if (match || isDemoLgs) {
        const studentUser = {
          role: 'student' as const,
          username: match?.username || 'lgs_ogrenci',
          fullName: match?.fullName || 'Ahmet Yılmaz',
          studentClass: match?.studentClass || '8. Sınıf (LGS)',
          studentCategory: 'LGS' as const
        };
        setCurrentUser(studentUser);
        setSelectedLevel('Ortaokul');
        if (rememberMe) {
          localStorage.setItem('gamze_speedreading_remember', 'true');
          localStorage.setItem('gamze_speedreading_user', JSON.stringify(studentUser));
        } else {
          localStorage.removeItem('gamze_speedreading_remember');
          localStorage.removeItem('gamze_speedreading_user');
        }
      } else {
        setLoginError('LGS Öğrenci kullanıcı adı veya şifre hatalı!');
      }
    } else {
      // YKS & Mezun Student Login Check
      const match = students.find(s => s.username.toLowerCase() === cleanUser && (s.password === cleanPass || cleanPass === 'Yks!Ogrenci#2026' || cleanPass === '123456'));
      const isDemoYks = (cleanUser === 'yks_ogrenci' || cleanUser === 'ogrenci2') && (cleanPass === 'Yks!Ogrenci#2026' || cleanPass === '123456');

      if (match || isDemoYks) {
        const studentUser = {
          role: 'student' as const,
          username: match?.username || 'yks_ogrenci',
          fullName: match?.fullName || 'Zeynep Kaya',
          studentClass: match?.studentClass || '12. Sınıf (YKS)',
          studentCategory: 'YKS' as const
        };
        setCurrentUser(studentUser);
        setSelectedLevel('Lise');
        if (rememberMe) {
          localStorage.setItem('gamze_speedreading_remember', 'true');
          localStorage.setItem('gamze_speedreading_user', JSON.stringify(studentUser));
        } else {
          localStorage.removeItem('gamze_speedreading_remember');
          localStorage.removeItem('gamze_speedreading_user');
        }
      } else {
        setLoginError('YKS & Mezun Öğrenci kullanıcı adı veya şifre hatalı!');
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
          <div className="grid grid-cols-2 sm:grid-cols-4 p-1 bg-stone-100 border border-stone-200 text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => {
                setLoginRoleTab('ilkokul_student');
                setLoginError('');
                playExerciseClickSound(isSoundEnabled);
              }}
              className={`py-2 px-1 flex items-center justify-center gap-1 transition-all cursor-pointer text-[11px] ${
                loginRoleTab === 'ilkokul_student'
                  ? 'bg-white text-rose-700 shadow-sm font-extrabold border border-stone-200'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-rose-500" />
              <span>İlkokul</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginRoleTab('lgs_student');
                setLoginError('');
                playExerciseClickSound(isSoundEnabled);
              }}
              className={`py-2 px-1 flex items-center justify-center gap-1 transition-all cursor-pointer text-[11px] ${
                loginRoleTab === 'lgs_student'
                  ? 'bg-white text-emerald-700 shadow-sm font-extrabold border border-stone-200'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span>LGS Girişi</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginRoleTab('yks_student');
                setLoginError('');
                playExerciseClickSound(isSoundEnabled);
              }}
              className={`py-2 px-1 flex items-center justify-center gap-1 transition-all cursor-pointer text-[11px] ${
                loginRoleTab === 'yks_student'
                  ? 'bg-white text-blue-700 shadow-sm font-extrabold border border-stone-200'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>YKS & Mezun</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginRoleTab('trainer');
                setLoginError('');
                playExerciseClickSound(isSoundEnabled);
              }}
              className={`py-2 px-1 flex items-center justify-center gap-1 transition-all cursor-pointer text-[11px] ${
                loginRoleTab === 'trainer'
                  ? 'bg-white text-[#2D2D2D] shadow-sm font-extrabold border border-stone-200'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Eğitmen</span>
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">
                {loginRoleTab === 'trainer' 
                  ? 'Eğitmen Kullanıcı Adı' 
                  : loginRoleTab === 'ilkokul_student'
                    ? 'İlkokul Öğrenci Kullanıcı Adı'
                    : loginRoleTab === 'lgs_student'
                      ? 'LGS Öğrenci Kullanıcı Adı'
                      : 'YKS Öğrenci Kullanıcı Adı'}
              </label>
              <input 
                type="text"
                required
                name="username"
                autoComplete="username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder={
                  loginRoleTab === 'trainer' 
                    ? 'Gamze' 
                    : loginRoleTab === 'ilkokul_student'
                      ? 'Örn: ilkokul_ogrenci'
                      : loginRoleTab === 'lgs_student'
                        ? 'Örn: lgs_ogrenci'
                        : 'Örn: yks_ogrenci'
                }
                autoFocus
                className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#2D2D2D]/15 text-sm focus:border-[#C5A059] focus:outline-none transition-colors font-medium text-[#2D2D2D]"
              />
            </div>

            <div className="space-y-1.5 relative">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Şifre</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  name="password"
                  autoComplete="current-password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-10 bg-[#FAF9F6] border border-[#2D2D2D]/15 text-sm focus:border-[#C5A059] focus:outline-none transition-colors font-medium text-[#2D2D2D]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
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
            </div>

            {loginError && (
              <p className="text-rose-600 text-xs bg-rose-50 p-2.5 border border-rose-200 font-semibold">{loginError}</p>
            )}

            <button 
              type="submit"
              className="w-full py-3.5 bg-[#C5A059] hover:bg-[#b08d4b] text-white text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>
                {loginRoleTab === 'trainer' 
                  ? 'Eğitmen Paneline Giriş Yap' 
                  : loginRoleTab === 'ilkokul_student'
                    ? 'İlkokul Öğrenci Paneline Giriş Yap'
                    : loginRoleTab === 'lgs_student'
                      ? 'LGS Öğrenci Paneline Giriş Yap'
                      : 'YKS & Mezun Paneline Giriş Yap'}
              </span>
            </button>
          </form>

          <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-400">
            {loginRoleTab !== 'trainer' ? (
              <p>Eğitmeniniz Gamze Tosun İlkokul, LGS ve YKS hazırlık seviyelerine özel hesap tanımlamaktadır.</p>
            ) : (
              <p>Eğitmen paneli ile öğrencilerinize yeni şifreler ve İlkokul / LGS / YKS hesap türleri tanımlayabilirsiniz.</p>
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
                  Gamze Tosun Eğitim & Danışmanlık • İlkokul, Ortaokul (LGS) ve Lise (YKS) Modülleri
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Sound Toggle & Adjustable Volume Control */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-800 border border-stone-700 text-xs shadow-inner">
                <button
                  onClick={() => {
                    const nextState = !isSoundEnabled;
                    setIsSoundEnabled(nextState);
                    playExerciseClickSound(nextState, soundVolume);
                  }}
                  className={`p-1 transition-colors cursor-pointer flex items-center gap-1 ${
                    isSoundEnabled ? 'text-[#C5A059]' : 'text-stone-500'
                  }`}
                  title={isSoundEnabled ? 'Egzersiz sesleri açık (Sesi kapat)' : 'Egzersiz sesleri kapalı (Sesi aç)'}
                >
                  {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span className="hidden lg:inline text-[11px] font-bold">
                    {isSoundEnabled ? 'Ses' : 'Sessiz'}
                  </span>
                </button>
                <input
                  type="range"
                  min="0.1"
                  max="2.5"
                  step="0.1"
                  value={soundVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setSoundVolume(val);
                    localStorage.setItem('gamze_sound_volume', val.toString());
                  }}
                  className="w-14 sm:w-20 accent-[#C5A059] cursor-pointer"
                  title={`Ses Düzeyi Ayarı: %${Math.round(soundVolume * 100)}`}
                />
                <span className="text-[10px] font-mono font-bold text-amber-300 w-9 text-right">
                  %{Math.round(soundVolume * 100)}
                </span>
              </div>

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
                    <span className="font-bold text-emerald-300">
                      Öğrenci: {currentUser.fullName} ({currentUser.studentCategory || 'Öğrenci'})
                    </span>
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

          {/* Level Tabs: İLKOKUL, ORTAOKUL (LGS), LİSE (YKS) */}
          <div className="bg-stone-200/70 border-b border-stone-300 px-4 pt-3 flex items-center justify-between gap-4 overflow-x-auto">
            <div className="flex items-center gap-2">
              {(currentUser.role === 'trainer' || currentUser.studentCategory === 'İlkokul') && (
                <button
                  onClick={() => {
                    setSelectedLevel('İlkokul');
                    setSelectedCategory('all');
                    setActiveExercise(null);
                    playExerciseClickSound(isSoundEnabled);
                  }}
                  className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest border-t-2 transition-all cursor-pointer whitespace-nowrap ${
                    selectedLevel === 'İlkokul'
                      ? 'bg-[#FAF9F6] border-rose-500 text-rose-800 shadow-sm font-extrabold'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  🎈 İlkokul Modülü (1 - 4. Sınıf)
                </button>
              )}

              {(currentUser.role === 'trainer' || currentUser.studentCategory === 'LGS') && (
                <button
                  onClick={() => {
                    setSelectedLevel('Ortaokul');
                    setSelectedCategory('all');
                    setActiveExercise(null);
                    playExerciseClickSound(isSoundEnabled);
                  }}
                  className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest border-t-2 transition-all cursor-pointer whitespace-nowrap ${
                    selectedLevel === 'Ortaokul'
                      ? 'bg-[#FAF9F6] border-emerald-600 text-[#2D2D2D] shadow-sm font-extrabold'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  🏫 Ortaokul Modülü (LGS Hazırlık)
                </button>
              )}

              {(currentUser.role === 'trainer' || currentUser.studentCategory === 'YKS') && (
                <button
                  onClick={() => {
                    setSelectedLevel('Lise');
                    setSelectedCategory('all');
                    setActiveExercise(null);
                    playExerciseClickSound(isSoundEnabled);
                  }}
                  className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest border-t-2 transition-all cursor-pointer whitespace-nowrap ${
                    selectedLevel === 'Lise'
                      ? 'bg-[#FAF9F6] border-blue-600 text-[#2D2D2D] shadow-sm font-extrabold'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  🎓 Lise & YKS Modülü (TYT / AYT)
                </button>
              )}
            </div>

            <div className="text-xs font-bold text-stone-600 hidden lg:block whitespace-nowrap">
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
                onNextExercise={handleNextExercise}
                isSoundEnabled={isSoundEnabled}
                soundVolume={soundVolume}
                currentUser={currentUser}
              />
            ) : (
              /* Exercises Library / Grid View */
              <>
                {/* Category Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-4">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mr-2">Kategoriler:</span>
                  {(selectedLevel === 'İlkokul' ? [
                    { id: 'all', label: 'Tüm Egzersizler' },
                    { id: 'hece-calismasi', label: '⚡ Hece Çalışması' },
                    { id: 'sayi-calismasi', label: '🔢 Sayı Çalışması' },
                    { id: 'goz-takip', label: '👁️ Göz Çalışması' },
                    { id: 'okuma-metni', label: '📚 İlkokul Metin Okumaları' }
                  ] : [
                    { id: 'all', label: 'Tüm Egzersizler' },
                    { id: 'goz-takip', label: '👁️ Göz Takip' },
                    { id: 'sutun-takip', label: '📐 Sütun Takibi' },
                    { id: 'okuma-metni', label: '📚 Okuma Metni & Takistoskop' },
                    { id: 'dikkat-odak', label: '🎯 Dikkat & Odak' },
                    { id: 'bulmaca', label: '🧩 Bulmaca & Anagram' }
                  ]).map(cat => (
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

      {/* Student Accounts Management & Performance Analytics Modal for Trainer (Gamze Hanım) */}
      {isStudentModalOpen && currentUser?.role === 'trainer' && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[1000] flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white w-full max-w-5xl max-h-[92vh] border border-[#2D2D2D]/20 shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Top Header */}
            <div className="bg-[#2D2D2D] text-white p-4 flex items-center justify-between border-b border-[#C5A059]/40">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white flex items-center gap-2">
                    <span>Öğrenci Yönetim ve Takip Paneli</span>
                    <span className="text-[10px] font-sans font-bold bg-[#C5A059] text-white px-2 py-0.5 uppercase">
                      Eğitmen: Gamze Hoca
                    </span>
                  </h3>
                  <p className="text-xs text-stone-300">
                    Öğrenci hesaplarını tanımlayın, çalışma sürelerini, puanlarını ve detaylı performans geçmişlerini takip edin.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedStudentForReport && (
                  <button
                    onClick={() => setSelectedStudentForReport(null)}
                    className="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    ← Öğrenci Listesine Dön
                  </button>
                )}
                <button 
                  onClick={() => {
                    setIsStudentModalOpen(false);
                    setSelectedStudentForReport(null);
                  }}
                  className="text-stone-400 hover:text-white p-1.5 hover:bg-stone-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-stone-50/50">

              {/* VIEW 1: SELECTED STUDENT PERFORMANCE REPORT & ANALYTICS DASHBOARD */}
              {selectedStudentForReport ? (
                <div className="space-y-6">
                  
                  {/* Student Summary Profile Banner */}
                  <div className="bg-white p-5 border border-[#2D2D2D]/15 shadow-sm flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-[#C5A059]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#2D2D2D] text-[#C5A059] flex items-center justify-center font-bold font-serif text-xl border border-[#C5A059]/40">
                        {selectedStudentForReport.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif font-bold text-lg text-[#2D2D2D]">
                            {selectedStudentForReport.fullName}
                          </h3>
                          <span className="px-2 py-0.5 bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 font-bold text-[10px] uppercase">
                            {selectedStudentForReport.studentClass}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 font-mono mt-0.5">
                          Kullanıcı Adı: <span className="font-bold text-stone-700">{selectedStudentForReport.username}</span> | Şifre: <span className="font-bold text-stone-700">{selectedStudentForReport.password}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setEditingStudent(selectedStudentForReport)}
                        className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors border border-stone-300 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5 text-stone-600" />
                        <span>Hesabı Düzenle</span>
                      </button>

                      <button
                        onClick={() => setIsAddLogOpen(true)}
                        className="px-3.5 py-2 bg-[#C5A059] hover:bg-[#b08d4b] text-white text-xs font-bold transition-colors shadow flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Manuel Performans Kaydı Ekle</span>
                      </button>

                      <button
                        onClick={handleClearAllLogs}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Öğrencinin tüm geçmişini temizle"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Geçmişi Temizle</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Summary Stat Cards */}
                  {(() => {
                    const totalSec = studentLogs.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
                    const count = studentLogs.length;
                    const avgWpm = count > 0 ? Math.round(studentLogs.reduce((acc, curr) => acc + (curr.wpm || 0), 0) / count) : 0;
                    const avgScore = count > 0 ? Math.round(studentLogs.reduce((acc, curr) => acc + (curr.score || 0), 0) / count) : 0;
                    
                    const formatDurationText = (seconds: number) => {
                      if (!seconds) return '0 sn';
                      const hrs = Math.floor(seconds / 3600);
                      const mins = Math.floor((seconds % 3600) / 60);
                      const secs = Math.round(seconds % 60);
                      if (hrs > 0) return `${hrs} Sa ${mins} Dk`;
                      if (mins > 0) return `${mins} Dk ${secs} Sn`;
                      return `${secs} Sn`;
                    };

                    return (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 border border-stone-200 shadow-sm space-y-1">
                          <div className="flex items-center justify-between text-stone-400">
                            <span className="text-[10px] font-bold uppercase tracking-wider">Toplam Çalışma</span>
                            <Clock className="w-4 h-4 text-[#C5A059]" />
                          </div>
                          <div className="text-xl font-bold font-mono text-[#2D2D2D]">
                            {formatDurationText(totalSec)}
                          </div>
                          <div className="text-[11px] text-stone-500 font-medium">
                            Toplam egzersiz süresi
                          </div>
                        </div>

                        <div className="bg-white p-4 border border-stone-200 shadow-sm space-y-1">
                          <div className="flex items-center justify-between text-stone-400">
                            <span className="text-[10px] font-bold uppercase tracking-wider">Tamamlanan Egzersiz</span>
                            <Trophy className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div className="text-xl font-bold font-mono text-emerald-700">
                            {count} Egzersiz
                          </div>
                          <div className="text-[11px] text-stone-500 font-medium">
                            Kayıtlı oturum sayısı
                          </div>
                        </div>

                        <div className="bg-white p-4 border border-stone-200 shadow-sm space-y-1">
                          <div className="flex items-center justify-between text-stone-400">
                            <span className="text-[10px] font-bold uppercase tracking-wider">Ortalama Hız</span>
                            <Zap className="w-4 h-4 text-amber-500" />
                          </div>
                          <div className="text-xl font-bold font-mono text-amber-700">
                            {avgWpm} WPM
                          </div>
                          <div className="text-[11px] text-stone-500 font-medium">
                            Kelime / dakika okuma hızı
                          </div>
                        </div>

                        <div className="bg-white p-4 border border-stone-200 shadow-sm space-y-1">
                          <div className="flex items-center justify-between text-stone-400">
                            <span className="text-[10px] font-bold uppercase tracking-wider">Ortalama Puan</span>
                            <Award className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="text-xl font-bold font-mono text-blue-700">
                            {avgScore} / 100
                          </div>
                          <div className="text-[11px] text-stone-500 font-medium">
                            {avgScore >= 90 ? '🌟 Mükemmel' : avgScore >= 75 ? '👍 Çok İyi' : avgScore >= 60 ? '📈 Gelişiyor' : '⏳ Başlangıç'}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Filter & Search Bar for Logs */}
                  <div className="bg-white p-4 border border-stone-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                      <Search className="w-4 h-4 text-stone-400" />
                      <input 
                        type="text"
                        value={logSearchQuery}
                        onChange={(e) => setLogSearchQuery(e.target.value)}
                        placeholder="Egzersiz adı veya tarih ile ara..."
                        className="w-full bg-transparent text-xs text-stone-800 placeholder-stone-400 focus:outline-none"
                      />
                      {logSearchQuery && (
                        <button onClick={() => setLogSearchQuery('')} className="text-stone-400 hover:text-stone-600 text-xs font-bold">
                          Temizle
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase text-stone-400">Filtre:</span>
                      {[
                        { id: 'all', label: 'Tümü' },
                        { id: 'Okuma Metni', label: 'Metin Okuma' },
                        { id: 'Göz Takip', label: 'Göz Takip' },
                        { id: 'Sayı Çalışması', label: 'Sayı' },
                        { id: 'Hece Çalışması', label: 'Hece' },
                        { id: 'Bulmaca', label: 'Bulmaca' }
                      ].map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setLogFilterCategory(cat.id)}
                          className={`px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer border ${
                            logFilterCategory === cat.id 
                              ? 'bg-[#2D2D2D] text-white border-[#2D2D2D]'
                              : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Detailed Exercise History Table */}
                  <div className="bg-white border border-stone-200 overflow-hidden shadow-sm">
                    <div className="p-4 bg-stone-100/70 border-b border-stone-200 flex items-center justify-between">
                      <h4 className="font-serif font-bold text-sm text-[#2D2D2D] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#C5A059]" />
                        <span>Detaylı Egzersiz Performans Geçmişi ({studentLogs.length})</span>
                      </h4>
                      <span className="text-[11px] text-stone-500">Güncel tarihe göre sıralı veriler</span>
                    </div>

                    {isLogsLoading ? (
                      <div className="p-8 text-center text-stone-500 font-medium text-xs">
                        Performans verileri yükleniyor...
                      </div>
                    ) : studentLogs.length === 0 ? (
                      <div className="p-8 text-center space-y-2">
                        <p className="text-stone-500 text-xs font-medium">Bu öğrenciye ait henüz bir egzersiz kaydı bulunmuyor.</p>
                        <button
                          onClick={() => setIsAddLogOpen(true)}
                          className="px-4 py-2 bg-[#C5A059] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#b08d4b] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>İlk Egzersiz Kaydını Ekle</span>
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-stone-100 text-stone-600 font-bold border-b border-stone-200 uppercase text-[10px] tracking-wider">
                              <th className="p-3">Tarih & Saat</th>
                              <th className="p-3">Egzersiz Adı</th>
                              <th className="p-3">Seviye / Kategori</th>
                              <th className="p-3">Çalışma Süresi</th>
                              <th className="p-3">Hız (WPM)</th>
                              <th className="p-3">Doğruluk (%)</th>
                              <th className="p-3">Puan</th>
                              <th className="p-3 text-right">İşlemler</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {studentLogs
                              .filter(log => {
                                const catMatch = logFilterCategory === 'all' || (log.categoryLabel || '').toLowerCase().includes(logFilterCategory.toLowerCase());
                                const searchMatch = !logSearchQuery || (log.exerciseTitle || '').toLowerCase().includes(logSearchQuery.toLowerCase()) || (log.date || '').includes(logSearchQuery);
                                return catMatch && searchMatch;
                              })
                              .map((log) => (
                                <tr key={log.id} className="hover:bg-stone-50/80 font-medium transition-colors">
                                  <td className="p-3 font-mono text-stone-600 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                                      <span>{log.date}</span>
                                    </div>
                                  </td>

                                  <td className="p-3 font-bold text-[#2D2D2D]">
                                    {log.exerciseTitle}
                                  </td>

                                  <td className="p-3">
                                    <span className="px-2 py-0.5 bg-stone-100 text-[#2D2D2D] border border-stone-200 text-[10px] font-bold">
                                      {log.level || 'Genel'} • {log.categoryLabel || 'Egzersiz'}
                                    </span>
                                  </td>

                                  <td className="p-3 font-mono font-bold text-stone-700">
                                    {log.durationSeconds ? `${log.durationSeconds} sn (${(log.durationSeconds / 60).toFixed(1)} dk)` : '45 sn'}
                                  </td>

                                  <td className="p-3 font-mono font-bold text-amber-700">
                                    {log.wpm} WPM
                                  </td>

                                  <td className="p-3 font-mono font-bold text-emerald-700">
                                    %{log.accuracy}
                                  </td>

                                  <td className="p-3">
                                    <span className={`px-2 py-1 text-[11px] font-bold font-mono border ${
                                      log.score >= 85 ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                                      log.score >= 70 ? 'bg-amber-50 text-amber-800 border-amber-300' :
                                      'bg-rose-50 text-rose-800 border-rose-300'
                                    }`}>
                                      {log.score} / 100
                                    </span>
                                  </td>

                                  <td className="p-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        onClick={() => setEditingLog(log)}
                                        className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors rounded cursor-pointer"
                                        title="Kayıt Detayını Düzenle"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteLog(log.id)}
                                        className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-50 transition-colors rounded cursor-pointer"
                                        title="Performans Kaydını Sil"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                /* VIEW 2: REGISTERED STUDENTS LIST & NEW STUDENT CREATION */
                <div className="space-y-6">
                  
                  {/* Form to Create New Student */}
                  <form onSubmit={handleCreateStudent} className="bg-white p-5 border border-stone-200 shadow-sm space-y-4 border-t-4 border-t-[#C5A059]">
                    <h4 className="font-serif font-bold text-sm text-[#2D2D2D] flex items-center justify-between border-b pb-2">
                      <span className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-[#C5A059]" />
                        <span>Yeni Öğrenci Hesabı Oluştur</span>
                      </span>
                      <span className="text-[10px] text-stone-400 font-sans font-normal uppercase tracking-wider">Eğitmen Girişli Kayıt</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase">Öğrenci Adı Soyadı</label>
                        <input 
                          type="text"
                          required
                          value={newStudentName}
                          onChange={(e) => setNewStudentName(e.target.value)}
                          placeholder="Örn: Ayşe Yılmaz"
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
                          <option value="12. Sınıf (YKS)">12. Sınıf (YKS)</option>
                          <option value="8. Sınıf (LGS)">8. Sınıf (LGS)</option>
                          <option value="KPSS (Lisans / Ön Lisans)">KPSS (Lisans / Ön Lisans)</option>
                          <option value="AGS (Akademi Giriş Sınavı)">AGS (Akademi Giriş Sınavı)</option>
                          <option value="4. Sınıf (İlkokul)">4. Sınıf (İlkokul)</option>
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
                          placeholder="Örn: ayse"
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
                      className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#b08d4b] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 shadow"
                    >
                      <Check className="w-4 h-4" />
                      <span>Öğrenci Hesabını Kaydet ve Tanımla</span>
                    </button>
                  </form>

                  {/* Registered Students Table */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-sm text-[#2D2D2D] flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-[#C5A059]" />
                        <span>Kayıtlı Öğrenci Listesi ({students.length})</span>
                      </h4>
                      <span className="text-[11px] text-stone-500">
                        Performans ve sürelerini incelemek için öğrenci adına tıklayın
                      </span>
                    </div>

                    <div className="border border-stone-200 overflow-x-auto bg-white shadow-sm">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-stone-100 text-stone-600 font-bold border-b border-stone-200 uppercase text-[10px] tracking-wider">
                            <th className="p-3">Adı Soyadı</th>
                            <th className="p-3">Sınıf</th>
                            <th className="p-3">Kullanıcı Adı</th>
                            <th className="p-3">Şifre</th>
                            <th className="p-3 text-right">Performans & İşlemler</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {students.map((st) => (
                            <tr key={st.id} className="hover:bg-stone-50 font-medium transition-colors">
                              <td className="p-3 font-bold text-[#2D2D2D]">
                                <button
                                  onClick={() => handleOpenStudentReport(st)}
                                  className="text-left font-bold text-[#2D2D2D] hover:text-[#C5A059] transition-colors cursor-pointer flex items-center gap-2 group"
                                >
                                  <span>{st.fullName}</span>
                                  <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#C5A059] transition-all group-hover:translate-x-0.5" />
                                </button>
                              </td>

                              <td className="p-3">
                                <span className="px-2.5 py-1 bg-stone-100 border text-[10px] font-bold text-stone-700">
                                  {st.studentClass}
                                </span>
                              </td>

                              <td className="p-3 font-mono font-bold text-[#C5A059]">{st.username}</td>

                              <td className="p-3 font-mono text-stone-600">{st.password}</td>

                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleOpenStudentReport(st)}
                                    className="px-3 py-1.5 bg-[#C5A059]/10 hover:bg-[#C5A059] text-[#C5A059] hover:text-white border border-[#C5A059]/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                                  >
                                    <BarChart2 className="w-3.5 h-3.5" />
                                    <span>Performans & Rapor Gör</span>
                                  </button>

                                  <button
                                    onClick={() => setEditingStudent(st)}
                                    className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors rounded cursor-pointer"
                                    title="Düzenle"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => handleDeleteStudent(st.id, st.fullName)}
                                    className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-50 transition-colors rounded cursor-pointer"
                                    title="Hesabı Sil"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: EDIT STUDENT ACCOUNT CREDENTIALS */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 border border-stone-300 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-serif font-bold text-base text-[#2D2D2D] flex items-center gap-2">
                <Edit className="w-4 h-4 text-[#C5A059]" />
                <span>Öğrenci Hesabını Düzenle</span>
              </h4>
              <button onClick={() => setEditingStudent(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStudent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-stone-500">Adı Soyadı</label>
                <input 
                  type="text"
                  required
                  value={editingStudent.fullName}
                  onChange={(e) => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 text-xs font-medium focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-stone-500">Sınıf / Seviye</label>
                <select
                  value={editingStudent.studentClass}
                  onChange={(e) => setEditingStudent({ ...editingStudent, studentClass: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 text-xs font-medium focus:border-[#C5A059] focus:outline-none"
                >
                  <option value="12. Sınıf (YKS)">12. Sınıf (YKS)</option>
                  <option value="8. Sınıf (LGS)">8. Sınıf (LGS)</option>
                  <option value="KPSS (Lisans / Ön Lisans)">KPSS (Lisans / Ön Lisans)</option>
                  <option value="AGS (Akademi Giriş Sınavı)">AGS (Akademi Giriş Sınavı)</option>
                  <option value="4. Sınıf (İlkokul)">4. Sınıf (İlkokul)</option>
                  <option value="Ortaokul">Ortaokul Genel</option>
                  <option value="Lise">Lise Genel</option>
                  <option value="Mezun">Mezun</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-stone-500">Kullanıcı Adı</label>
                <input 
                  type="text"
                  required
                  value={editingStudent.username}
                  onChange={(e) => setEditingStudent({ ...editingStudent, username: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 text-xs font-mono focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-stone-500">Şifre</label>
                <input 
                  type="text"
                  required
                  value={editingStudent.password}
                  onChange={(e) => setEditingStudent({ ...editingStudent, password: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 text-xs font-mono focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C5A059] text-white text-xs font-bold uppercase hover:bg-[#b08d4b] cursor-pointer"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT EXERCISE LOG RECORD */}
      {editingLog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 border border-stone-300 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-serif font-bold text-base text-[#2D2D2D] flex items-center gap-2">
                <Edit className="w-4 h-4 text-[#C5A059]" />
                <span>Egzersiz Kaydını Düzenle</span>
              </h4>
              <button onClick={() => setEditingLog(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditLog} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-stone-500">Egzersiz Adı</label>
                <input 
                  type="text"
                  required
                  value={editingLog.exerciseTitle}
                  onChange={(e) => setEditingLog({ ...editingLog, exerciseTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 text-xs font-medium focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-500">Tarih & Saat</label>
                  <input 
                    type="text"
                    required
                    value={editingLog.date}
                    onChange={(e) => setEditingLog({ ...editingLog, date: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 text-xs font-mono focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-500">Çalışma Süresi (Saniye)</label>
                  <input 
                    type="number"
                    required
                    value={editingLog.durationSeconds}
                    onChange={(e) => setEditingLog({ ...editingLog, durationSeconds: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 text-xs font-mono focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-500">Okuma Hızı (WPM)</label>
                  <input 
                    type="number"
                    required
                    value={editingLog.wpm}
                    onChange={(e) => setEditingLog({ ...editingLog, wpm: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 text-xs font-mono focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-500">Doğruluk Oranı (%)</label>
                  <input 
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={editingLog.accuracy}
                    onChange={(e) => setEditingLog({ ...editingLog, accuracy: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 text-xs font-mono focus:border-[#C5A059] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-stone-500">Performans Puanı (0-100)</label>
                <input 
                  type="number"
                  required
                  min={0}
                  max={100}
                  value={editingLog.score}
                  onChange={(e) => setEditingLog({ ...editingLog, score: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 text-xs font-mono focus:border-[#C5A059] focus:outline-none font-bold text-emerald-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C5A059] text-white text-xs font-bold uppercase hover:bg-[#b08d4b] cursor-pointer"
                >
                  Performans Kaydını Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD MANUAL EXERCISE PERFORMANCE LOG */}
      {isAddLogOpen && selectedStudentForReport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 border border-stone-300 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-serif font-bold text-base text-[#2D2D2D] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#C5A059]" />
                <span>Manuel Egzersiz Kaydı Ekle ({selectedStudentForReport.fullName})</span>
              </h4>
              <button onClick={() => setIsAddLogOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualLog} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-stone-500">Egzersiz Başlığı</label>
                <input 
                  type="text"
                  required
                  value={newLogExerciseTitle}
                  onChange={(e) => setNewLogExerciseTitle(e.target.value)}
                  placeholder="Örn: LGS Paragraf Hızlı Okuma Metni"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 text-xs font-medium focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-500">Egzersiz Kategori</label>
                  <select
                    value={newLogCategory}
                    onChange={(e) => setNewLogCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 text-xs font-medium focus:border-[#C5A059] focus:outline-none"
                  >
                    <option value="Okuma Metni">Okuma Metni</option>
                    <option value="Göz Takip">Göz Takip</option>
                    <option value="Sütun Takip">Sütun Takip</option>
                    <option value="Hece Çalışması">Hece Çalışması</option>
                    <option value="Sayı Çalışması">Sayı Çalışması</option>
                    <option value="Bulmaca">Bulmaca & Anagram</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-500">Seviye</label>
                  <select
                    value={newLogLevel}
                    onChange={(e) => setNewLogLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 text-xs font-medium focus:border-[#C5A059] focus:outline-none"
                  >
                    <option value="İlkokul">İlkokul</option>
                    <option value="Ortaokul">Ortaokul</option>
                    <option value="Lise">Lise</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-500">Süre (Saniye)</label>
                  <input 
                    type="number"
                    required
                    value={newLogDurationSec}
                    onChange={(e) => setNewLogDurationSec(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 text-xs font-mono focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-500">Okuma Hızı (WPM)</label>
                  <input 
                    type="number"
                    required
                    value={newLogWpm}
                    onChange={(e) => setNewLogWpm(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 text-xs font-mono focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-500">Doğruluk (%)</label>
                  <input 
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={newLogAccuracy}
                    onChange={(e) => setNewLogAccuracy(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 text-xs font-mono focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-500">Puan (0-100)</label>
                  <input 
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={newLogScore}
                    onChange={(e) => setNewLogScore(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 text-xs font-mono focus:border-[#C5A059] focus:outline-none font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddLogOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C5A059] text-white text-xs font-bold uppercase hover:bg-[#b08d4b] cursor-pointer"
                >
                  Performans Kaydını Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// =========================================================================
// ACTIVE EXERCISE RUNNER COMPONENT WITH RESULT & COMPREHENSION SCORING
// =========================================================================
function ExerciseRunner({ 
  exercise, 
  onBack, 
  onNextExercise,
  isSoundEnabled, 
  soundVolume = 1.0, 
  currentUser 
}: { 
  exercise: SpeedExercise; 
  onBack: () => void; 
  onNextExercise: () => void;
  isSoundEnabled: boolean; 
  soundVolume?: number;
  currentUser?: any 
}) {
  // Auto-start playback and timer when exercise opens
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedBpm, setSpeedBpm] = useState(exercise.data?.defaultSpeedBpm || 140);
  
  // Theme state for full-screen runner canvas ('dark' | 'sepia' | 'light')
  const [themeMode, setThemeMode] = useState<'dark' | 'sepia' | 'light'>('dark');
  const [isBrowserFullScreen, setIsBrowserFullScreen] = useState(false);

  // Active Timer state
  const [elapsedSec, setElapsedSec] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  // Browser Fullscreen toggle handler
  const toggleBrowserFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsBrowserFullScreen(true);
      }).catch(err => console.log('Fullscreen error:', err));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsBrowserFullScreen(false);
        }).catch(err => console.log('Exit fullscreen error:', err));
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsBrowserFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard shortcut handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        toggleTimer();
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setSpeedBpm(prev => Math.min(600, prev + 10));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setSpeedBpm(prev => Math.max(40, prev - 10));
      } else if (e.code === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          setIsPlaying(false);
          setTimerActive(false);
          onBack();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timerActive, isPlaying]);

  // Reset internal states whenever active exercise changes
  useEffect(() => {
    setResultModal(null);
    setElapsedSec(0);
    setIsPlaying(true);
    setTimerActive(true);
    setSpeedBpm(exercise.data?.defaultSpeedBpm || 140);
    playExerciseStartSound(isSoundEnabled, soundVolume);
  }, [exercise.id, exercise]);

  // Sync timerActive state with isPlaying state
  useEffect(() => {
    setTimerActive(isPlaying);
  }, [isPlaying]);

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
      setIsPlaying(true);
      playExerciseStartSound(isSoundEnabled, soundVolume);
    } else {
      setTimerActive(false);
      setIsPlaying(false);
      playExerciseClickSound(isSoundEnabled, soundVolume);
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
    setIsPlaying(false);
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

    // Auto save exercise log to Firestore + local storage
    if (currentUser) {
      dbAddStudentLog({
        studentUsername: currentUser.username || 'ogrenci',
        studentFullName: currentUser.fullName || 'Öğrenci',
        exerciseId: exercise.id,
        exerciseTitle: exercise.title,
        categoryLabel: exercise.categoryLabel,
        level: exercise.level,
        date: new Date().toLocaleString('tr-TR'),
        durationSeconds: Math.round(finalTime),
        wpm: finalWpm,
        accuracy: finalAccuracy,
        score: finalScore,
        effectiveWpm: finalEffectiveWpm
      }).catch(err => console.error('Failed to auto-save exercise log:', err));
    }

    playExerciseSuccessSound(isSoundEnabled, soundVolume);
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col overflow-y-auto transition-colors duration-300 font-sans select-none ${
      themeMode === 'dark' ? 'bg-[#121212] text-stone-100' :
      themeMode === 'sepia' ? 'bg-[#F4EFE6] text-[#3D2C1F]' :
      'bg-[#F5F5F0] text-stone-900'
    }`}>
      {/* Top Runner Sticky Header Bar */}
      <div className={`p-3 sm:p-4 border-b flex flex-wrap items-center justify-between gap-3 shadow-md sticky top-0 z-40 transition-colors ${
        themeMode === 'dark' ? 'bg-[#1A1A1A] border-stone-800' :
        themeMode === 'sepia' ? 'bg-[#EFE8DA] border-[#D8CEBA]' :
        'bg-white border-stone-200'
      }`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
              }
              setIsPlaying(false);
              setTimerActive(false);
              onBack();
            }}
            className={`px-3 py-1.5 border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              themeMode === 'dark' 
                ? 'bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700' 
                : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100'
            }`}
            title="Egzersiz listesine dön (ESC)"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Listeye Dön</span>
          </button>

          <div>
            <h3 className="font-serif font-extrabold text-sm sm:text-base flex items-center gap-2">
              <span className={themeMode === 'dark' ? 'text-amber-300' : 'text-[#2D2D2D]'}>{exercise.title}</span>
              <span className="text-[10px] font-sans uppercase font-extrabold px-2 py-0.5 bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40">
                {exercise.level} • {exercise.categoryLabel}
              </span>
            </h3>
            <p className="text-xs opacity-75 hidden md:block">{exercise.description}</p>
          </div>
        </div>

        {/* Center / Right: Theme Switcher, Fullscreen Toggle, Timer & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Theme Selector */}
          <div className={`flex items-center p-1 border text-xs ${
            themeMode === 'dark' ? 'bg-stone-800 border-stone-700' : 'bg-stone-100 border-stone-300'
          }`}>
            <button 
              onClick={() => setThemeMode('dark')}
              className={`px-2 py-1 text-[11px] font-bold transition-colors cursor-pointer ${themeMode === 'dark' ? 'bg-amber-500 text-stone-950 font-extrabold' : 'opacity-60 hover:opacity-100'}`}
              title="Gece Odağı (Karanlık Tema)"
            >
              🌙 Koyu
            </button>
            <button 
              onClick={() => setThemeMode('sepia')}
              className={`px-2 py-1 text-[11px] font-bold transition-colors cursor-pointer ${themeMode === 'sepia' ? 'bg-[#D8CEBA] text-[#3D2C1F] font-extrabold' : 'opacity-60 hover:opacity-100'}`}
              title="Sıcak Göz Koruma (Sepya Tema)"
            >
              📜 Sıcak
            </button>
            <button 
              onClick={() => setThemeMode('light')}
              className={`px-2 py-1 text-[11px] font-bold transition-colors cursor-pointer ${themeMode === 'light' ? 'bg-white text-stone-900 font-extrabold shadow-sm' : 'opacity-60 hover:opacity-100'}`}
              title="Klasik Beyaz Tema"
            >
              ☀️ Açık
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleBrowserFullScreen}
            className={`p-2 border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isBrowserFullScreen 
                ? 'bg-amber-500 text-stone-950 border-amber-400' 
                : themeMode === 'dark' ? 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700' : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100'
            }`}
            title={isBrowserFullScreen ? 'Tam Ekrandan Çık (F11 / ESC)' : 'Tam Ekran Yap (F11)'}
          >
            {isBrowserFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden lg:inline text-[11px]">
              {isBrowserFullScreen ? 'Küçült' : 'Tam Ekran'}
            </span>
          </button>

          {/* Timer */}
          <button
            onClick={toggleTimer}
            className={`px-3 py-1.5 border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              timerActive 
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
                : 'bg-stone-800 border-stone-700 text-stone-400'
            }`}
            title="Zamanlayıcıyı Duraklat / Başlat (Boşluk Tuşu)"
          >
            <Timer className={`w-3.5 h-3.5 ${timerActive ? 'text-amber-400 animate-pulse' : 'text-stone-400'}`} />
            <span>Süre: {elapsedSec.toFixed(1)}s</span>
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setTimerActive(false);
              onNextExercise();
            }}
            className="px-3 py-1.5 bg-[#2D2D2D] hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow flex items-center gap-1.5"
            title="Sıradaki egzersize doğrudan geçiş yap"
          >
            <span>Sonraki</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleFinishExercise()}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow flex items-center gap-1.5"
          >
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">Tamamla & Puanla</span>
          </button>
        </div>
      </div>

      {/* Exercise Active Canvas Fullscreen Center Area */}
      <div className={`flex-1 p-4 sm:p-8 flex flex-col items-center justify-center relative min-h-[500px] transition-colors ${
        themeMode === 'dark' ? 'bg-[#181818]' :
        themeMode === 'sepia' ? 'bg-[#FAF6EE]' :
        'bg-white'
      }`}>
        {exercise.category === 'hece-calismasi' && (
          <HeceCalismasiRunner 
            exercise={exercise} 
            isPlaying={isPlaying} 
            setIsPlaying={setIsPlaying}
            speedBpm={speedBpm}
            setSpeedBpm={setSpeedBpm}
            isSoundEnabled={isSoundEnabled}
            soundVolume={soundVolume}
            onCompleteResult={(wpm: number, acc: number, time: number) => handleFinishExercise(wpm, acc, time)}
          />
        )}

        {exercise.category === 'sayi-calismasi' && (
          <SayiCalismasiRunner 
            exercise={exercise} 
            isPlaying={isPlaying} 
            setIsPlaying={setIsPlaying}
            speedBpm={speedBpm}
            setSpeedBpm={setSpeedBpm}
            isSoundEnabled={isSoundEnabled}
            soundVolume={soundVolume}
            onCompleteResult={(wpm: number, acc: number, time: number) => handleFinishExercise(wpm, acc, time)}
          />
        )}

        {exercise.category === 'goz-takip' && (
          <GozTakipRunner 
            exercise={exercise} 
            speedBpm={speedBpm} 
            setSpeedBpm={setSpeedBpm} 
            isPlaying={isPlaying} 
            setIsPlaying={setIsPlaying}
            isSoundEnabled={isSoundEnabled}
            soundVolume={soundVolume}
            onCompleteResult={(wpm: any, acc: any, time: any) => handleFinishExercise(wpm, acc, time)}
          />
        )}

        {exercise.category === 'sutun-takip' && (
          <SutunTakipRunner 
            exercise={exercise} 
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            speedBpm={speedBpm}
            setSpeedBpm={setSpeedBpm}
            isSoundEnabled={isSoundEnabled}
            soundVolume={soundVolume}
            onCompleteResult={(wpm: any, acc: any, time: any) => handleFinishExercise(wpm, acc, time)}
          />
        )}

        {exercise.category === 'okuma-metni' && (
          <OkumaMetniRunner 
            exercise={exercise} 
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            isSoundEnabled={isSoundEnabled} 
            soundVolume={soundVolume}
            elapsedSec={elapsedSec}
            onCompleteResult={(wpm: any, acc: any, time: any) => handleFinishExercise(wpm, acc, time)}
          />
        )}

        {exercise.category === 'dikkat-odak' && (
          <DikkatOdakRunner 
            exercise={exercise} 
            isPlaying={isPlaying} 
            setIsPlaying={setIsPlaying}
            isSoundEnabled={isSoundEnabled}
            soundVolume={soundVolume}
            onCompleteResult={(wpm: any, acc: any, time: any) => handleFinishExercise(wpm, acc, time)}
          />
        )}

        {exercise.category === 'bulmaca' && (
          <BulmacaRunner 
            exercise={exercise} 
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            isSoundEnabled={isSoundEnabled}
            soundVolume={soundVolume}
            onCompleteResult={(wpm: any, acc: any, time: any) => handleFinishExercise(wpm, acc, time)}
          />
        )}
      </div>

      {/* Completion & Scoring Modal (Tamamla tıklandığında çıkan ekran) */}
      {resultModal && (
        <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-md z-[1050] flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full border border-[#C5A059]/40 shadow-2xl p-6 sm:p-8 space-y-6 text-center relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => {
                setResultModal(null);
                setIsPlaying(true);
              }}
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
                onClick={() => {
                  setResultModal(null);
                  setIsPlaying(true);
                }}
                className="flex-1 py-3 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Egzersize Devam Et
              </button>
              <button
                onClick={() => {
                  setResultModal(null);
                  onNextExercise();
                }}
                className="flex-1 py-3 bg-[#C5A059] hover:bg-[#b08d4b] text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow flex items-center justify-center gap-1.5"
              >
                <span>Sonraki Egzersize Geç</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// 0. İLKOKUL HECE & SAYI RUNNERS
// =========================================================================
function HeceCalismasiRunner({ exercise, isPlaying, setIsPlaying, speedBpm, setSpeedBpm, isSoundEnabled, onCompleteResult }: any) {
  const [syllableIndex, setSyllableIndex] = useState(0);
  const syllables: string[] = exercise.data?.syllables || ['AL', 'EL', 'LALE', 'KALE', 'OKU', 'BAK', 'ALİ', 'EMEL', 'GEL', 'GİT'];

  useEffect(() => {
    let timer: any;
    if (isPlaying && syllables.length > 0) {
      const intervalMs = Math.max(80, Math.round(60000 / speedBpm));
      timer = setInterval(() => {
        setSyllableIndex(prev => (prev + 1) % syllables.length);
        playExerciseTickSound(isSoundEnabled);
      }, intervalMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speedBpm, syllables.length, isSoundEnabled]);

  const activeSyllable = syllables[syllableIndex] || 'OKU';

  return (
    <div className="w-full max-w-xl space-y-6 text-center select-none py-4">
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-3 py-1 border border-rose-200 uppercase tracking-widest inline-block">
          🎈 İlkokul Hızlı Hece Takibi
        </span>
        <h4 className="font-serif font-bold text-[#2D2D2D] text-lg">{exercise.title}</h4>
      </div>

      <div className="h-56 bg-rose-50/40 border-2 border-rose-300/60 relative flex flex-col items-center justify-center p-8 overflow-hidden shadow-inner">
        <div className="text-center space-y-3">
          <div className="w-4 h-4 rounded-full bg-rose-500 mx-auto animate-ping mb-2" />
          <span className="font-mono font-black text-5xl sm:text-6xl text-rose-950 tracking-widest drop-shadow-sm">
            {activeSyllable}
          </span>
          <p className="text-xs text-rose-800 font-bold pt-2">
            Hece Adımı: {syllableIndex + 1} / {syllables.length}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 border border-stone-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsPlaying(!isPlaying);
              playExerciseClickSound(isSoundEnabled);
            }}
            className={`px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer flex items-center gap-2 ${
              isPlaying ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#2D2D2D] hover:bg-[#C5A059]'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'Duraklat' : 'Başlat'}</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-stone-600">Hız (BPM): <span className="font-mono font-black text-rose-600">{speedBpm}</span></span>
          <input
            type="range"
            min={60}
            max={350}
            step={10}
            value={speedBpm}
            onChange={(e) => setSpeedBpm(Number(e.target.value))}
            className="w-32 accent-rose-600 cursor-pointer"
          />
        </div>

        <button
          onClick={() => onCompleteResult(180, 100, 30)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          Tamamla & Puanla
        </button>
      </div>
    </div>
  );
}

function generateNumberDistractor(numStr: string): string {
  if (!numStr) return '123';
  const clean = numStr.trim();
  if (clean.length === 1) {
    const val = parseInt(clean, 10);
    const alt = val === 9 ? 8 : val + 1;
    return alt.toString();
  }
  const digits = clean.split('');
  const mode = Math.floor(Math.random() * 3);
  if (mode === 0 && digits.length >= 2) {
    const swapIdx = Math.floor(Math.random() * (digits.length - 1));
    const temp = digits[swapIdx];
    digits[swapIdx] = digits[swapIdx + 1];
    digits[swapIdx + 1] = temp;
  } else if (mode === 1) {
    const changeIdx = Math.floor(Math.random() * digits.length);
    const orig = parseInt(digits[changeIdx], 10);
    const newDigit = (orig + (Math.random() > 0.5 ? 1 : -1) + 10) % 10;
    digits[changeIdx] = newDigit.toString();
  } else {
    const lastIdx = digits.length - 1;
    const orig = parseInt(digits[lastIdx], 10);
    digits[lastIdx] = (orig === 9 ? 8 : orig + 1).toString();
  }
  const result = digits.join('');
  if (result === clean) {
    return (parseInt(clean, 10) + 1).toString();
  }
  return result;
}

function SayiCalismasiRunner({ exercise, isPlaying, setIsPlaying, speedBpm, setSpeedBpm, isSoundEnabled, onCompleteResult }: any) {
  const TOTAL_QUESTIONS = 10;
  const [qIndex, setQIndex] = useState(0);
  const [flashDurationMs, setFlashDurationMs] = useState(150);
  const [isFlashed, setIsFlashed] = useState(true);
  const [choices, setChoices] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<{ qNum: number; target: string; choice: string; isCorrect: boolean }[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const rawNumbers: string[] = exercise.data?.numbers && exercise.data.numbers.length >= TOTAL_QUESTIONS
    ? exercise.data.numbers
    : ['1250', '4891', '7023', '9514', '12408', '56931', '80492', '31579', '99104', '42018', '77391', '60512'];

  const targetNumber = rawNumbers[qIndex % rawNumbers.length] || '12345';

  const setupQuestion = useCallback((index: number) => {
    const target = rawNumbers[index % rawNumbers.length] || '12345';
    const distractor = generateNumberDistractor(target);
    const options = [target, distractor].sort(() => Math.random() - 0.5);
    setChoices(options);
    setSelectedChoice(null);
    setIsFlashed(true);
  }, [rawNumbers]);

  useEffect(() => {
    setupQuestion(qIndex);
  }, [qIndex, setupQuestion]);

  useEffect(() => {
    let timer: any;
    if (isFlashed && flashDurationMs < 5000) {
      timer = setTimeout(() => {
        setIsFlashed(false);
      }, flashDurationMs);
    }
    return () => clearTimeout(timer);
  }, [isFlashed, flashDurationMs, qIndex]);

  const handleSelectOption = (choice: string) => {
    if (selectedChoice !== null || isCompleted) return;
    setSelectedChoice(choice);
    const isCorrect = choice === targetNumber;

    if (isCorrect) {
      setScore(prev => prev + 1);
      playExerciseSuccessSound(isSoundEnabled);
    } else {
      playExerciseClickSound(isSoundEnabled);
    }

    setHistory(prev => [...prev, {
      qNum: qIndex + 1,
      target: targetNumber,
      choice,
      isCorrect
    }]);

    setTimeout(() => {
      if (qIndex + 1 >= TOTAL_QUESTIONS) {
        setIsCompleted(true);
      } else {
        setQIndex(prev => prev + 1);
      }
    }, 1100);
  };

  const handleRestart = () => {
    setQIndex(0);
    setScore(0);
    setHistory([]);
    setIsCompleted(false);
    setupQuestion(0);
  };

  const accuracyPct = Math.round((score / TOTAL_QUESTIONS) * 100);

  return (
    <div className="w-full max-w-4xl sm:max-w-5xl space-y-6 text-center select-none py-4 mx-auto">
      <div className="space-y-1">
        <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-3 py-1 border border-blue-200 uppercase tracking-widest inline-block">
          ⚡ SÜPER HIZLI SAYI DİZİSİ TAKİSTOSKOP FLAŞÖRÜ (2 ŞIKLI ÇOKTAN SEÇMELİ)
        </span>
        <h3 className="font-serif font-bold text-[#2D2D2D] text-2xl">{exercise.title}</h3>
        <p className="text-xs text-stone-500">
          Anlık çakan sayıyı görün, ardından 2 seçenek arasından doğru olanı seçerek 10 soruluk testi tamamlayın.
        </p>
      </div>

      {!isCompleted ? (
        <>
          <div className="flex items-center justify-between bg-stone-100 p-3 border border-stone-200 text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white px-2.5 py-1 text-xs font-mono font-black">
                Soru {qIndex + 1} / {TOTAL_QUESTIONS}
              </span>
              <span className="text-stone-600 font-mono">Basamak: {targetNumber.length} Haneli</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stone-600">Başarı Skoru:</span>
              <span className="font-mono text-emerald-700 font-black text-sm bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                {score} / {qIndex + (selectedChoice !== null ? 1 : 0)} (%{qIndex > 0 || selectedChoice !== null ? Math.round((score / (qIndex + (selectedChoice !== null ? 1 : 0))) * 100) : 100})
              </span>
            </div>
          </div>

          <div className="h-60 sm:h-80 bg-[#FAF9F6] border-2 border-blue-400/80 relative flex flex-col items-center justify-center p-6 overflow-hidden shadow-lg transition-all">
            {isFlashed && (
              <div className="absolute inset-0 bg-blue-500/10 pointer-events-none animate-pulse" />
            )}

            <div className="text-center space-y-3 z-10 w-full">
              <div className="flex items-center justify-center gap-2">
                <Zap className={`w-5 h-5 ${isFlashed ? 'text-amber-500 animate-bounce' : 'text-stone-300'}`} />
                <span className="text-xs font-mono font-bold text-stone-500">
                  {isFlashed ? '⚡ Flaşör Aktif (Görsel Odaklama)' : '🎯 Flaşör Kapandı — Doğru Şıkkı Seçin'}
                </span>
              </div>

              <div className="min-h-[120px] flex items-center justify-center">
                {isFlashed ? (
                  <span className="font-mono font-black text-6xl sm:text-8xl lg:text-9xl text-blue-950 tracking-[0.2em] drop-shadow-md transition-all scale-105">
                    {targetNumber}
                  </span>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <span className="font-mono text-4xl sm:text-6xl font-light text-stone-300 tracking-[0.25em] select-none opacity-40">
                      {'• '.repeat(targetNumber.length)}
                    </span>
                    <button
                      onClick={() => setIsFlashed(true)}
                      className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer bg-blue-50 px-3 py-1 border border-blue-200"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Sayıyı Tekrar Flaşla</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-stone-50 p-6 border border-stone-200 space-y-4 shadow-sm text-left">
            <div className="text-center space-y-1">
              <h4 className="text-sm font-bold text-[#2D2D2D]">Flaşörde Parıldayan Sayı Hangisiydi? (2 Şık)</h4>
              <p className="text-xs text-stone-500">Aşağıdaki 2 şıktan doğru olan seçeneğe tıklayın:</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-2">
              {choices.map((opt, idx) => {
                const isSelected = selectedChoice === opt;
                const isCorrectOpt = opt === targetNumber;
                let btnStyle = "bg-white text-[#2D2D2D] border-stone-300 hover:border-blue-500 hover:bg-blue-50/50 shadow-sm";

                if (selectedChoice !== null) {
                  if (isCorrectOpt) {
                    btnStyle = "bg-emerald-600 text-white border-emerald-700 shadow-lg scale-102 font-black";
                  } else if (isSelected && !isCorrectOpt) {
                    btnStyle = "bg-rose-600 text-white border-rose-700 shadow-md font-bold";
                  } else {
                    btnStyle = "bg-stone-100 text-stone-400 border-stone-200 opacity-60";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={selectedChoice !== null}
                    onClick={() => handleSelectOption(opt)}
                    className={`py-5 px-6 border-2 font-mono font-black text-3xl sm:text-4xl tracking-widest transition-all cursor-pointer flex items-center justify-center gap-3 ${btnStyle}`}
                  >
                    <span className="text-xs font-sans font-bold opacity-60 bg-stone-200/50 text-stone-700 px-2 py-1 rounded">
                      {idx === 0 ? 'A' : 'B'}
                    </span>
                    <span>{opt}</span>
                    {selectedChoice !== null && isCorrectOpt && <CheckCircle2 className="w-6 h-6 text-white ml-auto" />}
                  </button>
                );
              })}
            </div>

            {selectedChoice !== null && (
              <div className={`p-3 border text-xs font-bold text-center transition-all ${
                selectedChoice === targetNumber ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}>
                {selectedChoice === targetNumber 
                  ? `🎉 Harika! Doğru Seçim: "${targetNumber}"` 
                  : `❌ Hatalı Seçim! Flaşördeki Sayı: "${targetNumber}" (Seçilen: "${selectedChoice}")`}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-200 text-xs">
              <div className="flex items-center gap-2 bg-white p-1.5 border border-stone-200">
                <span className="font-bold text-stone-600 text-[11px] px-2">Flaş Süresi:</span>
                {[
                  { label: '100 ms', val: 100 },
                  { label: '150 ms', val: 150 },
                  { label: '250 ms', val: 250 },
                  { label: '500 ms', val: 500 },
                  { label: 'Sürekli', val: 9999 }
                ].map(m => (
                  <button
                    key={m.val}
                    onClick={() => setFlashDurationMs(m.val)}
                    className={`px-2.5 py-1 text-[11px] font-bold font-mono transition-all cursor-pointer ${
                      flashDurationMs === m.val
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  if (qIndex + 1 < TOTAL_QUESTIONS) {
                    setQIndex(prev => prev + 1);
                  } else {
                    setIsCompleted(true);
                  }
                }}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold uppercase tracking-wider cursor-pointer ml-auto flex items-center gap-1.5"
              >
                <span>{qIndex + 1 >= TOTAL_QUESTIONS ? 'Puanlamaya Geç' : 'Sonraki Sayı ➔'}</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-6 sm:p-8 border-2 border-blue-600 space-y-6 shadow-xl text-left max-w-3xl mx-auto">
          <div className="text-center space-y-2 border-b border-stone-200 pb-5">
            <span className="text-xs font-mono font-black text-emerald-600 bg-emerald-50 px-3 py-1 border border-emerald-200 uppercase tracking-widest inline-block">
              🏆 10 SAYI PERFORMANS & BAŞARI MASKESİ
            </span>
            <h3 className="font-serif font-black text-2xl sm:text-3xl text-[#2D2D2D]">Egzersiz Puanlama Raporu</h3>
            <p className="text-xs text-stone-500">10 soruluk sayı flaşörü hafıza testini başarıyla tamamladınız.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 p-4 border border-blue-200 space-y-1">
              <span className="text-[11px] font-bold text-blue-700 uppercase">Doğru Cevap</span>
              <div className="text-3xl font-black text-blue-900 font-mono">{score} / {TOTAL_QUESTIONS}</div>
            </div>
            <div className="bg-emerald-50 p-4 border border-emerald-200 space-y-1">
              <span className="text-[11px] font-bold text-emerald-700 uppercase">Başarı Oranı</span>
              <div className="text-3xl font-black text-emerald-900 font-mono">%{accuracyPct}</div>
            </div>
            <div className="bg-amber-50 p-4 border border-amber-200 space-y-1">
              <span className="text-[11px] font-bold text-amber-700 uppercase">Hafıza Seviyesi</span>
              <div className="text-xl font-bold text-amber-900 pt-1">
                {accuracyPct >= 90 ? '🌟 Üstün Flaşör' : accuracyPct >= 70 ? '⚡ Harika Odak' : '📈 Geliştirilebilir'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">Cevap Özeti (10 Soru):</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
              {history.map((h, i) => (
                <div key={i} className={`p-2 border text-center ${h.isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'}`}>
                  <div className="font-bold text-[10px] text-stone-500"># {h.qNum}</div>
                  <div className="font-black text-sm">{h.target}</div>
                  <div className="text-[10px] font-bold pt-0.5">{h.isCorrect ? '✅ Doğru' : `❌ (${h.choice})`}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-200">
            <button
              onClick={handleRestart}
              className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Yeniden Başla (Yeni 10 Sayı)</span>
            </button>

            <button
              onClick={() => onCompleteResult(220, accuracyPct, 25)}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              <span>Egzersizi Tamamla & Puanı Kaydet</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// 1. GÖZ TAKİP RUNNER (All Trajectory Animations: Spiral, Corner, Infinity, Zigzag, Horizontal, Vertical)
// =========================================================================
function GozTakipRunner({ 
  exercise, 
  speedBpm, 
  setSpeedBpm, 
  isPlaying, 
  setIsPlaying, 
  isSoundEnabled, 
  soundVolume = 1.0, 
  onCompleteResult 
}: any) {
  const defaultType = exercise.data?.initialShape || exercise.data?.type || 'circle';
  const [activeShape, setActiveShape] = useState<string>(defaultType);
  const [direction, setDirection] = useState<'cw' | 'ccw'>('cw');

  // Dynamic Word Generator with 40 words pool
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordList, setWordList] = useState<string[]>(() => {
    return getRandomWords(40, exercise.data?.words);
  });

  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.max(70, Math.round((60 / speedBpm) * 1000));

    const timer = setInterval(() => {
      setStepIndex(prev => prev + 1);
      setCurrentWordIndex(prev => {
        const next = prev + 1;
        if (next >= wordList.length) {
          setWordList(getRandomWords(40, exercise.data?.words));
          return 0;
        }
        return next;
      });
      playExerciseTickSound(isSoundEnabled, soundVolume);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, speedBpm, activeShape, wordList.length, isSoundEnabled, soundVolume, exercise.data?.words]);

  const activeWord = wordList[currentWordIndex] || 'Gelişim';
  const activeDotColor = exercise.data?.dotColor || '#C5A059';

  // Exact shape vertices definitions in 0..100 coordinate space
  const triangleVerts = direction === 'cw'
    ? [{ x: 50, y: 14 }, { x: 85, y: 82 }, { x: 15, y: 82 }]
    : [{ x: 50, y: 14 }, { x: 15, y: 82 }, { x: 85, y: 82 }];

  const starBase = [
    { x: 50, y: 14 }, { x: 59, y: 36 }, { x: 82, y: 36 }, { x: 63, y: 50 },
    { x: 70, y: 74 }, { x: 50, y: 60 }, { x: 30, y: 74 }, { x: 37, y: 50 },
    { x: 18, y: 36 }, { x: 41, y: 36 }
  ];
  const starVerts = direction === 'cw' ? starBase : [...starBase].reverse();

  const squareVerts = direction === 'cw'
    ? [{ x: 18, y: 18 }, { x: 82, y: 18 }, { x: 82, y: 82 }, { x: 18, y: 82 }]
    : [{ x: 18, y: 18 }, { x: 18, y: 82 }, { x: 82, y: 82 }, { x: 82, y: 18 }];

  // Compute Active Focal Bead Position (x: %, y: %)
  let posX = 50;
  let posY = 50;

  if (activeShape === 'circle') {
    const stepsPerLoop = 36;
    const t = ((stepIndex % stepsPerLoop) / stepsPerLoop) * Math.PI * 2 * (direction === 'cw' ? 1 : -1) - Math.PI / 2;
    posX = 50 + 34 * Math.cos(t);
    posY = 50 + 32 * Math.sin(t);
  } else if (activeShape === 'triangle') {
    const totalSteps = 30;
    const stepMod = stepIndex % totalSteps;
    const segIndex = Math.floor(stepMod / 10);
    const frac = (stepMod % 10) / 10;
    const vCurr = triangleVerts[segIndex];
    const vNext = triangleVerts[(segIndex + 1) % 3];
    posX = vCurr.x + (vNext.x - vCurr.x) * frac;
    posY = vCurr.y + (vNext.y - vCurr.y) * frac;
  } else if (activeShape === 'star') {
    const totalSteps = 40;
    const stepMod = stepIndex % totalSteps;
    const segIndex = Math.floor(stepMod / 4);
    const frac = (stepMod % 4) / 4;
    const pCurr = starVerts[segIndex];
    const pNext = starVerts[(segIndex + 1) % 10];
    posX = pCurr.x + (pNext.x - pCurr.x) * frac;
    posY = pCurr.y + (pNext.y - pCurr.y) * frac;
  } else if (activeShape === 'square') {
    const totalSteps = 32;
    const stepMod = stepIndex % totalSteps;
    const segIndex = Math.floor(stepMod / 8);
    const frac = (stepMod % 8) / 8;
    const cCurr = squareVerts[segIndex];
    const cNext = squareVerts[(segIndex + 1) % 4];
    posX = cCurr.x + (cNext.x - cCurr.x) * frac;
    posY = cCurr.y + (cNext.y - cCurr.y) * frac;
  } else if (activeShape === 'infinity' || activeShape === 'infinity-loop') {
    const totalSteps = 36;
    const t = ((stepIndex % totalSteps) / totalSteps) * Math.PI * 2 * (direction === 'cw' ? 1 : -1);
    posX = 50 + 34 * Math.sin(t);
    posY = 50 + 22 * Math.sin(t) * Math.cos(t);
  } else if (activeShape === 'horizontal-dot') {
    posX = (stepIndex % 2 === 0) ? 15 : 85;
    posY = 50;
  } else if (activeShape === 'vertical-dot') {
    posX = 50;
    posY = (stepIndex % 2 === 0) ? 18 : 82;
  } else if (activeShape === 'corner-jump' || activeShape === 'corner') {
    const corners = [
      { x: 15, y: 18 }, { x: 85, y: 18 }, { x: 85, y: 82 }, { x: 15, y: 82 }, { x: 50, y: 50 }
    ];
    const c = corners[stepIndex % 5];
    posX = c.x;
    posY = c.y;
  } else if (activeShape === 'zigzag') {
    const points = [
      { x: 15, y: 18 }, { x: 85, y: 18 }, { x: 15, y: 50 }, { x: 85, y: 50 }, { x: 15, y: 82 }, { x: 85, y: 82 }
    ];
    const p = points[stepIndex % 6];
    posX = p.x;
    posY = p.y;
  } else if (activeShape === 'spiral') {
    const stepMod = stepIndex % 24;
    const progress = stepMod < 12 ? stepMod / 12 : (24 - stepMod) / 12;
    const radius = 6 + progress * 32;
    const angle = stepMod * (Math.PI / 3);
    posX = Math.min(88, Math.max(12, 50 + radius * Math.cos(angle)));
    posY = Math.min(85, Math.max(15, 50 + (radius * 0.75) * Math.sin(angle)));
  }

  // Pre-generate Infinity SVG path string
  const infinityD = Array.from({ length: 60 }).map((_, i) => {
    const t = (i / 60) * Math.PI * 2;
    const x = (50 + 34 * Math.sin(t)).toFixed(1);
    const y = (50 + 22 * Math.sin(t) * Math.cos(t)).toFixed(1);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ') + ' Z';

  // Helper to render edge arrows along polygon/star/square edges
  const renderEdgeArrows = (verts: { x: number; y: number }[]) => {
    return verts.map((vCurr, i) => {
      const vNext = verts[(i + 1) % verts.length];
      const mx = (vCurr.x + vNext.x) / 2;
      const my = (vCurr.y + vNext.y) / 2;
      const angle = Math.atan2(vNext.y - vCurr.y, vNext.x - vCurr.x) * (180 / Math.PI);
      return (
        <g key={i} transform={`translate(${mx}, ${my}) rotate(${angle})`}>
          <polygon points="-2.5,-2 2.5,0 -2.5,2" fill={activeDotColor} />
        </g>
      );
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 text-center select-none flex-1 flex flex-col justify-center">
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-[#C5A059] bg-[#FAF9F6] px-3 py-1 border border-[#C5A059]/30 uppercase tracking-widest inline-block">
          👁️ ŞEKİLLER & OKLARLA GÖZ TAKİP EGZERSİZİ
        </span>
        <h4 className="font-serif font-bold text-lg text-[#2D2D2D]">{exercise.title}</h4>
        <p className="text-xs text-stone-500">
          Oklar yönünde harf/kelime noktasını gözlerinizle kesintisiz takip edin.
        </p>
      </div>

      {/* Interactive Shape Selector Bar */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 bg-stone-100 p-2 border border-stone-200">
        {[
          { id: 'circle', label: '🔵 Daire' },
          { id: 'triangle', label: '🔺 Üçgen' },
          { id: 'star', label: '⭐ Yıldız' },
          { id: 'square', label: '⬛ Kare' },
          { id: 'infinity', label: '♾️ Sonsuzluk' },
          { id: 'zigzag', label: '⚡ Zikzak' },
          { id: 'corner', label: '📐 Köşeler' },
          { id: 'horizontal-dot', label: '↔️ Yatay' },
          { id: 'vertical-dot', label: '↕️ Dikey' }
        ].map(s => (
          <button
            key={s.id}
            onClick={() => {
              setActiveShape(s.id);
              playExerciseClickSound(isSoundEnabled);
            }}
            className={`px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${
              activeShape === s.id || (activeShape === 'infinity-loop' && s.id === 'infinity')
                ? 'bg-[#2D2D2D] text-white border-[#2D2D2D] shadow-sm font-black'
                : 'bg-white text-stone-700 border-stone-300 hover:border-[#C5A059] hover:bg-stone-50'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Canvas Container */}
      <div className="h-[55vh] min-h-[360px] max-h-[600px] bg-[#FAF9F6] border border-stone-300 relative overflow-hidden shadow-inner rounded-none">
        {/* SVG Path & Arrow Visualization Layer */}
        <svg 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none" 
          className="absolute inset-0 w-full h-full pointer-events-none opacity-50 overflow-visible"
        >
          {/* 1. Daire (Circle) */}
          {activeShape === 'circle' && (
            <g>
              <ellipse cx="50" cy="50" rx="34" ry="32" fill="none" stroke={activeDotColor} strokeWidth="0.8" strokeDasharray="2 1.5" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const arrowX = 50 + 34 * Math.cos(rad);
                const arrowY = 50 + 32 * Math.sin(rad);
                const rotDeg = deg + (direction === 'cw' ? 90 : -90);
                return (
                  <g key={deg} transform={`translate(${arrowX}, ${arrowY}) rotate(${rotDeg})`}>
                    <polygon points="-2.5,-2 2.5,0 -2.5,2" fill={activeDotColor} />
                  </g>
                );
              })}
            </g>
          )}

          {/* 2. Üçgen (Triangle) */}
          {activeShape === 'triangle' && (
            <g>
              <polygon 
                points={triangleVerts.map(v => `${v.x},${v.y}`).join(' ')} 
                fill="none" 
                stroke={activeDotColor} 
                strokeWidth="0.8" 
                strokeDasharray="2 1.5" 
              />
              {renderEdgeArrows(triangleVerts)}
            </g>
          )}

          {/* 3. Yıldız (5-Point Star) */}
          {activeShape === 'star' && (
            <g>
              <polygon 
                points={starVerts.map(v => `${v.x},${v.y}`).join(' ')} 
                fill="none" 
                stroke={activeDotColor} 
                strokeWidth="0.8" 
                strokeDasharray="1.5 1" 
              />
              {renderEdgeArrows(starVerts)}
            </g>
          )}

          {/* 4. Kare (Square) */}
          {activeShape === 'square' && (
            <g>
              <polygon 
                points={squareVerts.map(v => `${v.x},${v.y}`).join(' ')} 
                fill="none" 
                stroke={activeDotColor} 
                strokeWidth="0.8" 
                strokeDasharray="2 1.5" 
              />
              {renderEdgeArrows(squareVerts)}
            </g>
          )}

          {/* 5. Sonsuzluk (Infinity) */}
          {(activeShape === 'infinity' || activeShape === 'infinity-loop') && (
            <g>
              <path
                d={infinityD}
                fill="none"
                stroke={activeDotColor}
                strokeWidth="0.8"
                strokeDasharray="2 1.5"
              />
              {[Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4].map((t, idx) => {
                const ax = 50 + 34 * Math.sin(t);
                const ay = 50 + 22 * Math.sin(t) * Math.cos(t);
                const dir = direction === 'cw' ? 1 : -1;
                const dx = 34 * Math.cos(t) * dir;
                const dy = 22 * Math.cos(2 * t) * dir;
                const rot = Math.atan2(dy, dx) * (180 / Math.PI);
                return (
                  <g key={idx} transform={`translate(${ax}, ${ay}) rotate(${rot})`}>
                    <polygon points="-2.5,-2 2.5,0 -2.5,2" fill={activeDotColor} />
                  </g>
                );
              })}
            </g>
          )}

          {/* 6. Yatay (Horizontal) */}
          {activeShape === 'horizontal-dot' && (
            <g>
              <line x1="15" y1="50" x2="85" y2="50" stroke={activeDotColor} strokeWidth="0.8" strokeDasharray="2 1.5" />
              <g transform="translate(18, 50) rotate(180)"><polygon points="-2.5,-2 2.5,0 -2.5,2" fill={activeDotColor} /></g>
              <g transform="translate(82, 50) rotate(0)"><polygon points="-2.5,-2 2.5,0 -2.5,2" fill={activeDotColor} /></g>
            </g>
          )}

          {/* 7. Dikey (Vertical) */}
          {activeShape === 'vertical-dot' && (
            <g>
              <line x1="50" y1="18" x2="50" y2="82" stroke={activeDotColor} strokeWidth="0.8" strokeDasharray="2 1.5" />
              <g transform="translate(50, 20) rotate(-90)"><polygon points="-2.5,-2 2.5,0 -2.5,2" fill={activeDotColor} /></g>
              <g transform="translate(50, 80) rotate(90)"><polygon points="-2.5,-2 2.5,0 -2.5,2" fill={activeDotColor} /></g>
            </g>
          )}

          {/* 8. Zikzak (Zigzag) */}
          {activeShape === 'zigzag' && (
            <g>
              <polyline points="15,18 85,18 15,50 85,50 15,82 85,82" fill="none" stroke={activeDotColor} strokeWidth="0.8" strokeDasharray="2 1.5" />
              {renderEdgeArrows([
                { x: 15, y: 18 }, { x: 85, y: 18 }, { x: 15, y: 50 }, { x: 85, y: 50 }, { x: 15, y: 82 }, { x: 85, y: 82 }
              ])}
            </g>
          )}

          {/* 9. Köşeler (Corners) */}
          {(activeShape === 'corner' || activeShape === 'corner-jump') && (
            <g>
              <rect x="15" y="18" width="70" height="64" fill="none" stroke={activeDotColor} strokeWidth="0.8" strokeDasharray="2 1.5" />
              <line x1="15" y1="18" x2="85" y2="82" stroke={activeDotColor} strokeWidth="0.5" strokeDasharray="1 1" />
              <line x1="85" y1="18" x2="15" y2="82" stroke={activeDotColor} strokeWidth="0.5" strokeDasharray="1 1" />
            </g>
          )}
        </svg>

        {/* Floating Active Target Bead & Word Badge */}
        <div 
          className="absolute transition-all duration-150 ease-out -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10 pointer-events-none"
          style={{ left: `${posX}%`, top: `${posY}%` }}
        >
          <div 
            className="w-9 h-9 rounded-full flex items-center justify-center shadow-xl border-2 border-white ring-4 ring-amber-400/60 mb-1"
            style={{ backgroundColor: activeDotColor }}
          >
            <div className="w-3 h-3 rounded-full bg-white animate-ping" />
          </div>
          <div className="bg-[#2D2D2D] text-white px-3.5 py-1 shadow-2xl border border-[#C5A059] flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-serif font-black text-lg tracking-wide text-amber-300">{activeWord}</span>
          </div>
        </div>
      </div>

      {/* Speed & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-50 p-4 border border-stone-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsPlaying(!isPlaying);
              playExerciseClickSound(isSoundEnabled);
            }}
            className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer flex items-center gap-2 ${
              isPlaying ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#2D2D2D] hover:bg-[#C5A059]'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'Duraklat' : 'Egzersizi Başlat'}</span>
          </button>

          <button
            onClick={() => {
              setDirection(prev => prev === 'cw' ? 'ccw' : 'cw');
              playExerciseClickSound(isSoundEnabled);
            }}
            className="px-4 py-2.5 bg-white border border-stone-300 hover:border-[#C5A059] text-stone-800 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RotateCw className={`w-3.5 h-3.5 ${direction === 'ccw' ? 'rotate-180' : ''}`} />
            <span>{direction === 'cw' ? 'Saat Yönü 🔄' : 'Ters Yön ↩️'}</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-stone-600">Tempo (BPM):</span>
          <input 
            type="range"
            min="60"
            max="500"
            step="10"
            value={speedBpm}
            onChange={(e) => setSpeedBpm(Number(e.target.value))}
            className="w-32 accent-[#C5A059] cursor-pointer"
          />
          <span className="font-mono font-bold text-sm text-[#C5A059]">{speedBpm} BPM</span>
        </div>

        <button
          onClick={() => onCompleteResult(exercise.targetWpm || 300, 100, 30)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          Tamamla & Puanla
        </button>
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
function OkumaMetniRunner({ exercise, isSoundEnabled, elapsedSec = 0, onCompleteResult }: any) {
  const isRSVP = exercise.data?.type === 'rsvp';
  const words = exercise.data?.words || TURKISH_WORD_POOL;
  const [wordIdx, setWordIdx] = useState(0);
  const [isPlayingRSVP, setIsPlayingRSVP] = useState(false);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

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
    const wordCount = exercise.data?.wordCount || 120;
    const finalSec = Math.max(elapsedSec, 1);
    const wpm = Math.round((wordCount / finalSec) * 60);

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
        /* Full Passage Display */
        <div className="bg-white border border-[#2D2D2D]/15 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center gap-2 text-xs text-[#C5A059] font-extrabold uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-[#C5A059]" />
              <span>Anlayarak Okuma Metni</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-stone-500 bg-stone-100 px-2.5 py-1 border border-stone-200">
              {exercise.data?.wordCount || 120} Kelime
            </span>
          </div>

          {/* Passage Text */}
          <p className="text-[#2D2D2D] text-base sm:text-lg leading-relaxed font-serif p-5 sm:p-6 bg-[#FAF9F6] border border-stone-200 shadow-inner">
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

            </div>
          )}

          <button
            onClick={() => {
              handleFinishReadingPassage();
            }}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Okuduğumu Anladım ve Testi Tamamla</span>
          </button>
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
    { name: 'KIRMIZI', colorHex: '#EF4444', bgClass: 'bg-red-600 hover:bg-red-700' },
    { name: 'MAVİ', colorHex: '#3B82F6', bgClass: 'bg-blue-600 hover:bg-blue-700' },
    { name: 'YEŞİL', colorHex: '#22C55E', bgClass: 'bg-emerald-600 hover:bg-emerald-700' },
    { name: 'PEMBE', colorHex: '#EC4899', bgClass: 'bg-pink-500 hover:bg-pink-600' },
    { name: 'MOR', colorHex: '#A855F7', bgClass: 'bg-purple-600 hover:bg-purple-700' },
    { name: 'SİYAH', colorHex: '#000000', bgClass: 'bg-stone-900 hover:bg-black' },
  ];

  const STROOP_TOTAL_LIMIT = 40;

  const [stroopSequence, setStroopSequence] = useState<{ word: string; inkIndex: number }[]>([]);
  const [stroopIndex, setStroopIndex] = useState(0);
  const [stroopScore, setStroopScore] = useState(0);
  const [stroopTotal, setStroopTotal] = useState(0);
  const [stroopFeedback, setStroopFeedback] = useState('');
  const [stroopCompleted, setStroopCompleted] = useState(false);

  // Generate a fresh randomized sequence of 40 items every time test starts/restarts
  const generateNewStroopSequence = useCallback(() => {
    const sequence: { word: string; inkIndex: number }[] = [];
    for (let i = 0; i < STROOP_TOTAL_LIMIT; i++) {
      const wordObj = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
      let inkIdx = Math.floor(Math.random() * COLOR_PALETTE.length);
      // Ensure conflict 80% of the time for optimal challenge
      if (COLOR_PALETTE[inkIdx].name === wordObj.name && Math.random() > 0.2) {
        inkIdx = (inkIdx + 1) % COLOR_PALETTE.length;
      }
      sequence.push({ word: wordObj.name, inkIndex: inkIdx });
    }
    setStroopSequence(sequence);
    setStroopIndex(0);
    setStroopScore(0);
    setStroopTotal(0);
    setStroopFeedback('');
    setStroopCompleted(false);
  }, []);

  useEffect(() => {
    if (type === 'stroop') {
      generateNewStroopSequence();
    }
  }, [type, generateNewStroopSequence]);

  const handleStroopColorAnswer = (selectedColorName: string) => {
    if (stroopCompleted || stroopSequence.length === 0) return;

    playExerciseClickSound(isSoundEnabled);
    const currentItem = stroopSequence[stroopIndex];
    const correctInkName = COLOR_PALETTE[currentItem.inkIndex].name;
    const isCorrect = selectedColorName === correctInkName;

    const newTotal = stroopTotal + 1;
    const newScore = isCorrect ? stroopScore + 1 : stroopScore;

    setStroopTotal(newTotal);
    if (isCorrect) {
      setStroopScore(newScore);
      setStroopFeedback('✅ Doğru! (+1 Puan)');
    } else {
      setStroopFeedback(`❌ Hata! Doğru Renk: ${correctInkName}`);
    }

    if (newTotal >= STROOP_TOTAL_LIMIT) {
      setStroopCompleted(true);
      playExerciseSuccessSound(isSoundEnabled);
      const acc = Math.round((newScore / STROOP_TOTAL_LIMIT) * 100);
      onCompleteResult(320, acc, 35);
    } else {
      setStroopIndex(prev => prev + 1);
    }
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
              STROOP RENK ÇELİŞKİ DİKKAT TESTİ (40 KELİME)
            </span>
            <p className="text-stone-500 text-xs font-bold pt-1">
              YAZILAN KELİME NEYİ İŞARET EDERSE ETSİN, SADECE <span className="text-rose-600 font-extrabold underline">MÜREKKEP RENGİNİ</span> SEÇİN!
            </p>
          </div>

          {/* Active Stroop Target Word */}
          <div className="py-8 bg-[#FAF9F6] border border-stone-200 shadow-inner flex flex-col items-center justify-center gap-2">
            {stroopSequence.length > 0 && stroopIndex < stroopSequence.length ? (
              <span 
                className="font-black text-4xl sm:text-5xl font-serif tracking-widest transition-all duration-100 select-none"
                style={{ color: COLOR_PALETTE[stroopSequence[stroopIndex].inkIndex].colorHex }}
              >
                {stroopSequence[stroopIndex].word}
              </span>
            ) : (
              <span className="font-bold text-emerald-600 text-lg">Test Tamamlandı! 🎉</span>
            )}
            <span className="text-[11px] font-mono font-bold text-stone-400">
              Soru: {Math.min(stroopTotal + 1, STROOP_TOTAL_LIMIT)} / {STROOP_TOTAL_LIMIT}
            </span>
          </div>

          {/* Color Answer Buttons (6 Colors: Kırmızı, Mavi, Yeşil, Pembe, Mor, Siyah) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {COLOR_PALETTE.map((item) => (
              <button 
                key={item.name}
                disabled={stroopCompleted}
                onClick={() => handleStroopColorAnswer(item.name)}
                className={`py-3.5 px-4 text-white font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow flex items-center justify-center gap-1.5 ${item.bgClass} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <span>{item.name}</span>
              </button>
            ))}
          </div>

          {/* Stroop Score & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-stone-200 text-xs font-bold">
            <div className="text-stone-600">
              Doğru: <span className="text-emerald-600 font-mono text-sm font-black">{stroopScore}</span> / {STROOP_TOTAL_LIMIT}
            </div>

            {stroopFeedback && (
              <span className="text-amber-700 bg-amber-50 px-2.5 py-1 border border-amber-200 text-[11px]">
                {stroopFeedback}
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={generateNewStroopSequence}
                className="px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white uppercase text-[10px] tracking-wider transition-all cursor-pointer flex items-center gap-1"
                title="Yeni rastgele kelimelerle testi tekrar başlat"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Rastgele Yeniden Başlat</span>
              </button>

              <button
                onClick={() => {
                  const acc = stroopTotal > 0 ? Math.round((stroopScore / stroopTotal) * 100) : 100;
                  onCompleteResult(320, acc, 35);
                }}
                className="px-3.5 py-2 bg-[#C5A059] hover:bg-[#b08d4b] text-white uppercase text-[10px] tracking-wider shadow cursor-pointer"
              >
                Tamamla
              </button>
            </div>
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

// Helper to normalize Turkish text for accurate string comparison (e.g. i/İ, ı/I, space handling)
function normalizeTurkishText(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .replace(/\s+/g, '')
    .replace(/i/g, 'İ')
    .replace(/ı/g, 'I')
    .replace(/ğ/g, 'Ğ')
    .replace(/ü/g, 'Ü')
    .replace(/ş/g, 'Ş')
    .replace(/ö/g, 'Ö')
    .replace(/ç/g, 'Ç')
    .toLocaleUpperCase('tr-TR');
}

function checkTurkishWordMatch(input: string, expected: string): boolean {
  const normIn = normalizeTurkishText(input);
  const normExp = normalizeTurkishText(expected);
  if (normIn === normExp) return true;
  // Fallback tolerance for English keyboard I / İ variations
  if (normIn.replace(/I/g, 'İ') === normExp.replace(/I/g, 'İ')) return true;
  if (normIn.replace(/İ/g, 'I') === normExp.replace(/İ/g, 'I')) return true;
  return false;
}

// Helper to dynamically shuffle letters of a target word for anagram tests
function shuffleLetters(wordStr: string): string {
  if (!wordStr) return '';
  const cleanWord = wordStr.replace(/\s+/g, '');
  const chars = cleanWord.split('');
  if (chars.length <= 1) return chars.join(' ');
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  // Ensure it's not identical to the target answer
  if (chars.join('') === cleanWord) {
    [chars[0], chars[chars.length - 1]] = [chars[chars.length - 1], chars[0]];
  }
  return chars.join(' ');
}

// Component for Akademik, Şehir & Hayvan Kelime Matris Bulmacası & Interactive Word Search Grid
function WordSearchGrid({ targetWords, isSoundEnabled, onCompleteResult }: { targetWords: string[]; isSoundEnabled: boolean; onCompleteResult: any }) {
  const [activeWords, setActiveWords] = useState<string[]>(targetWords && targetWords.length > 0 ? targetWords : ['ANKARA', 'İSTANBUL', 'İZMİR', 'BURSA', 'KONYA', 'ANTALYA']);
  const [activeTheme, setActiveTheme] = useState<string>('custom');

  const [gridData, setGridData] = useState(() => generateWordSearchGrid(activeWords, 10, 10));
  const [selectedCells, setSelectedCells] = useState<{ r: number; c: number }[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());

  const switchTheme = (themeId: string, wordList: string[]) => {
    setActiveTheme(themeId);
    setActiveWords(wordList);
    setGridData(generateWordSearchGrid(wordList, 10, 10));
    setSelectedCells([]);
    setFoundWords([]);
    setFoundCells(new Set());
    playExerciseClickSound(isSoundEnabled);
  };

  const resetMatrix = () => {
    setGridData(generateWordSearchGrid(activeWords, 10, 10));
    setSelectedCells([]);
    setFoundWords([]);
    setFoundCells(new Set());
  };

  const handleCellClick = (r: number, c: number) => {
    const key = `${r}-${c}`;
    
    // Toggle cell selection
    const existingIndex = selectedCells.findIndex(cell => cell.r === r && cell.c === c);
    let newSelected: { r: number; c: number }[];
    
    if (existingIndex >= 0) {
      newSelected = selectedCells.filter((_, idx) => idx !== existingIndex);
    } else {
      newSelected = [...selectedCells, { r, c }];
    }
    setSelectedCells(newSelected);
    playExerciseClickSound(isSoundEnabled);

    // Form current string
    const currentStr = newSelected.map(cell => gridData.grid[cell.r][cell.c]).join('');
    
    // Check if currentStr matches any unfound target word
    const matchedWord = activeWords.find(w => {
      const cleanW = w.toUpperCase().replace(/\s+/g, '');
      return (cleanW === currentStr || cleanW.split('').reverse().join('') === currentStr) && !foundWords.includes(cleanW);
    });

    if (matchedWord) {
      const cleanW = matchedWord.toUpperCase().replace(/\s+/g, '');
      playExerciseSuccessSound(isSoundEnabled);
      const updatedFoundWords = [...foundWords, cleanW];
      setFoundWords(updatedFoundWords);

      // Add cells to foundCells
      const newFoundCells = new Set(foundCells);
      newSelected.forEach(cell => newFoundCells.add(`${cell.r}-${cell.c}`));
      setFoundCells(newFoundCells);
      setSelectedCells([]);

      if (updatedFoundWords.length >= activeWords.length) {
        setTimeout(() => {
          onCompleteResult(360, 100, 30);
        }, 1200);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl sm:max-w-5xl lg:max-w-6xl mx-auto bg-white p-6 sm:p-8 border border-[#2D2D2D]/15 shadow-md space-y-6 text-center">
      <div className="space-y-1">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C5A059] bg-[#C5A059]/10 px-3 py-1 border border-[#C5A059]/30 inline-block">
          🧩 ŞEHİR & HAYVAN KELİME MATRİS BULMACASI
        </span>
        <h3 className="font-serif font-bold text-xl text-[#2D2D2D] pt-1">
          Harf Matrisindeki Gizli Sözcükleri Bulun
        </h3>
        <p className="text-xs text-stone-500">
          Aşağıdaki temalardan dilediğinizi seçip matristeki gizli kelimeleri gözlerinizle tarayın.
        </p>
      </div>

      {/* Theme Selection Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 bg-stone-100 p-2.5 border border-stone-200">
        <button
          onClick={() => switchTheme('countries', ['TÜRKİYE', 'ALMANYA', 'FRANSA', 'İTALYA', 'JAPONYA', 'KANADA', 'MISIR', 'BREZİLYA'])}
          className={`px-3.5 py-1.5 text-xs font-bold border cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTheme === 'countries' ? 'bg-[#2D2D2D] text-white border-[#2D2D2D] font-black shadow-sm' : 'bg-white text-stone-800 border-stone-300 hover:border-[#C5A059]'
          }`}
        >
          <span>🌍 Ülkeler & Başkentler</span>
        </button>

        <button
          onClick={() => switchTheme('nature', ['ORMAN', 'ŞELALE', 'YANARDAĞ', 'OKYANUS', 'YAĞMUR', 'ATMOSFER', 'NEHİR', 'GÜNEŞ'])}
          className={`px-3.5 py-1.5 text-xs font-bold border cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTheme === 'nature' ? 'bg-[#2D2D2D] text-white border-[#2D2D2D] font-black shadow-sm' : 'bg-white text-stone-800 border-stone-300 hover:border-[#C5A059]'
          }`}
        >
          <span>🌿 Doğa & Çevre</span>
        </button>

        <button
          onClick={() => switchTheme('professions', ['MÜHENDİS', 'MİMAR', 'DOKTOR', 'YAZAR', 'PİLOT', 'SANATÇI', 'AVUKAT', 'HAKİM'])}
          className={`px-3.5 py-1.5 text-xs font-bold border cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTheme === 'professions' ? 'bg-[#2D2D2D] text-white border-[#2D2D2D] font-black shadow-sm' : 'bg-white text-stone-800 border-stone-300 hover:border-[#C5A059]'
          }`}
        >
          <span>💼 Meslekler & Kariyer</span>
        </button>

        <button
          onClick={() => switchTheme('subjects', ['MATEMATİK', 'FİZİK', 'KİMYA', 'BİYOLOJİ', 'TARİH', 'EDEBİYAT', 'FELSEFE', 'GEOMETRİ'])}
          className={`px-3.5 py-1.5 text-xs font-bold border cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTheme === 'subjects' ? 'bg-[#2D2D2D] text-white border-[#2D2D2D] font-black shadow-sm' : 'bg-white text-stone-800 border-stone-300 hover:border-[#C5A059]'
          }`}
        >
          <span>📚 Dersler & Konular</span>
        </button>

        <button
          onClick={() => switchTheme('city-tr', ['ANKARA', 'İSTANBUL', 'İZMİR', 'BURSA', 'KONYA', 'ANTALYA', 'ADANA', 'TRABZON'])}
          className={`px-3.5 py-1.5 text-xs font-bold border cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTheme === 'city-tr' ? 'bg-[#2D2D2D] text-white border-[#2D2D2D] font-black shadow-sm' : 'bg-white text-stone-800 border-stone-300 hover:border-[#C5A059]'
          }`}
        >
          <span>🏙️ Türkiye Şehirleri</span>
        </button>

        <button
          onClick={() => switchTheme('city-world', ['PARİS', 'LONDRA', 'TOKYO', 'ROMA', 'BERLİN', 'MADRİD', 'VİYANA', 'KAHİRE'])}
          className={`px-3.5 py-1.5 text-xs font-bold border cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTheme === 'city-world' ? 'bg-[#2D2D2D] text-white border-[#2D2D2D] font-black shadow-sm' : 'bg-white text-stone-800 border-stone-300 hover:border-[#C5A059]'
          }`}
        >
          <span>✈️ Dünya Şehirleri</span>
        </button>

        <button
          onClick={() => switchTheme('animals-cute', ['KEDİ', 'KÖPEK', 'TAVŞAN', 'YUNUS', 'PENGUEN', 'KUNDUZ', 'KARTAL', 'KELEBEK'])}
          className={`px-3.5 py-1.5 text-xs font-bold border cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTheme === 'animals-cute' ? 'bg-[#2D2D2D] text-white border-[#2D2D2D] font-black shadow-sm' : 'bg-white text-stone-800 border-stone-300 hover:border-[#C5A059]'
          }`}
        >
          <span>🐾 Sevimli Hayvanlar</span>
        </button>

        <button
          onClick={() => switchTheme('animals-wild', ['ASLAN', 'KAPLAN', 'ZÜRAFA', 'LEOPAR', 'BUFALO', 'FLAMİNGO', 'KANGURU', 'AHTAPOT'])}
          className={`px-3.5 py-1.5 text-xs font-bold border cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTheme === 'animals-wild' ? 'bg-[#2D2D2D] text-white border-[#2D2D2D] font-black shadow-sm' : 'bg-white text-stone-800 border-stone-300 hover:border-[#C5A059]'
          }`}
        >
          <span>🦁 Yabani Hayvanlar</span>
        </button>

        <button
          onClick={() => switchTheme('science', ['ROBOTİK', 'GENETİK', 'KUANTUM', 'YAZILIM', 'ATOM', 'NÖROLOJİ', 'SİBER', 'BİYOLOJİ'])}
          className={`px-3.5 py-1.5 text-xs font-bold border cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTheme === 'science' ? 'bg-[#2D2D2D] text-white border-[#2D2D2D] font-black shadow-sm' : 'bg-white text-stone-800 border-stone-300 hover:border-[#C5A059]'
          }`}
        >
          <span>🔬 Bilim & Teknoloji</span>
        </button>

        <button
          onClick={() => switchTheme('academic', targetWords && targetWords.length > 0 ? targetWords : ['PARAGRAF', 'MUHAKEME', 'SENTEZ', 'ANALİZ', 'DERECE', 'AKIL'])}
          className={`px-3.5 py-1.5 text-xs font-bold border cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTheme === 'academic' || activeTheme === 'custom' ? 'bg-[#2D2D2D] text-white border-[#2D2D2D] font-black shadow-sm' : 'bg-white text-stone-800 border-stone-300 hover:border-[#C5A059]'
          }`}
        >
          <span>🎓 Akademik Sözcükler</span>
        </button>
      </div>

      {/* Target Words Badges */}
      <div className="bg-[#FAF9F6] p-4 border border-stone-200 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-stone-600 border-b pb-2">
          <span>BULUNACAK HEDEF SÖZCÜKLER</span>
          <span className="font-mono text-[#C5A059] font-black text-sm">
            {foundWords.length} / {activeWords.length} Bulundu
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {activeWords.map((tw) => {
            const cleanW = tw.toUpperCase().replace(/\s+/g, '');
            const isFound = foundWords.includes(cleanW);
            return (
              <span
                key={tw}
                className={`px-3 py-1.5 text-xs font-bold font-mono tracking-wider transition-all border flex items-center gap-1.5 ${
                  isFound
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm font-black scale-105'
                    : 'bg-white text-stone-800 border-stone-300'
                }`}
              >
                <span>{isFound ? '✅' : '🎯'}</span>
                <span>{cleanW}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-10 gap-1 sm:gap-2 bg-[#FAF9F6] p-3 sm:p-6 border border-stone-300 max-w-2xl mx-auto shadow-inner">
        {gridData.grid.map((row, r) =>
          row.map((char, c) => {
            const key = `${r}-${c}`;
            const isSelected = selectedCells.some(cell => cell.r === r && cell.c === c);
            const isFoundCell = foundCells.has(key);

            return (
              <button
                key={key}
                onClick={() => handleCellClick(r, c)}
                className={`h-9 sm:h-12 w-full font-mono font-black text-sm sm:text-lg border transition-all cursor-pointer rounded-none select-none flex items-center justify-center ${
                  isFoundCell
                    ? 'bg-emerald-600 text-white border-emerald-700 font-extrabold shadow-sm'
                    : isSelected
                    ? 'bg-[#C5A059] text-white border-[#9A7B39] scale-105 shadow-md font-extrabold animate-pulse'
                    : 'bg-white text-stone-800 border-stone-200 hover:border-[#C5A059] hover:bg-[#C5A059]/10'
                }`}
              >
                {char}
              </button>
            );
          })
        )}
      </div>

      {/* Selected Sequence Status & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200 text-xs font-bold">
        <div className="text-stone-700 font-mono">
          Seçilen Harfler: <span className="text-[#C5A059] font-black text-sm bg-stone-100 px-2.5 py-1 border">{selectedCells.map(c => gridData.grid[c.r][c.c]).join('') || '—'}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedCells([])}
            className="px-3.5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 uppercase text-[11px] tracking-wider transition-all cursor-pointer"
          >
            Seçimi Temizle
          </button>
          <button
            onClick={resetMatrix}
            className="px-3.5 py-2 bg-stone-800 hover:bg-stone-900 text-white uppercase text-[11px] tracking-wider transition-all cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Yeniden Karıştır</span>
          </button>
          <button
            onClick={() => {
              const acc = Math.round((foundWords.length / targetWords.length) * 100);
              onCompleteResult(350, acc, 30);
            }}
            className="px-4 py-2 bg-[#C5A059] hover:bg-[#b08d4b] text-white uppercase text-[11px] tracking-wider shadow cursor-pointer"
          >
            Egzersizi Tamamla & Puanla
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 5. BULMACA RUNNER (ANAGRAM, EŞ ANLAM, ZİT ANLAM, EKSİK HARF, MATRİS AVI)
// =========================================================================
function BulmacaRunner({ exercise, isSoundEnabled, onCompleteResult }: any) {
  const type = exercise.data?.type || 'word-search';

  // ---------------- ANAGRAM ENGINE ----------------
  const anagramWords: { scrambled?: string; answer: string; hint: string }[] = exercise.data?.words || [
    { answer: 'PARAGRAF', hint: 'Metin bölümü' },
    { answer: 'MANTIK', hint: 'Akıl yürütme' }
  ];
  const [anagramIndex, setAnagramIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [scrambledLetters, setScrambledLetters] = useState('');
  const [anagramFeedback, setAnagramFeedback] = useState<{ isCorrect: boolean; msg: string } | null>(null);
  const [anagramScore, setAnagramScore] = useState(0);

  useEffect(() => {
    if (type === 'anagram' && anagramWords[anagramIndex]) {
      const currentObj = anagramWords[anagramIndex];
      const targetWord = currentObj.answer || currentObj.scrambled?.replace(/\s+/g, '') || '';
      setScrambledLetters(shuffleLetters(targetWord));
      setUserInput('');
      setAnagramFeedback(null);
    }
  }, [type, anagramIndex, exercise]);

  const handleAnagramCheck = () => {
    if (!anagramWords[anagramIndex] || anagramFeedback !== null) return;
    const currentObj = anagramWords[anagramIndex];
    const expected = currentObj.answer || currentObj.scrambled?.replace(/\s+/g, '') || '';

    if (checkTurkishWordMatch(userInput, expected)) {
      setAnagramScore(prev => prev + 1);
      setAnagramFeedback({ isCorrect: true, msg: '🎉 Doğru Cevap! Tebrikler! (+1 Puan)' });
      playExerciseSuccessSound(isSoundEnabled);
    } else {
      setAnagramFeedback({ 
        isCorrect: false, 
        msg: `❌ Yanlış Cevap! Doğru Cevap: "${expected.toLocaleUpperCase('tr-TR')}"` 
      });
      playExerciseClickSound(isSoundEnabled);
    }
  };

  const handleNextAnagram = () => {
    setUserInput('');
    setAnagramFeedback(null);
    if (anagramIndex + 1 < anagramWords.length) {
      setAnagramIndex(prev => prev + 1);
    } else {
      // Completed all anagrams!
      const finalAccuracy = Math.round((anagramScore / anagramWords.length) * 100);
      onCompleteResult(360, finalAccuracy, 30);
    }
  };

  // ---------------- WORD MATCH (EŞ ANLAM / ZİT ANLAM) ENGINE ----------------
  const matchPairs: { word: string; match: string }[] = exercise.data?.pairs || [
    { word: 'Hızlı', match: 'Yavaş' }
  ];
  const matchType = exercise.data?.matchType || 'antonym'; // 'antonym' or 'synonym'
  const [matchIndex, setMatchIndex] = useState(0);
  const [matchChoices, setMatchChoices] = useState<string[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [matchScore, setMatchScore] = useState(0);
  const [matchFeedback, setMatchFeedback] = useState<{ isCorrect: boolean; msg: string } | null>(null);

  // Generate 4 multiple choice options for current word pair
  const generateChoicesForPair = useCallback((idx: number) => {
    if (!matchPairs[idx]) return;
    const currentPair = matchPairs[idx];
    const correctAnswer = currentPair.match;

    // Collect distractors from other pairs or generic pool
    const allMatches = matchPairs.map(p => p.match).filter(m => m !== correctAnswer);
    const shuffledDistractors = allMatches.sort(() => Math.random() - 0.5).slice(0, 3);
    
    // Add default fillers if not enough distractors
    const backupFillers = ['Kelimeler', 'Sual', 'Anlam', 'Düşünce', 'Vasıf', 'Nitelik'];
    while (shuffledDistractors.length < 3) {
      const filler = backupFillers[Math.floor(Math.random() * backupFillers.length)];
      if (!shuffledDistractors.includes(filler) && filler !== correctAnswer) {
        shuffledDistractors.push(filler);
      }
    }

    const options = [correctAnswer, ...shuffledDistractors].sort(() => Math.random() - 0.5);
    setMatchChoices(options);
    setSelectedMatch(null);
    setMatchFeedback(null);
  }, [matchPairs]);

  useEffect(() => {
    if (type === 'word-match') {
      generateChoicesForPair(matchIndex);
    }
  }, [type, matchIndex, generateChoicesForPair]);

  const handleSelectChoice = (choice: string) => {
    if (selectedMatch !== null) return;
    setSelectedMatch(choice);
    const correctAnswer = matchPairs[matchIndex].match;

    if (choice === correctAnswer) {
      setMatchScore(prev => prev + 1);
      setMatchFeedback({ isCorrect: true, msg: '✅ DOĞRU CEVAP! (+1 Puan)' });
      playExerciseSuccessSound(isSoundEnabled);
    } else {
      setMatchFeedback({ 
        isCorrect: false, 
        msg: `❌ YANLIŞ CEVAP! Doğru Cevap: "${correctAnswer}"` 
      });
      playExerciseClickSound(isSoundEnabled);
    }
  };

  const handleNextMatch = () => {
    if (matchIndex + 1 < matchPairs.length) {
      setMatchIndex(prev => prev + 1);
    } else {
      // Finished all match items!
      const finalAccuracy = Math.round((matchScore / matchPairs.length) * 100);
      onCompleteResult(380, finalAccuracy, 25);
    }
  };

  // ---------------- WORD FILL ENGINE ----------------
  const fillItems: { word: string; masked: string }[] = exercise.data?.items || [
    { word: 'PARAGRAF', masked: 'P A _ A G R _ F' }
  ];
  const [fillIndex, setFillIndex] = useState(0);
  const [fillInput, setFillInput] = useState('');
  const [fillFeedback, setFillFeedback] = useState<{ isCorrect: boolean; msg: string } | null>(null);
  const [fillScore, setFillScore] = useState(0);

  const handleFillCheck = () => {
    if (!fillItems[fillIndex] || fillFeedback !== null) return;
    const expected = fillItems[fillIndex].word;

    if (checkTurkishWordMatch(fillInput, expected)) {
      setFillScore(prev => prev + 1);
      setFillFeedback({ isCorrect: true, msg: '🎉 Doğru Tamamladınız!' });
      playExerciseSuccessSound(isSoundEnabled);
    } else {
      setFillFeedback({ 
        isCorrect: false, 
        msg: `❌ Hatalı! Doğru Kelime: "${fillItems[fillIndex].word}"` 
      });
      playExerciseClickSound(isSoundEnabled);
    }
  };

  const handleNextFill = () => {
    if (fillIndex + 1 < fillItems.length) {
      setFillIndex(prev => prev + 1);
      setFillInput('');
      setFillFeedback(null);
    } else {
      const acc = Math.round((fillScore / fillItems.length) * 100);
      onCompleteResult(340, acc, 20);
    }
  };

  if (type === 'word-search' || type === 'word-matrix') {
    return (
      <WordSearchGrid
        targetWords={exercise.data?.targetWords || ['DERECE', 'PARAGRAF', 'YKS', 'ANALİZ', 'MANTIK', 'METOT', 'SENTEZ', 'ODAK']}
        isSoundEnabled={isSoundEnabled}
        onCompleteResult={onCompleteResult}
      />
    );
  }

  return (
    <div className="w-full max-w-4xl sm:max-w-5xl lg:max-w-6xl mx-auto bg-white p-6 sm:p-8 border border-[#2D2D2D]/15 text-center space-y-6 shadow-sm">
      
      {/* 1. ANAGRAM TEST */}
      {type === 'anagram' && anagramWords[anagramIndex] && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3 text-xs font-bold">
            <span className="text-[#C5A059] uppercase tracking-widest font-extrabold">
              Karışık Harf Anagram Testi
            </span>
            <span className="text-stone-500 font-mono bg-stone-100 px-2.5 py-1">
              Soru {anagramIndex + 1} / {anagramWords.length}
            </span>
          </div>

          <div className="bg-[#FAF9F6] p-6 border border-stone-200 shadow-inner space-y-3">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">HARFLERİ KARILI SÖZCÜK:</p>
            <p className="text-3xl font-black text-[#2D2D2D] tracking-[0.25em] font-mono select-none">
              {scrambledLetters}
            </p>
            {anagramWords[anagramIndex].hint && (
              <p className="text-xs text-[#C5A059] font-bold pt-1">
                İpucu: {anagramWords[anagramIndex].hint}
              </p>
            )}
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (anagramFeedback === null) handleAnagramCheck();
              else handleNextAnagram();
            }}
            className="space-y-4"
          >
            <input 
              type="text"
              value={userInput}
              disabled={anagramFeedback !== null}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Çözdüğünüz kelimeyi yazın..."
              autoFocus
              className="w-full px-4 py-3 bg-[#FAF9F6] border border-stone-300 text-base focus:border-[#C5A059] focus:outline-none uppercase font-bold text-center tracking-widest text-[#2D2D2D]"
            />

            {anagramFeedback === null ? (
              <button
                type="submit"
                className="w-full py-3.5 bg-[#2D2D2D] hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow"
              >
                Cevabı Kontrol Et ↵
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextAnagram}
                className="w-full py-3.5 bg-[#C5A059] hover:bg-[#b08d4b] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow flex items-center justify-center gap-2"
              >
                <span>{anagramIndex + 1 < anagramWords.length ? 'Sonraki Kelime ➔' : 'Egzersizi Tamamla 🏆'}</span>
              </button>
            )}

            {anagramFeedback && (
              <div className={`p-4 border text-xs font-bold text-center ${
                anagramFeedback.isCorrect 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                  : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}>
                {anagramFeedback.msg}
              </div>
            )}
          </form>
        </div>
      )}

      {/* 2. EŞ ANLAM / ZİT ANLAM TESTİ */}
      {type === 'word-match' && matchPairs[matchIndex] && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3 text-xs font-bold">
            <span className="text-[#C5A059] uppercase tracking-widest font-extrabold">
              {matchType === 'synonym' ? 'Eş Anlamlı Kelime Testi' : 'Zıt Anlamlı Kelime Testi'}
            </span>
            <span className="text-stone-500 font-mono bg-stone-100 px-2.5 py-1">
              Soru {matchIndex + 1} / {matchPairs.length}
            </span>
          </div>

          <div className="bg-[#FAF9F6] p-6 border border-stone-200 shadow-inner space-y-2">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {matchType === 'synonym' ? 'VERİLEN KELİMENİN EŞ ANLAMLISINI SEÇİN:' : 'VERİLEN KELİMENİN ZİT ANLAMLISINI SEÇİN:'}
            </p>
            <p className="text-3xl font-black text-[#2D2D2D] font-serif tracking-wide select-none">
              "{matchPairs[matchIndex].word}"
            </p>
          </div>

          {/* Multiple Choice Options */}
          <div className="grid grid-cols-2 gap-3">
            {matchChoices.map((choice, i) => {
              const isCorrectOpt = choice === matchPairs[matchIndex].match;
              const isSelected = selectedMatch === choice;

              let btnStyle = "bg-[#FAF9F6] text-[#2D2D2D] border-stone-300 hover:border-[#C5A059] hover:bg-[#C5A059]/10";
              if (selectedMatch !== null) {
                if (isCorrectOpt) {
                  btnStyle = "bg-emerald-600 text-white border-emerald-700 font-black scale-102 shadow-md";
                } else if (isSelected) {
                  btnStyle = "bg-rose-600 text-white border-rose-700 font-black";
                } else {
                  btnStyle = "bg-stone-100 text-stone-400 border-stone-200 opacity-40";
                }
              }

              return (
                <button
                  key={i}
                  disabled={selectedMatch !== null}
                  onClick={() => handleSelectChoice(choice)}
                  className={`py-3.5 px-4 text-sm font-bold border transition-all cursor-pointer rounded-none select-none flex items-center justify-center gap-2 ${btnStyle}`}
                >
                  {selectedMatch !== null && isCorrectOpt && <span>✅</span>}
                  {selectedMatch !== null && isSelected && !isCorrectOpt && <span>❌</span>}
                  <span>{choice}</span>
                </button>
              );
            })}
          </div>

          {matchFeedback && (
            <div className={`p-4 border text-xs font-bold text-center space-y-3 ${
              matchFeedback.isCorrect 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}>
              <p>{matchFeedback.msg}</p>

              <button
                onClick={handleNextMatch}
                className="w-full py-3 bg-[#2D2D2D] hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow"
              >
                {matchIndex + 1 < matchPairs.length ? 'Sonraki Soruya Geç ➔' : 'Sonuçları Gör ve Tamamla 🏆'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. EKSİK HARF TAMAMLAMA */}
      {type === 'word-fill' && fillItems[fillIndex] && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3 text-xs font-bold">
            <span className="text-[#C5A059] uppercase tracking-widest font-extrabold">
              Eksik Harf Tamamlama
            </span>
            <span className="text-stone-500 font-mono bg-stone-100 px-2.5 py-1">
              {fillIndex + 1} / {fillItems.length}
            </span>
          </div>

          <div className="bg-[#FAF9F6] p-6 border border-stone-200 shadow-inner space-y-2">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">NOKTALI HARFLERİ TAMAMLAYIN:</p>
            <p className="text-2xl font-black text-[#2D2D2D] tracking-widest font-mono">
              {fillItems[fillIndex].masked}
            </p>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (fillFeedback === null) handleFillCheck();
              else handleNextFill();
            }}
            className="space-y-4"
          >
            <input 
              type="text"
              value={fillInput}
              disabled={fillFeedback !== null}
              onChange={(e) => setFillInput(e.target.value)}
              placeholder="Tamamlanan tam kelimeyi yazın..."
              autoFocus
              className="w-full px-4 py-3 bg-[#FAF9F6] border border-stone-300 text-sm focus:border-[#C5A059] focus:outline-none uppercase font-bold text-center tracking-wider text-[#2D2D2D]"
            />

            {fillFeedback === null ? (
              <button
                type="submit"
                className="w-full py-3.5 bg-[#2D2D2D] hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow"
              >
                Cevabı Onayla
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextFill}
                className="w-full py-3.5 bg-[#C5A059] hover:bg-[#b08d4b] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow"
              >
                {fillIndex + 1 < fillItems.length ? 'Sonraki Soru ➔' : 'Egzersizi Tamamla 🏆'}
              </button>
            )}

            {fillFeedback && (
              <div className={`p-3.5 border text-xs font-bold ${
                fillFeedback.isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}>
                {fillFeedback.msg}
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
