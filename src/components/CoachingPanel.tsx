import React, { useState, useEffect } from 'react';
import { 
  X, User, Lock, Key, LogOut, CheckCircle2, AlertCircle, Plus, Trash2, Edit, Save, 
  Calendar, BookOpen, Clock, BarChart2, Award, Sparkles, Filter, RefreshCw, ChevronRight, 
  Search, Shield, GraduationCap, Check, FileText, Sliders, ArrowUpRight, TrendingUp, HeartPulse
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  StudentAccount, StudentExerciseLog, DailyStudyLog, MockExamLog 
} from '../types';
import { 
  dbGetStudents, dbAddStudent, dbUpdateStudent, dbDeleteStudent, DEFAULT_STUDENTS,
  dbGetStudentLogs, dbDeleteStudentLog,
  dbGetDailyStudyLogs, dbAddDailyStudyLog, dbUpdateDailyStudyLog, dbDeleteDailyStudyLog,
  dbGetMockExamLogs, dbAddMockExamLog, dbUpdateMockExamLog, dbDeleteMockExamLog,
  dbGetCurriculumProgress, dbSaveCurriculumProgress, dbAddStudentLog
} from '../lib/firebase';
import AnxietyControlPanel from './AnxietyControlPanel';

interface CoachingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSpeedReading?: () => void;
}

// =========================================================================
// CURRICULUM SUBJECTS & TOPICS BY GROUP
// =========================================================================
export const CURRICULUM_DATA: Record<string, { subject: string; topics: string[] }[]> = {
  'İLKOKUL': [
    {
      subject: 'Türkçe',
      topics: [
        'Okuduğunu Anlama & Metin Soruları',
        'Sözcükte Anlama & Eş/Zıt Anlamlılar',
        'Cümlede Anlama & Ana Fikir',
        'Yazım Kuralları & Büyük Harfler',
        'Noktalama İşaretleri',
        'Metin Türleri & Paragraf Yapısı'
      ]
    },
    {
      subject: 'Matematik',
      topics: [
        'Doğal Sayılar & Basamak Değeri',
        'Toplama ve Çıkarma İşlemleri',
        'Çarpma ve Bölme İşlemleri',
        'Kesirler ve Ondalık İfadeler',
        'Geometrik Şekiller ve Çevre/Alan',
        'Zaman ve Uzunluk Ölçme',
        'Veri Toplama ve Grafik Okuma'
      ]
    },
    {
      subject: 'Fen Bilimleri',
      topics: [
        'Yer Kabuğu ve Dünya’mızın Yapısı',
        'Canlılar Dünyası ve Besinlerimiz',
        'Kuvvetin Etkileri ve Mıknatıs',
        'Maddeyi Tanıyalım & Halleri',
        'Işık ve Ses Teknolojileri',
        'İnsan ve Çevre İlişkisi'
      ]
    },
    {
      subject: 'Sosyal Bilgiler',
      topics: [
        'Birey ve Toplum & Kimlik',
        'Kültür ve Mirasımız',
        'İnsanlar, Yerler ve Çevreler',
        'Bilim, Teknoloji ve Toplum',
        'Üretim, Dağıtım ve Tüketim',
        'Etkin Vatandaşlık'
      ]
    }
  ],
  'LGS': [
    {
      subject: 'Türkçe',
      topics: [
        'Fiilimsiler (Eylemsiler)',
        'Sözcükte ve Söz Gruplarında Anlama',
        'Cümlede Anlama ve Kavramlar',
        'Paragrafta Anlama ve Yapı',
        'Sözel Mantık ve Görsel Okuma',
        'Cümlenin Ögeleri',
        'Fiilde Çatı',
        'Cümle Türleri',
        'Yazım Kuralları ve Noktalama',
        'Anlatım Bozuklukları'
      ]
    },
    {
      subject: 'Matematik',
      topics: [
        'Çarpanlar ve Katlar (EBOB-EKOK)',
        'Üslü İfadeler',
        'Kareköklü İfadeler',
        'Veri Analizi (Grafikler)',
        'Basit Olayların Olma Olasılığı',
        'Cebirsel İfadeler ve Özdeşlikler',
        'Doğrusal Denklemler',
        'Eşitsizlikler',
        'Üçgenler (Açı-Kenar, Yükseklik)',
        'Eşlik ve Benzerlik',
        'Dönüşüm Geometrisi',
        'Geometrik Cisimler (Prizma, Silindir, Koni)'
      ]
    },
    {
      subject: 'Fen Bilimleri',
      topics: [
        'Mevsimler ve İklim',
        'DNA ve Genetik Kod',
        'Basınç (Katı, Sıvı, Gaz)',
        'Madde ve Endüstri (Periyodik Sistem, Tepkimeler)',
        'Basit Makineler',
        'Enerji Dönüşümleri ve Çevre Bilimi',
        'Elektrik Yükleri ve Elektrik Enerjisi'
      ]
    },
    {
      subject: 'T.C. İnkılap Tarihi',
      topics: [
        'Bir Kahraman Doğuyor (Mustafa Kemal)',
        'Milli Uyanış: Bağımsızlık Yolında',
        'Ya İstiklal Ya Ölüm (Savaşlar Dönemi)',
        'Atatürkçülük ve Çağdaşlaşan Türkiye',
        'Demokratikleşme Çabaları',
        'Atatürk Dönemi Türk Dış Politikası',
        'Atatürk’ün Ölümü ve Sonrası'
      ]
    },
    {
      subject: 'Din Kültürü',
      topics: [
        'Kader İnancı',
        'Zekat ve Sadaka',
        'Din ve Hayat',
        'Hz. Muhammed’in Örnekliği',
        'Kur’an-ı Kerim ve Özellikleri'
      ]
    },
    {
      subject: 'İngilizce',
      topics: [
        'Unit 1: Friendship',
        'Unit 2: Teen Life',
        'Unit 3: In The Kitchen',
        'Unit 4: On The Phone',
        'Unit 5: The Internet',
        'Unit 6: Adventures',
        'Unit 7: Tourism',
        'Unit 8: Chores',
        'Unit 9: Science',
        'Unit 10: Natural Forces'
      ]
    }
  ],
  'YKS': [
    {
      subject: 'TYT Türkçe',
      topics: [
        'Sözcükte Anlama ve Yorumlama',
        'Cümlede Anlama ve Anlatım',
        'Paragrafta Anlama ve Yapı',
        'Ses Bilgisi',
        'Yazım Kuralları',
        'Noktalama İşaretleri',
        'Sözcük Türleri (Isim, Sıfat, Zamir, Zarf, Edat, Bağlaç)',
        'Cümlenin Ögeleri',
        'Fiiller, Eylemsiler ve Çatı',
        'Cümle Türleri',
        'Anlatım Bozuklukları'
      ]
    },
    {
      subject: 'TYT Matematik & Geometri',
      topics: [
        'Temel Kavramlar & Sayı Basamakları',
        'Bölme-Bölünebilme & EBOB-EKOK',
        'Rasyonel ve Ondalık Sayılar',
        'Basit Eşitsizlikler ve Mutlak Değer',
        'Üslü ve Köklü İfadeler',
        'Çarpanlara Ayırma & Oran-Orantı',
        'Problemler (Sayı, Kesir, Yaş, Yüzde, Kar-Zarar, Hız, İşçi)',
        'Kümeler ve Mantık',
        'Fonksiyonlar & Polinomlar',
        'İkinci Dereceden Denklemler & Karmaşık Sayılar',
        'Permütasyon, Kombinasyon, Olasılık',
        'Geometri: Doğruda ve Üçgende Açılar',
        'Geometri: Özel Üçgenler ve Üçgende Alan',
        'Geometri: Çokgenler ve Dörtgenler',
        'Geometri: Çember ve Daire',
        'Geometri: Katı Cisimler (Prizma, Piramit, Küre)'
      ]
    },
    {
      subject: 'TYT Fen Bilimleri',
      topics: [
        'Fizik: Fizik Bilimine Giriş & Madde Özellikleri',
        'Fizik: Hareket, Kuvvet & Newton Yasaları',
        'Fizik: İş, Güç, Enerji & Isı-Sıcaklık',
        'Fizik: Basınç, Kaldırma Kuvveti & Optik',
        'Kimya: Kimya Bilimi & Periyodik Sistem',
        'Kimya: Kimyasal Türler Arası Etkileşimler',
        'Kimya: Mol Kavramı & Tepkimeler',
        'Kimya: Karışımlar & Asit-Baz-Tuz',
        'Biyoloji: Canlıların Temel Bileşenleri & Hücre',
        'Biyoloji: Canlıların Sınıflandırılması & Bölünmeler',
        'Biyoloji: Kalıtım & Ekosistem Ekolojisi'
      ]
    },
    {
      subject: 'AYT Matematik',
      topics: [
        'Trigonometri',
        'Logaritma',
        'Diziler ve Seriler',
        'Limit ve Süreklilik',
        'Türev ve Uygulamaları',
        'İntegral ve Uygulamaları',
        'Noktanın ve Doğrunun Analitiği',
        'Çemberin Analitik İncelemesi'
      ]
    },
    {
      subject: 'AYT Fen Bilimleri',
      topics: [
        'Fizik: Vektörler, Tork & Denge',
        'Fizik: Newton Yasaları, Atışlar & Momentum',
        'Fizik: Elektrik ve Manyetizma',
        'Fizik: Çembersel Hareket & Basit Harmonik',
        'Fizik: Modern Fizik & Radyaktivite',
        'Kimya: Gazlar & Çözeltiler',
        'Kimya: Kimyasal Tepkimelerde Enerji, Hız & Denge',
        'Kimya: Elektrokimya & Organik Kimya',
        'Biyoloji: İnsan Fizyolojisi (Sistemler)',
        'Biyoloji: Genden Proteine (DNA, RNA, Sentez)',
        'Biyoloji: Bitki Biyolojisi & Fotosentez-Solunum'
      ]
    },
    {
      subject: 'AYT Edebiyat & Sosyal',
      topics: [
        'Edebiyat: Şiir Bilgisi & Edebi Sanatlar',
        'Edebiyat: İslamiyet Öncesi & Divan Edebiyatı',
        'Edebiyat: Tanzimat, Servet-i Fünun, Milli Edebiyat',
        'Edebiyat: Cumhuriyet Dönemi Türk Edebiyatı',
        'Tarih: İlk ve Orta Çağda Türk Dünyası & İslam Tarihi',
        'Tarih: Osmanlı Devleti Siyaseti ve Kültürü',
        'Tarih: Milli Mücadele ve İnkılap Tarihi',
        'Coğrafya: Biyoçeşitlilik, Şehirler, Bölgesel Kalkınma'
      ]
    }
  ]
};

export default function CoachingPanel({ isOpen, onClose, onOpenSpeedReading }: CoachingPanelProps) {
  // Authentication State
  const [userRole, setUserRole] = useState<'none' | 'student' | 'coach'>('none');
  const [currentStudent, setCurrentStudent] = useState<StudentAccount | null>(null);

  // LoginForm inputs
  const [loginTab, setLoginTab] = useState<'student' | 'coach'>('student');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Main Tabs
  const [studentActiveTab, setStudentActiveTab] = useState<'kaygi' | 'gunluk' | 'deneme' | 'mufredat'>('kaygi');
  const [coachActiveTab, setCoachActiveTab] = useState<'ogrenciler' | 'egzersiz_raporu' | 'gunluk_rapor' | 'deneme_rapor' | 'mufredat_rapor'>('ogrenciler');

  // Database State Collections
  const [studentsList, setStudentsList] = useState<StudentAccount[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<StudentExerciseLog[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyStudyLog[]>([]);
  const [mockLogs, setMockLogs] = useState<MockExamLog[]>([]);
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);

  // Filter States for Reports
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form States - New Daily Study Entry
  const [dailyForm, setDailyForm] = useState({
    date: new Date().toLocaleDateString('tr-TR'),
    subject: '',
    topic: '',
    solvedQuestions: 50,
    correctCount: 45,
    wrongCount: 5,
    emptyCount: 0,
    studyDurationMinutes: 60,
    notes: ''
  });
  const [dailySuccessMsg, setDailySuccessMsg] = useState('');

  // Form States - New Mock Exam Entry
  const [mockForm, setMockForm] = useState<{
    examName: string;
    date: string;
    subjectNets: Record<string, number>;
    score: number;
    notes: string;
  }>({
    examName: '',
    date: new Date().toLocaleDateString('tr-TR'),
    subjectNets: {},
    score: 0,
    notes: ''
  });
  const [mockSuccessMsg, setMockSuccessMsg] = useState('');

  // Form States - Student Account Management (Coach)
  const [newStudentUsername, setNewStudentUsername] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [newStudentFullName, setNewStudentFullName] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('8. Sınıf (LGS)');
  const [studentMgmtMsg, setStudentMgmtMsg] = useState('');

  // Fetch initial data
  const loadAllData = async () => {
    try {
      const sts = await dbGetStudents();
      setStudentsList(sts);

      const logs = await dbGetStudentLogs();
      setExerciseLogs(logs);

      const dLogs = await dbGetDailyStudyLogs();
      setDailyLogs(dLogs);

      const mLogs = await dbGetMockExamLogs();
      setMockLogs(mLogs);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen]);

  // Load student progress when logged in as student
  useEffect(() => {
    if (currentStudent) {
      dbGetCurriculumProgress(currentStudent.username).then((topics) => {
        setCompletedTopics(topics);
      });
      // Set default selected subject for daily study form
      const groupKey = getGroupKey(currentStudent.studentClass);
      const groupCurr = CURRICULUM_DATA[groupKey] || [];
      if (groupCurr.length > 0) {
        setDailyForm(prev => ({
          ...prev,
          subject: groupCurr[0].subject,
          topic: groupCurr[0].topics[0] || ''
        }));
      }
    }
  }, [currentStudent]);

  if (!isOpen) return null;

  // Helper to get group key 'İLKOKUL' | 'LGS' | 'YKS'
  function getGroupKey(studentClass: string): 'İLKOKUL' | 'LGS' | 'YKS' {
    const cls = (studentClass || '').toUpperCase();
    if (cls.includes('İLKOKUL') || cls.includes('4.') || cls.includes('3.')) return 'İLKOKUL';
    if (cls.includes('YKS') || cls.includes('12.') || cls.includes('MEZUN') || cls.includes('11.')) return 'YKS';
    return 'LGS'; // default
  }

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (loginTab === 'coach') {
      if ((loginUsername === 'gamze' || loginUsername === 'admin') && (loginPassword === '123456' || loginPassword === 'Gamze!2026')) {
        setUserRole('coach');
        setCurrentStudent(null);
        setLoginUsername('');
        setLoginPassword('');
        loadAllData();
      } else {
        setLoginError('Hatalı koç kullanıcı adı veya şifresi. (Örnek: gamze / 123456)');
      }
    } else {
      // Student login
      const allSts = await dbGetStudents();
      const match = allSts.find(
        s => s.username.toLowerCase() === loginUsername.trim().toLowerCase() && s.password === loginPassword.trim()
      );
      if (match) {
        setUserRole('student');
        setCurrentStudent(match);
        setLoginUsername('');
        setLoginPassword('');
        loadAllData();
      } else {
        setLoginError('Kullanıcı adı veya şifre hatalı. Lütfen Gamze Hanım tarafından tanımlanan bilgilerinizi kontrol ediniz.');
      }
    }
  };

  // Quick login helper for demo
  const quickStudentLogin = (st: StudentAccount) => {
    setUserRole('student');
    setCurrentStudent(st);
    setLoginError('');
  };

  // Handle adding new daily study log
  const handleAddDailyLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;
    if (!dailyForm.subject || !dailyForm.topic) {
      alert('Lütfen ders ve konu alanlarını doldurunuz.');
      return;
    }

    const newEntry = await dbAddDailyStudyLog({
      studentUsername: currentStudent.username,
      studentFullName: currentStudent.fullName,
      studentClass: currentStudent.studentClass,
      date: dailyForm.date || new Date().toLocaleDateString('tr-TR'),
      subject: dailyForm.subject,
      topic: dailyForm.topic,
      solvedQuestions: Number(dailyForm.solvedQuestions),
      correctCount: Number(dailyForm.correctCount),
      wrongCount: Number(dailyForm.wrongCount),
      emptyCount: Number(dailyForm.emptyCount),
      studyDurationMinutes: Number(dailyForm.studyDurationMinutes),
      notes: dailyForm.notes
    });

    setDailyLogs(prev => [newEntry, ...prev]);
    setDailySuccessMsg('✅ Günlük çalışma kaydınız başarıyla eklendi!');
    setTimeout(() => setDailySuccessMsg(''), 4000);

    setDailyForm(prev => ({
      ...prev,
      notes: ''
    }));
  };

  // Handle Mock Exam Submission
  const handleAddMockExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;
    if (!mockForm.examName) {
      alert('Lütfen deneme sınavı adını giriniz.');
      return;
    }

    const groupKey = getGroupKey(currentStudent.studentClass);
    let calculatedTotalNet = 0;
    Object.values(mockForm.subjectNets).forEach(n => {
      calculatedTotalNet += (Number(n) || 0);
    });

    // Approximate score multiplier
    let scoreMultiplier = 5;
    if (groupKey === 'LGS') scoreMultiplier = 5.2;
    if (groupKey === 'YKS') scoreMultiplier = 4.8;
    const calculatedScore = mockForm.score > 0 ? mockForm.score : Math.min(500, Math.round(calculatedTotalNet * scoreMultiplier * 10) / 10);

    const newExam = await dbAddMockExamLog({
      studentUsername: currentStudent.username,
      studentFullName: currentStudent.fullName,
      studentClass: currentStudent.studentClass,
      examName: mockForm.examName,
      date: mockForm.date || new Date().toLocaleDateString('tr-TR'),
      groupType: groupKey,
      subjectNets: mockForm.subjectNets,
      totalNet: Math.round(calculatedTotalNet * 100) / 100,
      score: calculatedScore,
      notes: mockForm.notes
    });

    setMockLogs(prev => [newExam, ...prev]);
    setMockSuccessMsg('🎉 Deneme sınavı sonuçlarınız başarıyla kaydedildi!');
    setTimeout(() => setMockSuccessMsg(''), 4000);

    setMockForm({
      examName: '',
      date: new Date().toLocaleDateString('tr-TR'),
      subjectNets: {},
      score: 0,
      notes: ''
    });
  };

  // Toggle topic progress checkbox
  const handleToggleTopicProgress = async (topicKey: string) => {
    if (!currentStudent) return;
    let updated: string[] = [];
    if (completedTopics.includes(topicKey)) {
      updated = completedTopics.filter(t => t !== topicKey);
    } else {
      updated = [...completedTopics, topicKey];
    }
    setCompletedTopics(updated);
    await dbSaveCurriculumProgress(currentStudent.username, updated);
  };

  // Save Anxiety Exercise Log automatically from AnxietyControlPanel
  const handleAnxietyExerciseLog = async (logInfo: { exerciseTitle: string; durationSeconds: number; score: number; details?: string }) => {
    if (!currentStudent) return;
    const newLog = await dbAddStudentLog({
      studentUsername: currentStudent.username,
      studentFullName: currentStudent.fullName,
      exerciseId: 'anxiety-' + Math.random().toString(36).substring(2, 6),
      exerciseTitle: logInfo.exerciseTitle,
      categoryLabel: 'Kaygı Yönetimi',
      level: currentStudent.studentClass,
      date: new Date().toLocaleString('tr-TR'),
      durationSeconds: logInfo.durationSeconds,
      wpm: 0,
      accuracy: 100,
      score: logInfo.score
    });
    setExerciseLogs(prev => [newLog, ...prev]);
  };

  // Coach action: Create new student
  const handleCreateStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentUsername || !newStudentPassword || !newStudentFullName) {
      alert('Lütfen kullanıcı adı, şifre ve ad soyad alanlarını doldurunuz.');
      return;
    }

    const created = await dbAddStudent({
      username: newStudentUsername.trim().toLowerCase(),
      password: newStudentPassword.trim(),
      fullName: newStudentFullName.trim(),
      studentClass: newStudentClass,
      createdAt: new Date().toLocaleDateString('tr-TR')
    });

    setStudentsList(prev => [...prev, created]);
    setStudentMgmtMsg(`✅ ${created.fullName} öğrencisi başarıyla oluşturuldu!`);
    setTimeout(() => setStudentMgmtMsg(''), 4000);

    setNewStudentUsername('');
    setNewStudentPassword('');
    setNewStudentFullName('');
  };

  // Coach action: Delete Student
  const handleDeleteStudentClick = async (id: string, name: string) => {
    if (confirm(`${name} isimli öğrenci hesabını silmek istediğinize emin misiniz?`)) {
      await dbDeleteStudent(id);
      setStudentsList(prev => prev.filter(s => s.id !== id));
    }
  };

  // Coach action: Delete Daily Log
  const handleDeleteDailyLogClick = async (id: string) => {
    if (confirm('Bu günlük çalışma kaydını silmek istediğinize emin misiniz?')) {
      await dbDeleteDailyStudyLog(id);
      setDailyLogs(prev => prev.filter(l => l.id !== id));
    }
  };

  // Coach action: Delete Mock Exam Log
  const handleDeleteMockLogClick = async (id: string) => {
    if (confirm('Bu deneme sınavı kaydını silmek istediğinize emin misiniz?')) {
      await dbDeleteMockExamLog(id);
      setMockLogs(prev => prev.filter(m => m.id !== id));
    }
  };

  // Coach action: Delete Exercise Log
  const handleDeleteExerciseLogClick = async (id: string) => {
    if (confirm('Bu egzersiz performans kaydını silmek istediğinize emin misiniz?')) {
      await dbDeleteStudentLog(id);
      setExerciseLogs(prev => prev.filter(e => e.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="bg-stone-50 w-full max-w-7xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-amber-900/20">
        
        {/* TOP HEADER BAR */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-[#C5A059]/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C5A059] text-slate-900 flex items-center justify-center font-serif font-black text-xl rounded shadow-md">
              GT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-black text-lg sm:text-xl text-white tracking-wide uppercase">
                  KOÇLUK ÖZEL PANELİ
                </h2>
                <span className="bg-[#C5A059] text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider hidden sm:inline-block">
                  GAMZE TOSUN ÖĞRENCİ TAKİBİ
                </span>
              </div>
              <p className="text-slate-300 text-xs">
                {userRole === 'coach' ? 'Gamze Hanım Yönetici ve Öğrenci Rapor Portalı' : userRole === 'student' ? `${currentStudent?.fullName} (${currentStudent?.studentClass}) Özel Sayfası` : 'Kullanıcı ve Koç Giriş Portalı'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {userRole !== 'none' && (
              <button
                onClick={() => {
                  setUserRole('none');
                  setCurrentStudent(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-bold rounded transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Çıkış Yap</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Kapat"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* MAIN BODY AREA */}
        <div className="flex-grow overflow-y-auto p-3 sm:p-6 bg-stone-100">

          {/* ========================================================================= */}
          {/* 1. LOGIN SCREEN (WHEN NOT LOGGED IN)                                      */}
          {/* ========================================================================= */}
          {userRole === 'none' && (
            <div className="max-w-xl mx-auto my-8 bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-stone-200">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#C5A059]/10 border-2 border-[#C5A059] text-[#C5A059] rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-bold text-2xl text-slate-900">
                  Koçluk Özel Paneline Hoş Geldiniz
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm mt-1">
                  Öğrenci veya Koç hesabınızla giriş yaparak günlük çalışmalarınızı, sınav takibinizi ve kaygı egzersizlerinizi yönetebilirsiniz.
                </p>
              </div>

              {/* Login Tab selector */}
              <div className="flex bg-stone-100 p-1 rounded-xl mb-6 border border-stone-200">
                <button
                  type="button"
                  onClick={() => { setLoginTab('student'); setLoginError(''); }}
                  className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                    loginTab === 'student'
                      ? 'bg-[#C5A059] text-slate-950 shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-4 h-4 inline mr-1.5" />
                  Öğrenci Girişi
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginTab('coach'); setLoginError(''); }}
                  className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                    loginTab === 'coach'
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Shield className="w-4 h-4 inline mr-1.5 text-[#C5A059]" />
                  Gamze Hanım (Koç) Girişi
                </button>
              </div>

              {/* Login Error Msg */}
              {loginError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                    Kullanıcı Adı
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder={loginTab === 'coach' ? 'gamze' : 'Örn: lgs_ogrenci veya zeynep'}
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                    Şifre
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 font-bold text-sm uppercase tracking-wider rounded-lg shadow-lg transition-all cursor-pointer ${
                    loginTab === 'coach'
                      ? 'bg-slate-900 hover:bg-slate-800 text-white'
                      : 'bg-[#C5A059] hover:bg-[#b08d4b] text-slate-950'
                  }`}
                >
                  {loginTab === 'coach' ? 'Koç Paneline Giriş Yap' : 'Öğrenci Paneline Giriş Yap'}
                </button>
              </form>

              {/* Quick sample student accounts helper */}
              {loginTab === 'student' && studentsList.length > 0 && (
                <div className="mt-8 pt-6 border-t border-stone-200">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                    Örnek Kayıtlı Öğrenci Hesapları ile Hızlı Giriş:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {studentsList.slice(0, 3).map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => quickStudentLogin(st)}
                        className="p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left rounded-lg text-xs transition-all cursor-pointer group"
                      >
                        <span className="font-bold text-slate-900 block group-hover:text-[#C5A059]">
                          {st.fullName}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {st.studentClass}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. STUDENT DASHBOARD (LOGGED IN AS STUDENT)                               */}
          {/* ========================================================================= */}
          {userRole === 'student' && currentStudent && (
            <div className="space-y-6">
              
              {/* Student Header Info Bar */}
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-stone-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#C5A059] text-slate-950 font-serif font-black text-2xl rounded-xl flex items-center justify-center shadow">
                    {currentStudent.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-xl text-slate-900">
                      {currentStudent.fullName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {currentStudent.studentClass}
                      </span>
                      <span className="text-slate-500 text-xs">
                        Kullanıcı Adı: <code className="font-mono text-slate-700">{currentStudent.username}</code>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onOpenSpeedReading && (
                    <button
                      onClick={onOpenSpeedReading}
                      className="px-3.5 py-2 bg-[#C5A059]/10 border border-[#C5A059]/40 text-[#C5A059] hover:bg-[#C5A059] hover:text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    >
                      ⚡ Hızlı Okuma Egzersizleri
                    </button>
                  )}
                </div>
              </div>

              {/* Student Nav Tabs */}
              <div className="flex flex-wrap bg-white p-1.5 rounded-xl shadow border border-stone-200 gap-1">
                <button
                  onClick={() => setStudentActiveTab('kaygi')}
                  className={`flex-1 py-3 px-4 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    studentActiveTab === 'kaygi'
                      ? 'bg-[#C5A059] text-slate-950 shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'
                  }`}
                >
                  <HeartPulse className="w-4 h-4" />
                  <span>Kaygı Yönetimi Egzersizleri</span>
                </button>

                <button
                  onClick={() => setStudentActiveTab('gunluk')}
                  className={`flex-1 py-3 px-4 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    studentActiveTab === 'gunluk'
                      ? 'bg-[#C5A059] text-slate-950 shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Günlük Çalışma Takibi</span>
                </button>

                <button
                  onClick={() => setStudentActiveTab('deneme')}
                  className={`flex-1 py-3 px-4 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    studentActiveTab === 'deneme'
                      ? 'bg-[#C5A059] text-slate-950 shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'
                  }`}
                >
                  <BarChart2 className="w-4 h-4" />
                  <span>Deneme Sınavı Takibi</span>
                </button>

                <button
                  onClick={() => setStudentActiveTab('mufredat')}
                  className={`flex-1 py-3 px-4 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    studentActiveTab === 'mufredat'
                      ? 'bg-[#C5A059] text-slate-950 shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Müfredat & Konu Takibi</span>
                </button>
              </div>

              {/* TAB 1: KAYGI YÖNETİMİ EGZERSİZLERİ */}
              {studentActiveTab === 'kaygi' && (
                <div className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden">
                  <div className="p-4 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C5A059]" />
                    <span>Burada yaptığınız tüm egzersiz süreleri ve sonuçları Gamze Hanım’ın koçluk rapor paneline otomatik kaydedilir.</span>
                  </div>
                  <AnxietyControlPanel 
                    studentName={currentStudent.fullName}
                    onSaveExerciseLog={handleAnxietyExerciseLog}
                  />
                </div>
              )}

              {/* TAB 2: GÜNLÜK ÇALIŞMA TAKİBİ */}
              {studentActiveTab === 'gunluk' && (
                <div className="space-y-6">
                  
                  {/* Daily Study Input Form */}
                  <div className="bg-white p-6 rounded-2xl shadow-md border border-stone-200">
                    <h4 className="font-serif font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-[#C5A059]" />
                      Yeni Günlük Çalışma Kaydı Ekle
                    </h4>

                    {dailySuccessMsg && (
                      <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg">
                        {dailySuccessMsg}
                      </div>
                    )}

                    <form onSubmit={handleAddDailyLogSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      
                      {/* Date */}
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                          Çalışma Tarihi
                        </label>
                        <input
                          type="text"
                          value={dailyForm.date}
                          onChange={(e) => setDailyForm({ ...dailyForm, date: e.target.value })}
                          placeholder="29.07.2026"
                          className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-slate-900"
                          required
                        />
                      </div>

                      {/* Subject Dropdown */}
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                          Ders
                        </label>
                        <select
                          value={dailyForm.subject}
                          onChange={(e) => {
                            const sub = e.target.value;
                            const groupKey = getGroupKey(currentStudent.studentClass);
                            const groupCurr = CURRICULUM_DATA[groupKey] || [];
                            const matched = groupCurr.find(c => c.subject === sub);
                            setDailyForm({
                              ...dailyForm,
                              subject: sub,
                              topic: matched ? matched.topics[0] || '' : ''
                            });
                          }}
                          className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-slate-900"
                          required
                        >
                          {(CURRICULUM_DATA[getGroupKey(currentStudent.studentClass)] || []).map((c) => (
                            <option key={c.subject} value={c.subject}>
                              {c.subject}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Topic Dropdown / Input */}
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                          Çalışılan Konu
                        </label>
                        {(() => {
                          const groupKey = getGroupKey(currentStudent.studentClass);
                          const groupCurr = CURRICULUM_DATA[groupKey] || [];
                          const matched = groupCurr.find(c => c.subject === dailyForm.subject);
                          if (matched && matched.topics.length > 0) {
                            return (
                              <select
                                value={dailyForm.topic}
                                onChange={(e) => setDailyForm({ ...dailyForm, topic: e.target.value })}
                                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-slate-900"
                              >
                                {matched.topics.map((tp) => (
                                  <option key={tp} value={tp}>
                                    {tp}
                                  </option>
                                ))}
                              </select>
                            );
                          }
                          return (
                            <input
                              type="text"
                              value={dailyForm.topic}
                              onChange={(e) => setDailyForm({ ...dailyForm, topic: e.target.value })}
                              placeholder="Konu başlığı yazın"
                              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-slate-900"
                              required
                            />
                          );
                        })()}
                      </div>

                      {/* Solved Question Count */}
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                          Çözülen Soru Sayısı
                        </label>
                        <input
                          type="number"
                          value={dailyForm.solvedQuestions}
                          onChange={(e) => setDailyForm({ ...dailyForm, solvedQuestions: Number(e.target.value) })}
                          min={0}
                          className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-slate-900"
                          required
                        />
                      </div>

                      {/* Correct / Wrong / Empty */}
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                          Doğru / Yanlış / Boş
                        </label>
                        <div className="grid grid-cols-3 gap-1">
                          <input
                            type="number"
                            value={dailyForm.correctCount}
                            onChange={(e) => setDailyForm({ ...dailyForm, correctCount: Number(e.target.value) })}
                            placeholder="D"
                            className="p-2 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded text-xs font-bold text-center"
                          />
                          <input
                            type="number"
                            value={dailyForm.wrongCount}
                            onChange={(e) => setDailyForm({ ...dailyForm, wrongCount: Number(e.target.value) })}
                            placeholder="Y"
                            className="p-2 bg-rose-50 border border-rose-300 text-rose-900 rounded text-xs font-bold text-center"
                          />
                          <input
                            type="number"
                            value={dailyForm.emptyCount}
                            onChange={(e) => setDailyForm({ ...dailyForm, emptyCount: Number(e.target.value) })}
                            placeholder="B"
                            className="p-2 bg-slate-50 border border-slate-300 text-slate-900 rounded text-xs font-bold text-center"
                          />
                        </div>
                      </div>

                      {/* Study Duration Minutes */}
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                          Süre (Dakika)
                        </label>
                        <input
                          type="number"
                          value={dailyForm.studyDurationMinutes}
                          onChange={(e) => setDailyForm({ ...dailyForm, studyDurationMinutes: Number(e.target.value) })}
                          min={5}
                          className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-slate-900"
                          required
                        />
                      </div>

                      {/* Notes / Remarks */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                          Günün Notu / Anlaşılmayan Kısımlar
                        </label>
                        <input
                          type="text"
                          value={dailyForm.notes}
                          onChange={(e) => setDailyForm({ ...dailyForm, notes: e.target.value })}
                          placeholder="Örn: Paragraf sorularında 3. soru kalıbını Gamze Hanım'a soracağım"
                          className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-slate-900"
                        />
                      </div>

                      <div className="md:col-span-4 flex justify-end">
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-[#C5A059] hover:bg-[#b08d4b] text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all cursor-pointer"
                        >
                          Günlük Çalışmayı Kaydet
                        </button>
                      </div>

                    </form>
                  </div>

                  {/* Daily Study Log History Table */}
                  <div className="bg-white p-6 rounded-2xl shadow-md border border-stone-200">
                    <h4 className="font-serif font-bold text-lg text-slate-900 mb-4 flex items-center justify-between">
                      <span>Geçmiş Çalışma Kayıtlarım</span>
                      <span className="text-xs text-slate-500 font-sans font-normal">
                        Toplam {dailyLogs.filter(l => l.studentUsername === currentStudent.username).length} Kayıt
                      </span>
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-100 text-slate-700 uppercase font-bold border-b border-stone-200">
                          <tr>
                            <th className="p-3">Tarih</th>
                            <th className="p-3">Ders</th>
                            <th className="p-3">Konu</th>
                            <th className="p-3">Soru Sayısı</th>
                            <th className="p-3">D / Y / B</th>
                            <th className="p-3">Süre</th>
                            <th className="p-3">Notlar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                          {dailyLogs.filter(l => l.studentUsername === currentStudent.username).map((log) => (
                            <tr key={log.id} className="hover:bg-stone-50">
                              <td className="p-3 font-bold text-slate-900">{log.date}</td>
                              <td className="p-3 font-bold text-[#C5A059]">{log.subject}</td>
                              <td className="p-3 text-slate-800">{log.topic}</td>
                              <td className="p-3 font-extrabold text-slate-900">{log.solvedQuestions} Soru</td>
                              <td className="p-3 font-mono text-slate-700">
                                <span className="text-emerald-600 font-bold">{log.correctCount ?? '-'}D</span> / <span className="text-rose-600 font-bold">{log.wrongCount ?? '-'}Y</span>
                              </td>
                              <td className="p-3 text-slate-700">{log.studyDurationMinutes} dk</td>
                              <td className="p-3 text-slate-500 max-w-xs truncate">{log.notes || '-'}</td>
                            </tr>
                          ))}
                          {dailyLogs.filter(l => l.studentUsername === currentStudent.username).length === 0 && (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-slate-400">
                                Henüz günlük çalışma kaydınız bulunmamaktadır. Yukarıdaki formu kullanarak ilk çalışma kaydınızı ekleyebilirsiniz.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: DENEME SINAVI TAKİBİ */}
              {studentActiveTab === 'deneme' && (
                <div className="space-y-6">
                  
                  {/* Mock Exam Entry Form */}
                  <div className="bg-white p-6 rounded-2xl shadow-md border border-stone-200">
                    <h4 className="font-serif font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-[#C5A059]" />
                      Yeni Deneme Sınavı Sonucu Ekle ({getGroupKey(currentStudent.studentClass)})
                    </h4>

                    {mockSuccessMsg && (
                      <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg">
                        {mockSuccessMsg}
                      </div>
                    )}

                    <form onSubmit={handleAddMockExamSubmit} className="space-y-4">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                            Deneme Sınavı Adı
                          </label>
                          <input
                            type="text"
                            value={mockForm.examName}
                            onChange={(e) => setMockForm({ ...mockForm, examName: e.target.value })}
                            placeholder="Örn: Özdebir LGS Genel Deneme-1"
                            className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-slate-900"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                            Sınav Tarihi
                          </label>
                          <input
                            type="text"
                            value={mockForm.date}
                            onChange={(e) => setMockForm({ ...mockForm, date: e.target.value })}
                            placeholder="29.07.2026"
                            className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-slate-900"
                            required
                          />
                        </div>
                      </div>

                      {/* Course Net Input Grid per Group */}
                      <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                        <label className="block text-xs font-extrabold uppercase text-slate-800 mb-3">
                          Ders Net Sayıları (Doğru - Yanlış/4)
                        </label>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {(CURRICULUM_DATA[getGroupKey(currentStudent.studentClass)] || []).map((c) => (
                            <div key={c.subject}>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1 truncate">
                                {c.subject} Net
                              </label>
                              <input
                                type="number"
                                step="0.25"
                                value={mockForm.subjectNets[c.subject] ?? ''}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setMockForm({
                                    ...mockForm,
                                    subjectNets: {
                                      ...mockForm.subjectNets,
                                      [c.subject]: val
                                    }
                                  });
                                }}
                                placeholder="0.00"
                                className="w-full p-2 bg-white border border-stone-300 rounded text-xs font-bold text-slate-900 text-center"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                            Hesaplanan Toplam Puan (Opsiyonel / Sınav Sonuç Puanı)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={mockForm.score || ''}
                            onChange={(e) => setMockForm({ ...mockForm, score: parseFloat(e.target.value) || 0 })}
                            placeholder="Örn: 468.50"
                            className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                            Açıklama / Hedef Notu
                          </label>
                          <input
                            type="text"
                            value={mockForm.notes}
                            onChange={(e) => setMockForm({ ...mockForm, notes: e.target.value })}
                            placeholder="Matematik süresini iyi yetiştirdim"
                            className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-slate-900"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-[#C5A059] hover:bg-[#b08d4b] text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all cursor-pointer"
                        >
                          Deneme Sonucunu Kaydet
                        </button>
                      </div>

                    </form>
                  </div>

                  {/* Past Mock Exams Table */}
                  <div className="bg-white p-6 rounded-2xl shadow-md border border-stone-200">
                    <h4 className="font-serif font-bold text-lg text-slate-900 mb-4 flex items-center justify-between">
                      <span>Geçmiş Deneme Sınavı Sonuçlarım</span>
                      <span className="text-xs text-slate-500 font-normal font-sans">
                        Toplam {mockLogs.filter(m => m.studentUsername === currentStudent.username).length} Deneme
                      </span>
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-100 text-slate-700 uppercase font-bold border-b border-stone-200">
                          <tr>
                            <th className="p-3">Tarih</th>
                            <th className="p-3">Deneme Sınavı</th>
                            <th className="p-3">Ders Netleri</th>
                            <th className="p-3">Toplam Net</th>
                            <th className="p-3">Puan</th>
                            <th className="p-3">Notlar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                          {mockLogs.filter(m => m.studentUsername === currentStudent.username).map((m) => (
                            <tr key={m.id} className="hover:bg-stone-50">
                              <td className="p-3 font-bold text-slate-900">{m.date}</td>
                              <td className="p-3 font-bold text-[#C5A059]">{m.examName}</td>
                              <td className="p-3">
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(m.subjectNets || {}).map(([sub, net]) => (
                                    <span key={sub} className="bg-stone-100 border border-stone-300 text-slate-800 text-[10px] px-1.5 py-0.5 rounded">
                                      {sub}: <strong>{net}</strong>
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="p-3 font-black text-emerald-700 text-sm">
                                {m.totalNet} Net
                              </td>
                              <td className="p-3 font-extrabold text-slate-900">
                                {m.score} Puan
                              </td>
                              <td className="p-3 text-slate-500 max-w-xs truncate">{m.notes || '-'}</td>
                            </tr>
                          ))}
                          {mockLogs.filter(m => m.studentUsername === currentStudent.username).length === 0 && (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-slate-400">
                                Henüz deneme sınavı sonucunuz bulunmamaktadır.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 4: MÜFREDAT & KONU TAKİBİ */}
              {studentActiveTab === 'mufredat' && (
                <div className="bg-white p-6 rounded-2xl shadow-md border border-stone-200 space-y-6">
                  <div>
                    <h4 className="font-serif font-bold text-xl text-slate-900 flex items-center justify-between">
                      <span>{currentStudent.studentClass} Müfredat ve Konu İlerleme Cetveli</span>
                      <span className="text-xs bg-amber-100 text-amber-900 font-extrabold px-3 py-1 rounded-full border border-amber-300">
                        Tamamlanan Konular: {completedTopics.length}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Çalıştığınız ve bitirdiğiniz konuları işaretleyiniz. Gamze Hanım bu ilerlemenizi canlı takip edebilmektedir.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {(CURRICULUM_DATA[getGroupKey(currentStudent.studentClass)] || []).map((subjectObj) => {
                      const completedInSub = subjectObj.topics.filter(t => completedTopics.includes(`${subjectObj.subject}__${t}`)).length;
                      const subPercent = Math.round((completedInSub / subjectObj.topics.length) * 100) || 0;

                      return (
                        <div key={subjectObj.subject} className="border border-stone-200 rounded-xl p-4 bg-stone-50">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-[#C5A059]" />
                              {subjectObj.subject}
                            </h5>
                            <div className="flex items-center gap-2">
                              <div className="w-28 bg-stone-200 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-emerald-500 h-full transition-all duration-300"
                                  style={{ width: `${subPercent}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-emerald-700">{subPercent}%</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {subjectObj.topics.map((topicName) => {
                              const topicKey = `${subjectObj.subject}__${topicName}`;
                              const isDone = completedTopics.includes(topicKey);

                              return (
                                <button
                                  key={topicName}
                                  type="button"
                                  onClick={() => handleToggleTopicProgress(topicKey)}
                                  className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-center gap-2 cursor-pointer ${
                                    isDone 
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' 
                                      : 'bg-white border-stone-200 text-slate-700 hover:border-amber-400'
                                  }`}
                                >
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                    isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-400'
                                  }`}>
                                    {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className="truncate">{topicName}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. COACH DASHBOARD (GAMZE HANIM YÖNETİCİ MODU)                            */}
          {/* ========================================================================= */}
          {userRole === 'coach' && (
            <div className="space-y-6">
              
              {/* Coach Summary Cards Header */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow border border-stone-200 flex items-center gap-3">
                  <div className="p-3 bg-amber-100 text-[#C5A059] rounded-lg">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-bold uppercase">Kayıtlı Öğrenciler</span>
                    <h4 className="text-2xl font-black text-slate-900">{studentsList.length} Öğrenci</h4>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow border border-stone-200 flex items-center gap-3">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-bold uppercase">Günlük Çalışma Kayıtları</span>
                    <h4 className="text-2xl font-black text-slate-900">{dailyLogs.length} Kayıt</h4>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow border border-stone-200 flex items-center gap-3">
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                    <BarChart2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-bold uppercase">Deneme Sınavları</span>
                    <h4 className="text-2xl font-black text-slate-900">{mockLogs.length} Deneme</h4>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow border border-stone-200 flex items-center gap-3">
                  <div className="p-3 bg-rose-100 text-rose-600 rounded-lg">
                    <HeartPulse className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-bold uppercase">Egzersiz Performansları</span>
                    <h4 className="text-2xl font-black text-slate-900">{exerciseLogs.length} Performans</h4>
                  </div>
                </div>
              </div>

              {/* Coach Nav Tabs */}
              <div className="flex flex-wrap bg-white p-1.5 rounded-xl shadow border border-stone-200 gap-1">
                <button
                  onClick={() => setCoachActiveTab('ogrenciler')}
                  className={`flex-1 py-3 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    coachActiveTab === 'ogrenciler'
                      ? 'bg-slate-900 text-white shadow'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'
                  }`}
                >
                  <User className="w-4 h-4 text-[#C5A059]" />
                  <span>Öğrenci Hesap Yönetimi</span>
                </button>

                <button
                  onClick={() => setCoachActiveTab('egzersiz_raporu')}
                  className={`flex-1 py-3 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    coachActiveTab === 'egzersiz_raporu'
                      ? 'bg-slate-900 text-white shadow'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'
                  }`}
                >
                  <HeartPulse className="w-4 h-4 text-[#C5A059]" />
                  <span>Egzersiz Raporları</span>
                </button>

                <button
                  onClick={() => setCoachActiveTab('gunluk_rapor')}
                  className={`flex-1 py-3 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    coachActiveTab === 'gunluk_rapor'
                      ? 'bg-slate-900 text-white shadow'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-[#C5A059]" />
                  <span>Günlük Çalışma Raporları</span>
                </button>

                <button
                  onClick={() => setCoachActiveTab('deneme_rapor')}
                  className={`flex-1 py-3 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    coachActiveTab === 'deneme_rapor'
                      ? 'bg-slate-900 text-white shadow'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'
                  }`}
                >
                  <BarChart2 className="w-4 h-4 text-[#C5A059]" />
                  <span>Deneme Sınavı Raporları</span>
                </button>
              </div>

              {/* COACH TAB 1: ÖĞRENCİ HESAP YÖNETİMİ */}
              {coachActiveTab === 'ogrenciler' && (
                <div className="space-y-6">
                  
                  {/* Create New Student Account */}
                  <div className="bg-white p-6 rounded-2xl shadow-md border border-stone-200">
                    <h4 className="font-serif font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-[#C5A059]" />
                      Yeni Öğrenci Hesabı Oluştur
                    </h4>

                    {studentMgmtMsg && (
                      <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg">
                        {studentMgmtMsg}
                      </div>
                    )}

                    <form onSubmit={handleCreateStudentSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                          Kullanıcı Adı
                        </label>
                        <input
                          type="text"
                          value={newStudentUsername}
                          onChange={(e) => setNewStudentUsername(e.target.value)}
                          placeholder="Örn: ahmet_lgs"
                          className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-slate-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                          Şifre
                        </label>
                        <input
                          type="text"
                          value={newStudentPassword}
                          onChange={(e) => setNewStudentPassword(e.target.value)}
                          placeholder="Örn: Ahmet123!"
                          className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-slate-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                          Öğrenci Adı Soyadı
                        </label>
                        <input
                          type="text"
                          value={newStudentFullName}
                          onChange={(e) => setNewStudentFullName(e.target.value)}
                          placeholder="Örn: Ahmet Yılmaz"
                          className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-slate-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                          Grubu / Sınıfı
                        </label>
                        <select
                          value={newStudentClass}
                          onChange={(e) => setNewStudentClass(e.target.value)}
                          className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-slate-900"
                        >
                          <option value="4. Sınıf (İlkokul)">4. Sınıf (İlkokul)</option>
                          <option value="8. Sınıf (LGS)">8. Sınıf (LGS)</option>
                          <option value="12. Sınıf (YKS)">12. Sınıf (YKS)</option>
                          <option value="Mezun (YKS)">Mezun (YKS)</option>
                        </select>
                      </div>

                      <div className="lg:col-span-4 flex justify-end">
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all cursor-pointer"
                        >
                          Hesabı Tanımla ve Kaydet
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Registered Students Table */}
                  <div className="bg-white p-6 rounded-2xl shadow-md border border-stone-200">
                    <h4 className="font-serif font-bold text-lg text-slate-900 mb-4 flex items-center justify-between">
                      <span>Tanımlı Öğrenci Hesapları</span>
                      <span className="text-xs text-slate-500 font-normal">
                        Gamze Hanım tarafından silinmedikçe veriler kalıcı olarak korunur.
                      </span>
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-100 text-slate-700 uppercase font-bold border-b border-stone-200">
                          <tr>
                            <th className="p-3">Kullanıcı Adı</th>
                            <th className="p-3">Şifre</th>
                            <th className="p-3">Adı Soyadı</th>
                            <th className="p-3">Sınıfı / Grubu</th>
                            <th className="p-3">Kayıt Tarihi</th>
                            <th className="p-3 text-right">İşlem</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                          {studentsList.map((st) => (
                            <tr key={st.id} className="hover:bg-stone-50">
                              <td className="p-3 font-mono font-bold text-slate-900">{st.username}</td>
                              <td className="p-3 font-mono text-slate-600">{st.password}</td>
                              <td className="p-3 font-bold text-[#C5A059]">{st.fullName}</td>
                              <td className="p-3 text-slate-800">{st.studentClass}</td>
                              <td className="p-3 text-slate-500">{st.createdAt}</td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => handleDeleteStudentClick(st.id, st.fullName)}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded transition-colors cursor-pointer"
                                  title="Öğrenciyi Sil"
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
              )}

              {/* COACH TAB 2: EGZERSİZ RAPORLARI */}
              {coachActiveTab === 'egzersiz_raporu' && (
                <div className="bg-white p-6 rounded-2xl shadow-md border border-stone-200 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h4 className="font-serif font-bold text-lg text-slate-900">
                      Öğrenci Kaygı & Hızlı Okuma Egzersiz Raporları
                    </h4>

                    {/* Filter by student */}
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-slate-400" />
                      <select
                        value={selectedStudentFilter}
                        onChange={(e) => setSelectedStudentFilter(e.target.value)}
                        className="p-2 bg-stone-50 border border-stone-300 rounded text-xs font-bold text-slate-800"
                      >
                        <option value="all">Tüm Öğrenciler</option>
                        {studentsList.map((st) => (
                          <option key={st.username} value={st.username}>
                            {st.fullName} ({st.username})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-100 text-slate-700 uppercase font-bold border-b border-stone-200">
                        <tr>
                          <th className="p-3">Tarih</th>
                          <th className="p-3">Öğrenci</th>
                          <th className="p-3">Egzersiz Türü</th>
                          <th className="p-3">Kategori</th>
                          <th className="p-3">Süre</th>
                          <th className="p-3">Skor / WPM</th>
                          <th className="p-3 text-right">İşlem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200">
                        {exerciseLogs
                          .filter(l => selectedStudentFilter === 'all' || l.studentUsername.toLowerCase() === selectedStudentFilter.toLowerCase())
                          .map((log) => (
                            <tr key={log.id} className="hover:bg-stone-50">
                              <td className="p-3 font-bold text-slate-900">{log.date}</td>
                              <td className="p-3 font-bold text-[#C5A059]">{log.studentFullName || log.studentUsername}</td>
                              <td className="p-3 font-semibold text-slate-800">{log.exerciseTitle}</td>
                              <td className="p-3 text-slate-600">{log.categoryLabel || 'Egzersiz'}</td>
                              <td className="p-3 text-slate-700">{log.durationSeconds} sn</td>
                              <td className="p-3 font-extrabold text-emerald-700">{log.score || log.wpm} Puan</td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => handleDeleteExerciseLogClick(log.id)}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded transition-colors cursor-pointer"
                                  title="Kaydı Sil"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        {exerciseLogs.length === 0 && (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-400">
                              Henüz egzersiz performans kaydı bulunmamaktadır.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* COACH TAB 3: GÜNLÜK ÇALIŞMA RAPORLARI */}
              {coachActiveTab === 'gunluk_rapor' && (
                <div className="bg-white p-6 rounded-2xl shadow-md border border-stone-200 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h4 className="font-serif font-bold text-lg text-slate-900">
                      Öğrencilerin Günlük Çalışma Raporları
                    </h4>

                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-slate-400" />
                      <select
                        value={selectedStudentFilter}
                        onChange={(e) => setSelectedStudentFilter(e.target.value)}
                        className="p-2 bg-stone-50 border border-stone-300 rounded text-xs font-bold text-slate-800"
                      >
                        <option value="all">Tüm Öğrenciler</option>
                        {studentsList.map((st) => (
                          <option key={st.username} value={st.username}>
                            {st.fullName} ({st.username})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-100 text-slate-700 uppercase font-bold border-b border-stone-200">
                        <tr>
                          <th className="p-3">Tarih</th>
                          <th className="p-3">Öğrenci</th>
                          <th className="p-3">Ders</th>
                          <th className="p-3">Konu</th>
                          <th className="p-3">Soru Sayısı</th>
                          <th className="p-3">Doğru / Yanlış</th>
                          <th className="p-3">Süre</th>
                          <th className="p-3">Notlar</th>
                          <th className="p-3 text-right">İşlem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200">
                        {dailyLogs
                          .filter(l => selectedStudentFilter === 'all' || l.studentUsername.toLowerCase() === selectedStudentFilter.toLowerCase())
                          .map((log) => (
                            <tr key={log.id} className="hover:bg-stone-50">
                              <td className="p-3 font-bold text-slate-900">{log.date}</td>
                              <td className="p-3 font-bold text-[#C5A059]">{log.studentFullName || log.studentUsername}</td>
                              <td className="p-3 font-bold text-slate-800">{log.subject}</td>
                              <td className="p-3 text-slate-700">{log.topic}</td>
                              <td className="p-3 font-extrabold text-slate-900">{log.solvedQuestions} Soru</td>
                              <td className="p-3 font-mono">
                                <span className="text-emerald-600 font-bold">{log.correctCount ?? '-'}D</span> / <span className="text-rose-600 font-bold">{log.wrongCount ?? '-'}Y</span>
                              </td>
                              <td className="p-3 text-slate-700">{log.studyDurationMinutes} dk</td>
                              <td className="p-3 text-slate-500 max-w-xs truncate">{log.notes || '-'}</td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => handleDeleteDailyLogClick(log.id)}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded transition-colors cursor-pointer"
                                  title="Kaydı Sil"
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
              )}

              {/* COACH TAB 4: DENEME SINAVI RAPORLARI */}
              {coachActiveTab === 'deneme_rapor' && (
                <div className="bg-white p-6 rounded-2xl shadow-md border border-stone-200 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h4 className="font-serif font-bold text-lg text-slate-900">
                      Öğrencilerin Deneme Sınavı Performans Raporları
                    </h4>

                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-slate-400" />
                      <select
                        value={selectedStudentFilter}
                        onChange={(e) => setSelectedStudentFilter(e.target.value)}
                        className="p-2 bg-stone-50 border border-stone-300 rounded text-xs font-bold text-slate-800"
                      >
                        <option value="all">Tüm Öğrenciler</option>
                        {studentsList.map((st) => (
                          <option key={st.username} value={st.username}>
                            {st.fullName} ({st.username})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-100 text-slate-700 uppercase font-bold border-b border-stone-200">
                        <tr>
                          <th className="p-3">Tarih</th>
                          <th className="p-3">Öğrenci</th>
                          <th className="p-3">Deneme Sınavı</th>
                          <th className="p-3">Ders Net Detayları</th>
                          <th className="p-3">Toplam Net</th>
                          <th className="p-3">Puan</th>
                          <th className="p-3 text-right">İşlem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200">
                        {mockLogs
                          .filter(m => selectedStudentFilter === 'all' || m.studentUsername.toLowerCase() === selectedStudentFilter.toLowerCase())
                          .map((m) => (
                            <tr key={m.id} className="hover:bg-stone-50">
                              <td className="p-3 font-bold text-slate-900">{m.date}</td>
                              <td className="p-3 font-bold text-[#C5A059]">{m.studentFullName || m.studentUsername}</td>
                              <td className="p-3 font-bold text-slate-800">{m.examName}</td>
                              <td className="p-3">
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(m.subjectNets || {}).map(([sub, net]) => (
                                    <span key={sub} className="bg-stone-100 border border-stone-300 text-slate-800 text-[10px] px-1.5 py-0.5 rounded">
                                      {sub}: <strong>{net}</strong>
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="p-3 font-black text-emerald-700 text-sm">{m.totalNet} Net</td>
                              <td className="p-3 font-extrabold text-slate-900">{m.score} Puan</td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => handleDeleteMockLogClick(m.id)}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded transition-colors cursor-pointer"
                                  title="Kaydı Sil"
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
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
