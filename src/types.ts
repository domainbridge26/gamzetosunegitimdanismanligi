export interface Service {
  id: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  iconName: string;
  features: string[];
  benefits: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: 'Öğrenci' | 'Veli' | 'Öğretmen';
  examType?: 'YKS' | 'LGS' | 'KPSS' | 'AGS' | 'Hızlı Okuma' | 'Genel';
  achievement: string;
  comment: string;
  avatarUrl?: string;
  approved?: boolean;
  createdAt?: string;
  adminReply?: string;
  replyDate?: string;
}

export interface ContactSubmission {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  studentClass: string; // e.g. "8. Sınıf (LGS)", "12. Sınıf (YKS)", "Mezun", "Diğer"
  selectedService: string;
  message: string;
  createdAt: string;
  status: 'Yeni' | 'Görüşüldü' | 'Arşivlendi';
}

export interface SpeedTestText {
  id: string;
  title: string;
  category: 'Motivasyon' | 'Teknik' | 'Hikaye';
  content: string;
  wordCount: number;
  quiz: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
}

export interface YksExamInput {
  turkce: number;
  sosyal: number;
  matematik: number;
  fen: number;
  obp: number; // Ortaöğretim Başarı Puanı
  isSayisal: boolean;
  isEsitAgirlik: boolean;
  isSozel: boolean;
}

export interface LgsExamInput {
  turkce: number;
  matematik: number;
  fen: number;
  inkilap: number;
  din: number;
  yabanciDil: number;
}

export interface StudentAccount {
  id: string;
  username: string;
  password: string;
  fullName: string;
  studentClass: string; // e.g. "4. Sınıf (İlkokul)", "8. Sınıf (LGS)", "12. Sınıf (YKS)"
  createdAt: string;
  lastLogin?: string;
}

export interface StudentExerciseLog {
  id: string;
  studentId?: string;
  studentUsername: string;
  studentFullName?: string;
  exerciseId: string;
  exerciseTitle: string;
  categoryLabel?: string;
  level?: string;
  date: string; // Turkish formatted date-time e.g. "29.07.2026 14:30:15"
  durationSeconds: number; // e.g. 45
  wpm: number; // Reading speed / WPM achieved
  accuracy: number; // Accuracy percentage (0-100)
  score: number; // Overall performance score (0-100)
  effectiveWpm?: number;
}

export interface ExerciseResult {
  exerciseId: string;
  exerciseTitle: string;
  wpm: number;
  comprehensionRate: number; // percentage (0-100)
  effectiveWpm: number; // wpm * comprehensionRate / 100
  score: number; // 0-100
  timeSeconds: number;
  date: string;
}

export interface DailyStudyLog {
  id: string;
  studentUsername: string;
  studentFullName: string;
  studentClass: 'İLOKUL' | 'LGS' | 'YKS' | string;
  date: string; // Turkish formatted date "29.07.2026"
  subject: string; // e.g. "Matematik", "Türkçe"
  topic: string; // e.g. "Paragrafta Anlama", "Üslü Sayılar"
  solvedQuestions: number; // e.g. 80
  correctCount?: number;
  wrongCount?: number;
  emptyCount?: number;
  studyDurationMinutes: number; // e.g. 60
  notes?: string;
  createdAt?: string;
}

export interface MockExamLog {
  id: string;
  studentUsername: string;
  studentFullName: string;
  studentClass: 'İLKOKUL' | 'LGS' | 'YKS' | string;
  examName: string; // e.g. "Özdebir Türkiye Geneli LGS-1"
  date: string; // "29.07.2026"
  groupType: 'İLKOKUL' | 'LGS' | 'YKS';
  // Subject net scores stored dynamically as object key-value pair e.g. { "Türkçe": 18.5, "Matematik": 15.0 }
  subjectNets: Record<string, number>;
  totalNet: number;
  score: number; // Final score e.g. 465.50
  targetScore?: number;
  notes?: string;
  createdAt?: string;
}

export interface CurriculumProgress {
  studentUsername: string;
  completedTopics: string[]; // List of topic keys/IDs completed by the student
  updatedAt: string;
}

