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
  role: 'Öğrenci' | 'Veli';
  examType?: 'YKS' | 'LGS' | 'Hızlı Okuma' | 'Genel';
  achievement: string;
  comment: string;
  avatarUrl?: string;
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
