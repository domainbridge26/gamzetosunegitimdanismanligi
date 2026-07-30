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
