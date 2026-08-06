import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  writeBatch,
  getDoc,
  setDoc,
  increment,
  onSnapshot
} from 'firebase/firestore';
import { ContactSubmission, Testimonial } from '../types';
import { TESTIMONIALS_DATA } from '../data';

const firebaseConfig = {
  apiKey: "AIzaSyBjOV8hJ0HZAyg_b6tifNMmS4RoGJ8qs_8",
  authDomain: "subtle-yeti-l40ks.firebaseapp.com",
  projectId: "subtle-yeti-l40ks",
  storageBucket: "subtle-yeti-l40ks.firebasestorage.app",
  messagingSenderId: "1079342048828",
  appId: "1:1079342048828:web:4f15e77e795553f7ba0539"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, "ai-studio-gamzetosuneitimd-ec7309c5-c6da-400a-9022-5be8f3874638");

// ==========================================
// INQUIRIES (Contact Submissions) SERVICES
// ==========================================

// Track whether the last load succeeded from Firestore or fell back to local storage
export let isLoadedFromCloud = false;

export async function dbGetInquiries(): Promise<ContactSubmission[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'inquiries'));
    const result: ContactSubmission[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      result.push({
        id: docSnap.id,
        fullName: data.fullName || '',
        phone: data.phone || '',
        email: data.email || '',
        studentClass: data.studentClass || '',
        selectedService: data.selectedService || '',
        message: data.message || '',
        createdAt: data.createdAt || '',
        status: data.status || 'Yeni'
      });
    });

    // Sort in memory by parsed date or createdAt string descending
    result.sort((a, b) => {
      const dateA = a.createdAt ? parseTurkishDateTime(a.createdAt) : 0;
      const dateB = b.createdAt ? parseTurkishDateTime(b.createdAt) : 0;
      return dateB - dateA;
    });

    isLoadedFromCloud = true;
    return result;
  } catch (error) {
    console.error('Failed to fetch inquiries from Firestore, falling back to localStorage:', error);
    isLoadedFromCloud = false;
    const raw = localStorage.getItem('gamze_inquiries');
    return raw ? JSON.parse(raw) : [];
  }
}

// Simple date parser helper for "12.07.2026 11:32:09" style Turkish date-time strings
function parseTurkishDateTime(str: string): number {
  try {
    const parts = str.split(' ');
    if (parts.length >= 1) {
      const dateParts = parts[0].split('.');
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const year = parseInt(dateParts[2], 10);
        
        let hours = 0, minutes = 0, seconds = 0;
        if (parts[1]) {
          const timeParts = parts[1].split(':');
          hours = parseInt(timeParts[0] || '0', 10);
          minutes = parseInt(timeParts[1] || '0', 10);
          seconds = parseInt(timeParts[2] || '0', 10);
        }
        return new Date(year, month, day, hours, minutes, seconds).getTime();
      }
    }
  } catch (e) {
    // Fallback
  }
  const parsed = Date.parse(str);
  return isNaN(parsed) ? 0 : parsed;
}

export async function dbAddInquiry(inquiry: Omit<ContactSubmission, 'id'>): Promise<ContactSubmission> {
  try {
    const docRef = await addDoc(collection(db, 'inquiries'), {
      ...inquiry,
      createdAt: inquiry.createdAt || new Date().toLocaleString('tr-TR')
    });
    const newInq = { ...inquiry, id: docRef.id };
    
    // Also update local storage for smooth transition/caching
    try {
      const raw = localStorage.getItem('gamze_inquiries');
      const local: ContactSubmission[] = raw ? JSON.parse(raw) : [];
      local.unshift(newInq);
      localStorage.setItem('gamze_inquiries', JSON.stringify(local));
    } catch (e) {
      console.error(e);
    }
    
    return newInq;
  } catch (error) {
    console.error('Failed to add inquiry to Firestore, saving to localStorage:', error);
    // Local fallback
    const id = Math.random().toString(36).substring(2, 9);
    const newInq = { ...inquiry, id };
    const raw = localStorage.getItem('gamze_inquiries');
    const local: ContactSubmission[] = raw ? JSON.parse(raw) : [];
    local.unshift(newInq);
    localStorage.setItem('gamze_inquiries', JSON.stringify(local));
    return newInq;
  }
}

export async function dbUpdateInquiryStatus(id: string, status: 'Yeni' | 'Görüşüldü' | 'Arşivlendi'): Promise<void> {
  try {
    const ref = doc(db, 'inquiries', id);
    await updateDoc(ref, { status });
  } catch (error) {
    console.error(`Failed to update inquiry status in Firestore for ${id}:`, error);
  }
  
  // Always update local storage as fallback/cache
  try {
    const raw = localStorage.getItem('gamze_inquiries');
    if (raw) {
      const local: ContactSubmission[] = JSON.parse(raw);
      const updated = local.map(item => item.id === id ? { ...item, status } : item);
      localStorage.setItem('gamze_inquiries', JSON.stringify(updated));
    }
  } catch (e) {
    console.error(e);
  }
}

export async function dbDeleteInquiry(id: string): Promise<void> {
  try {
    const ref = doc(db, 'inquiries', id);
    await deleteDoc(ref);
  } catch (error) {
    console.error(`Failed to delete inquiry in Firestore:`, error);
  }

  // Always update local storage
  try {
    const raw = localStorage.getItem('gamze_inquiries');
    if (raw) {
      const local: ContactSubmission[] = JSON.parse(raw);
      const updated = local.filter(item => item.id !== id);
      localStorage.setItem('gamze_inquiries', JSON.stringify(updated));
    }
  } catch (e) {
    console.error(e);
  }
}

export async function dbClearAllInquiries(): Promise<void> {
  try {
    const q = query(collection(db, 'inquiries'));
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    querySnapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  } catch (error) {
    console.error('Failed to clear inquiries in Firestore:', error);
  }
  localStorage.removeItem('gamze_inquiries');
}

// ==========================================
// TESTIMONIALS (Yorumlar) SERVICES
// ==========================================

export async function dbGetTestimonials(): Promise<Testimonial[]> {
  try {
    const q = query(collection(db, 'testimonials'));
    const querySnapshot = await getDocs(q);
    const result: Testimonial[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      result.push({
        id: docSnap.id,
        name: data.name || '',
        role: data.role || 'Öğrenci',
        examType: data.examType || 'Genel',
        achievement: data.achievement || '',
        comment: data.comment || '',
        avatarUrl: data.avatarUrl || '',
        approved: data.approved !== undefined ? data.approved : true,
        createdAt: data.createdAt || new Date(2026, 0, 1).toISOString(),
        adminReply: data.adminReply || '',
        replyDate: data.replyDate || ''
      });
    });

    if (result.length === 0) {
      // If Firestore is empty, seed it with initial TESTIMONIALS_DATA so the site looks gorgeous
      console.log('Testimonials is empty in Firestore, seeding default data...');
      const batch = writeBatch(db);
      // We will seed them with a staggered createdAt date so they maintain original order at the bottom
      TESTIMONIALS_DATA.forEach((item, index) => {
        const docRef = doc(collection(db, 'testimonials'));
        const createdAtDate = new Date(2026, 0, 1, 0, 0, 100 - index).toISOString();
        batch.set(docRef, {
          name: item.name,
          role: item.role,
          examType: item.examType || 'Genel',
          achievement: item.achievement,
          comment: item.comment,
          avatarUrl: item.avatarUrl || '',
          approved: true,
          createdAt: createdAtDate,
          adminReply: '',
          replyDate: ''
        });
        result.push({ 
          ...item, 
          id: docRef.id, 
          approved: true, 
          createdAt: createdAtDate,
          adminReply: '',
          replyDate: ''
        });
      });
      await batch.commit();
    }
    
    // Sort testimonials descending by createdAt (newest at the top)
    result.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return result;
  } catch (error) {
    console.error('Failed to fetch testimonials from Firestore, falling back to local:', error);
    const raw = localStorage.getItem('gamze_testimonials');
    const localList: Testimonial[] = raw ? JSON.parse(raw) : TESTIMONIALS_DATA;
    // Sort local copy too just in case
    localList.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    return localList;
  }
}

export async function dbAddTestimonial(testimonial: Omit<Testimonial, 'id'>): Promise<Testimonial> {
  const nowStr = new Date().toISOString();
  try {
    const docRef = await addDoc(collection(db, 'testimonials'), {
      ...testimonial,
      approved: testimonial.approved !== undefined ? testimonial.approved : false,
      createdAt: testimonial.createdAt || nowStr,
      adminReply: testimonial.adminReply || '',
      replyDate: testimonial.replyDate || ''
    });
    const newTest: Testimonial = { 
      ...testimonial, 
      id: docRef.id, 
      approved: testimonial.approved !== undefined ? testimonial.approved : false,
      createdAt: testimonial.createdAt || nowStr,
      adminReply: testimonial.adminReply || '',
      replyDate: testimonial.replyDate || ''
    };
    
    // Update local storage
    try {
      const raw = localStorage.getItem('gamze_testimonials');
      const local: Testimonial[] = raw ? JSON.parse(raw) : TESTIMONIALS_DATA;
      local.unshift(newTest);
      localStorage.setItem('gamze_testimonials', JSON.stringify(local));
    } catch (e) {
      console.error(e);
    }
    
    return newTest;
  } catch (error) {
    console.error('Failed to add testimonial to Firestore, saving to local:', error);
    const id = Math.random().toString(36).substring(2, 9);
    const newTest: Testimonial = { 
      ...testimonial, 
      id, 
      approved: false, 
      createdAt: testimonial.createdAt || nowStr,
      adminReply: testimonial.adminReply || '',
      replyDate: testimonial.replyDate || ''
    };
    const raw = localStorage.getItem('gamze_testimonials');
    const local: Testimonial[] = raw ? JSON.parse(raw) : TESTIMONIALS_DATA;
    local.unshift(newTest);
    localStorage.setItem('gamze_testimonials', JSON.stringify(local));
    return newTest;
  }
}

export async function dbApproveTestimonial(id: string): Promise<void> {
  try {
    const ref = doc(db, 'testimonials', id);
    await updateDoc(ref, { approved: true });
  } catch (error) {
    console.error(`Failed to approve testimonial ${id} in Firestore:`, error);
  }

  // Update local storage
  try {
    const raw = localStorage.getItem('gamze_testimonials');
    const local: Testimonial[] = raw ? JSON.parse(raw) : TESTIMONIALS_DATA;
    const updated = local.map(item => item.id === id ? { ...item, approved: true } : item);
    localStorage.setItem('gamze_testimonials', JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
}

export async function dbReplyToTestimonial(id: string, replyText: string): Promise<void> {
  const replyDate = new Date().toISOString();
  try {
    const ref = doc(db, 'testimonials', id);
    await updateDoc(ref, { 
      adminReply: replyText,
      replyDate: replyDate
    });
  } catch (error) {
    console.error(`Failed to reply to testimonial ${id} in Firestore:`, error);
  }

  // Update local storage
  try {
    const raw = localStorage.getItem('gamze_testimonials');
    const local: Testimonial[] = raw ? JSON.parse(raw) : TESTIMONIALS_DATA;
    const updated = local.map(item => item.id === id ? { ...item, adminReply: replyText, replyDate: replyDate } : item);
    localStorage.setItem('gamze_testimonials', JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
}

export async function dbDeleteTestimonial(id: string): Promise<void> {
  try {
    const ref = doc(db, 'testimonials', id);
    await deleteDoc(ref);
  } catch (error) {
    console.error(`Failed to delete testimonial ${id} in Firestore:`, error);
  }

  // Update local storage
  try {
    const raw = localStorage.getItem('gamze_testimonials');
    const local: Testimonial[] = raw ? JSON.parse(raw) : TESTIMONIALS_DATA;
    const updated = local.filter(item => item.id !== id);
    localStorage.setItem('gamze_testimonials', JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
}

export async function dbResetTestimonials(): Promise<Testimonial[]> {
  try {
    const q = query(collection(db, 'testimonials'));
    const querySnapshot = await getDocs(q);
    const batchDelete = writeBatch(db);
    querySnapshot.forEach((docSnap) => {
      batchDelete.delete(docSnap.ref);
    });
    await batchDelete.commit();

    const batchSeed = writeBatch(db);
    const seededList: Testimonial[] = [];
    TESTIMONIALS_DATA.forEach((item, index) => {
      const docRef = doc(collection(db, 'testimonials'));
      const createdAtDate = new Date(2026, 0, 1, 0, 0, 100 - index).toISOString();
      batchSeed.set(docRef, {
        name: item.name,
        role: item.role,
        examType: item.examType || 'Genel',
        achievement: item.achievement,
        comment: item.comment,
        avatarUrl: item.avatarUrl || '',
        approved: true,
        createdAt: createdAtDate,
        adminReply: '',
        replyDate: ''
      });
      seededList.push({ 
        ...item, 
        id: docRef.id, 
        approved: true, 
        createdAt: createdAtDate,
        adminReply: '',
        replyDate: ''
      });
    });
    await batchSeed.commit();

    localStorage.setItem('gamze_testimonials', JSON.stringify(seededList));
    return seededList;
  } catch (error) {
    console.error('Failed to reset testimonials in Firestore:', error);
    localStorage.setItem('gamze_testimonials', JSON.stringify(TESTIMONIALS_DATA));
    return TESTIMONIALS_DATA;
  }
}

// ==========================================
// ANALYTICS (Görüntülenme Sayıları) SERVICES
// ==========================================

export interface PageViews {
  todayViews: number;
  totalViews: number;
}

export async function dbIncrementPageViews(): Promise<void> {
  // Prevent duplicate increment in the same browser session
  if (sessionStorage.getItem('gamze_session_view_registered')) {
    return;
  }
  
  try {
    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local timezone date format
    
    const overallRef = doc(db, 'analytics', 'overall');
    const dailyRef = doc(db, 'analytics', `daily_${todayStr}`);
    
    // Atomically increment the counters
    const batch = writeBatch(db);
    batch.set(overallRef, { totalViews: increment(1) }, { merge: true });
    batch.set(dailyRef, { date: todayStr, views: increment(1) }, { merge: true });
    
    await batch.commit();
    sessionStorage.setItem('gamze_session_view_registered', 'true');
  } catch (error) {
    console.error('Failed to increment page views:', error);
  }
}

export function dbSubscribeToPageViews(callback: (views: PageViews) => void): () => void {
  const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  
  const overallRef = doc(db, 'analytics', 'overall');
  const dailyRef = doc(db, 'analytics', `daily_${todayStr}`);
  
  let totalViewsVal = 0;
  let todayViewsVal = 0;
  
  const triggerCallback = () => {
    callback({ todayViews: todayViewsVal, totalViews: totalViewsVal });
  };

  const unsubOverall = onSnapshot(overallRef, (docSnap) => {
    if (docSnap.exists()) {
      totalViewsVal = docSnap.data().totalViews || 0;
    }
    triggerCallback();
  }, (error) => {
    console.error("Failed to subscribe overall views:", error);
  });
  
  const unsubDaily = onSnapshot(dailyRef, (docSnap) => {
    if (docSnap.exists()) {
      todayViewsVal = docSnap.data().views || 0;
    }
    triggerCallback();
  }, (error) => {
    console.error("Failed to subscribe daily views:", error);
  });
  
  return () => {
    unsubOverall();
    unsubDaily();
  };
}

// ==========================================
// STUDENT ACCOUNTS MANAGEMENT SERVICES
// ==========================================

import { StudentAccount, StudentExerciseLog, DailyStudyLog, MockExamLog, CurriculumProgress } from '../types';

export const DEFAULT_STUDENT_LOGS: StudentExerciseLog[] = [
  {
    id: 'log-1',
    studentUsername: 'lgs_ogrenci',
    studentFullName: 'Ahmet Yılmaz',
    exerciseId: 'o-om-1',
    exerciseTitle: 'LGS Paragraf Odak & Hız Metni',
    categoryLabel: 'Okuma Metni',
    level: 'Ortaokul',
    date: '28.07.2026 15:40:12',
    durationSeconds: 180,
    wpm: 280,
    accuracy: 90,
    score: 88,
    effectiveWpm: 252
  },
  {
    id: 'log-2',
    studentUsername: 'lgs_ogrenci',
    studentFullName: 'Ahmet Yılmaz',
    exerciseId: 'o-sc-1',
    exerciseTitle: 'Schulte Tablosu 4x4 (1-16)',
    categoryLabel: 'Sayı Çalışması',
    level: 'Ortaokul',
    date: '28.07.2026 15:45:00',
    durationSeconds: 42,
    wpm: 290,
    accuracy: 100,
    score: 95,
    effectiveWpm: 290
  },
  {
    id: 'log-3',
    studentUsername: 'lgs_ogrenci',
    studentFullName: 'Ahmet Yılmaz',
    exerciseId: 'o-gt-1',
    exerciseTitle: 'LGS Zikzak Göz Sıçraması',
    categoryLabel: 'Göz Takip',
    level: 'Ortaokul',
    date: '29.07.2026 10:15:30',
    durationSeconds: 120,
    wpm: 310,
    accuracy: 95,
    score: 92,
    effectiveWpm: 294
  },
  {
    id: 'log-4',
    studentUsername: 'yks_ogrenci',
    studentFullName: 'Zeynep Kaya',
    exerciseId: 'l-bm-1',
    exerciseTitle: 'YKS Edebiyat & Felsefe Anagramı',
    categoryLabel: 'Bulmaca',
    level: 'Lise',
    date: '27.07.2026 18:20:00',
    durationSeconds: 240,
    wpm: 350,
    accuracy: 95,
    score: 94,
    effectiveWpm: 332
  },
  {
    id: 'log-5',
    studentUsername: 'yks_ogrenci',
    studentFullName: 'Zeynep Kaya',
    exerciseId: 'l-om-1',
    exerciseTitle: 'YKS Paragraf & Akademik Odak Metni',
    categoryLabel: 'Okuma Metni',
    level: 'Lise',
    date: '28.07.2026 19:10:15',
    durationSeconds: 300,
    wpm: 380,
    accuracy: 92,
    score: 91,
    effectiveWpm: 350
  },
  {
    id: 'log-6',
    studentUsername: 'yks_ogrenci',
    studentFullName: 'Zeynep Kaya',
    exerciseId: 'l-st-1',
    exerciseTitle: 'YKS Blok Sütun Takip (Dikey Çift)',
    categoryLabel: 'Sütun Takip',
    level: 'Lise',
    date: '29.07.2026 11:30:00',
    durationSeconds: 150,
    wpm: 410,
    accuracy: 98,
    score: 96,
    effectiveWpm: 401
  },
  {
    id: 'log-7',
    studentUsername: 'ilkokul_ogrenci',
    studentFullName: 'Caner Demir',
    exerciseId: 'i-hc-1',
    exerciseTitle: 'İlkokul Ritmik Hece Flaşör Çalışması',
    categoryLabel: 'Hece Çalışması',
    level: 'İlkokul',
    date: '28.07.2026 14:10:00',
    durationSeconds: 90,
    wpm: 160,
    accuracy: 100,
    score: 90,
    effectiveWpm: 160
  },
  {
    id: 'log-8',
    studentUsername: 'ilkokul_ogrenci',
    studentFullName: 'Caner Demir',
    exerciseId: 'i-sc-2',
    exerciseTitle: 'Schulte Tablosu 3x3 (1-9 Sayı Avı)',
    categoryLabel: 'Sayı Çalışması',
    level: 'İlkokul',
    date: '29.07.2026 09:50:00',
    durationSeconds: 35,
    wpm: 180,
    accuracy: 100,
    score: 92,
    effectiveWpm: 180
  }
];

export const DEFAULT_SPEED_READING_STUDENTS: StudentAccount[] = [
  {
    id: 'sr-1',
    username: 'hayriyenisaşark',
    password: '123456',
    fullName: 'Hayriye Nisa Şark',
    studentClass: '8. Sınıf (LGS)',
    createdAt: new Date().toLocaleDateString('tr-TR')
  },
  {
    id: 'sr-2',
    username: 'lgs_ogrenci',
    password: 'Lgs!Ogrenci#2026',
    fullName: 'Ahmet Yılmaz',
    studentClass: '8. Sınıf (LGS)',
    createdAt: new Date().toLocaleDateString('tr-TR')
  },
  {
    id: 'sr-3',
    username: 'yks_ogrenci',
    password: 'Yks!Ogrenci#2026',
    fullName: 'Zeynep Kaya',
    studentClass: '12. Sınıf (YKS)',
    createdAt: new Date().toLocaleDateString('tr-TR')
  },
  {
    id: 'sr-4',
    username: 'ilkokul_ogrenci',
    password: 'Ilkokul!Ogrenci#2026',
    fullName: 'Caner Demir',
    studentClass: '4. Sınıf (İlkokul)',
    createdAt: new Date().toLocaleDateString('tr-TR')
  }
];

export const DEFAULT_COACHING_STUDENTS: StudentAccount[] = [
  {
    id: 'coach-st-1',
    username: 'lgs_ogrenci',
    password: 'Lgs!Ogrenci#2026',
    fullName: 'Ahmet Yılmaz',
    studentClass: '8. Sınıf (LGS)',
    createdAt: new Date().toLocaleDateString('tr-TR')
  },
  {
    id: 'coach-st-2',
    username: 'yks_ogrenci',
    password: 'Yks!Ogrenci#2026',
    fullName: 'Zeynep Kaya',
    studentClass: '12. Sınıf (YKS)',
    createdAt: new Date().toLocaleDateString('tr-TR')
  },
  {
    id: 'coach-st-3',
    username: 'ilkokul_ogrenci',
    password: 'Ilkokul!Ogrenci#2026',
    fullName: 'Caner Demir',
    studentClass: '4. Sınıf (İlkokul)',
    createdAt: new Date().toLocaleDateString('tr-TR')
  }
];

// Backward compatible default alias
export const DEFAULT_STUDENTS: StudentAccount[] = DEFAULT_SPEED_READING_STUDENTS;

// ==========================================
// SPEED READING STUDENT SERVICES
// ==========================================

export async function dbGetStudents(): Promise<StudentAccount[]> {
  return dbGetSpeedReadingStudents();
}

export async function dbGetSpeedReadingStudents(): Promise<StudentAccount[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'speed_reading_students'));
    const result: StudentAccount[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      result.push({
        id: docSnap.id,
        username: data.username || '',
        password: data.password || '',
        fullName: data.fullName || '',
        studentClass: data.studentClass || 'Ortaokul',
        createdAt: data.createdAt || new Date().toLocaleDateString('tr-TR'),
        lastLogin: data.lastLogin
      });
    });

    if (result.length === 0) {
      const batch = writeBatch(db);
      DEFAULT_SPEED_READING_STUDENTS.forEach((st) => {
        const docRef = doc(db, 'speed_reading_students', st.id);
        batch.set(docRef, st);
      });
      await batch.commit();
      localStorage.setItem('gamze_speed_reading_students', JSON.stringify(DEFAULT_SPEED_READING_STUDENTS));
      return DEFAULT_SPEED_READING_STUDENTS;
    }

    localStorage.setItem('gamze_speed_reading_students', JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('Failed to fetch speed reading students from Firestore:', error);
    const raw = localStorage.getItem('gamze_speed_reading_students');
    return raw ? JSON.parse(raw) : DEFAULT_SPEED_READING_STUDENTS;
  }
}

export async function dbAddStudent(student: Omit<StudentAccount, 'id'>): Promise<StudentAccount> {
  return dbAddSpeedReadingStudent(student);
}

export async function dbAddSpeedReadingStudent(student: Omit<StudentAccount, 'id'>): Promise<StudentAccount> {
  const newStudentData = {
    ...student,
    createdAt: student.createdAt || new Date().toLocaleDateString('tr-TR')
  };
  try {
    const docRef = await addDoc(collection(db, 'speed_reading_students'), newStudentData);
    const created: StudentAccount = { ...newStudentData, id: docRef.id };
    
    const raw = localStorage.getItem('gamze_speed_reading_students');
    const local: StudentAccount[] = raw ? JSON.parse(raw) : DEFAULT_SPEED_READING_STUDENTS;
    local.push(created);
    localStorage.setItem('gamze_speed_reading_students', JSON.stringify(local));
    return created;
  } catch (error) {
    console.error('Failed to add speed reading student to Firestore:', error);
    const id = 'sr-' + Math.random().toString(36).substring(2, 8);
    const created: StudentAccount = { ...newStudentData, id };
    const raw = localStorage.getItem('gamze_speed_reading_students');
    const local: StudentAccount[] = raw ? JSON.parse(raw) : DEFAULT_SPEED_READING_STUDENTS;
    local.push(created);
    localStorage.setItem('gamze_speed_reading_students', JSON.stringify(local));
    return created;
  }
}

export async function dbUpdateStudent(id: string, updates: Partial<StudentAccount>): Promise<void> {
  return dbUpdateSpeedReadingStudent(id, updates);
}

export async function dbUpdateSpeedReadingStudent(id: string, updates: Partial<StudentAccount>): Promise<void> {
  try {
    const ref = doc(db, 'speed_reading_students', id);
    await updateDoc(ref, updates);
  } catch (error) {
    console.error(`Failed to update speed reading student ${id} in Firestore:`, error);
  }

  try {
    const raw = localStorage.getItem('gamze_speed_reading_students');
    if (raw) {
      const local: StudentAccount[] = JSON.parse(raw);
      const updated = local.map(st => st.id === id ? { ...st, ...updates } : st);
      localStorage.setItem('gamze_speed_reading_students', JSON.stringify(updated));
    }
  } catch (e) {
    console.error(e);
  }
}

export async function dbDeleteStudent(id: string): Promise<void> {
  return dbDeleteSpeedReadingStudent(id);
}

export async function dbDeleteSpeedReadingStudent(id: string): Promise<void> {
  try {
    const ref = doc(db, 'speed_reading_students', id);
    await deleteDoc(ref);
  } catch (error) {
    console.error(`Failed to delete speed reading student ${id} in Firestore:`, error);
  }

  try {
    const raw = localStorage.getItem('gamze_speed_reading_students');
    if (raw) {
      const local: StudentAccount[] = JSON.parse(raw);
      const updated = local.filter(st => st.id !== id);
      localStorage.setItem('gamze_speed_reading_students', JSON.stringify(updated));
    }
  } catch (e) {
    console.error(e);
  }
}

// ==========================================
// COACHING STUDENT SERVICES
// ==========================================

export async function dbGetCoachingStudents(): Promise<StudentAccount[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'coaching_students'));
    const result: StudentAccount[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      result.push({
        id: docSnap.id,
        username: data.username || '',
        password: data.password || '',
        fullName: data.fullName || '',
        studentClass: data.studentClass || 'Ortaokul',
        createdAt: data.createdAt || new Date().toLocaleDateString('tr-TR'),
        lastLogin: data.lastLogin
      });
    });

    if (result.length === 0) {
      const batch = writeBatch(db);
      DEFAULT_COACHING_STUDENTS.forEach((st) => {
        const docRef = doc(db, 'coaching_students', st.id);
        batch.set(docRef, st);
      });
      await batch.commit();
      localStorage.setItem('gamze_coaching_students', JSON.stringify(DEFAULT_COACHING_STUDENTS));
      return DEFAULT_COACHING_STUDENTS;
    }

    localStorage.setItem('gamze_coaching_students', JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('Failed to fetch coaching students from Firestore:', error);
    const raw = localStorage.getItem('gamze_coaching_students');
    return raw ? JSON.parse(raw) : DEFAULT_COACHING_STUDENTS;
  }
}

export async function dbAddCoachingStudent(student: Omit<StudentAccount, 'id'>): Promise<StudentAccount> {
  const newStudentData = {
    ...student,
    createdAt: student.createdAt || new Date().toLocaleDateString('tr-TR')
  };
  try {
    const docRef = await addDoc(collection(db, 'coaching_students'), newStudentData);
    const created: StudentAccount = { ...newStudentData, id: docRef.id };
    
    const raw = localStorage.getItem('gamze_coaching_students');
    const local: StudentAccount[] = raw ? JSON.parse(raw) : DEFAULT_COACHING_STUDENTS;
    local.push(created);
    localStorage.setItem('gamze_coaching_students', JSON.stringify(local));
    return created;
  } catch (error) {
    console.error('Failed to add coaching student to Firestore:', error);
    const id = 'coach-st-' + Math.random().toString(36).substring(2, 8);
    const created: StudentAccount = { ...newStudentData, id };
    const raw = localStorage.getItem('gamze_coaching_students');
    const local: StudentAccount[] = raw ? JSON.parse(raw) : DEFAULT_COACHING_STUDENTS;
    local.push(created);
    localStorage.setItem('gamze_coaching_students', JSON.stringify(local));
    return created;
  }
}

export async function dbUpdateCoachingStudent(id: string, updates: Partial<StudentAccount>): Promise<void> {
  try {
    const ref = doc(db, 'coaching_students', id);
    await updateDoc(ref, updates);
  } catch (error) {
    console.error(`Failed to update coaching student ${id} in Firestore:`, error);
  }

  try {
    const raw = localStorage.getItem('gamze_coaching_students');
    if (raw) {
      const local: StudentAccount[] = JSON.parse(raw);
      const updated = local.map(st => st.id === id ? { ...st, ...updates } : st);
      localStorage.setItem('gamze_coaching_students', JSON.stringify(updated));
    }
  } catch (e) {
    console.error(e);
  }
}

export async function dbDeleteCoachingStudent(id: string): Promise<void> {
  try {
    const ref = doc(db, 'coaching_students', id);
    await deleteDoc(ref);
  } catch (error) {
    console.error(`Failed to delete coaching student ${id} in Firestore:`, error);
  }

  try {
    const raw = localStorage.getItem('gamze_coaching_students');
    if (raw) {
      const local: StudentAccount[] = JSON.parse(raw);
      const updated = local.filter(st => st.id !== id);
      localStorage.setItem('gamze_coaching_students', JSON.stringify(updated));
    }
  } catch (e) {
    console.error(e);
  }
}

// ==========================================
// STUDENT EXERCISE LOGS & PROGRESS SERVICES
// ==========================================

export async function dbGetStudentLogs(targetUsername?: string): Promise<StudentExerciseLog[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'student_logs'));
    let result: StudentExerciseLog[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      result.push({
        id: docSnap.id,
        studentId: data.studentId || '',
        studentUsername: data.studentUsername || '',
        studentFullName: data.studentFullName || '',
        exerciseId: data.exerciseId || '',
        exerciseTitle: data.exerciseTitle || '',
        categoryLabel: data.categoryLabel || 'Genel Egzersiz',
        level: data.level || 'Ortaokul',
        date: data.date || new Date().toLocaleString('tr-TR'),
        durationSeconds: data.durationSeconds !== undefined ? Number(data.durationSeconds) : 60,
        wpm: data.wpm !== undefined ? Number(data.wpm) : 200,
        accuracy: data.accuracy !== undefined ? Number(data.accuracy) : 95,
        score: data.score !== undefined ? Number(data.score) : 90,
        effectiveWpm: data.effectiveWpm !== undefined ? Number(data.effectiveWpm) : undefined
      });
    });

    if (result.length === 0) {
      // Seed default logs to Firestore
      const batch = writeBatch(db);
      DEFAULT_STUDENT_LOGS.forEach((log) => {
        const docRef = doc(db, 'student_logs', log.id);
        batch.set(docRef, log);
      });
      await batch.commit();
      localStorage.setItem('gamze_student_logs', JSON.stringify(DEFAULT_STUDENT_LOGS));
      result = DEFAULT_STUDENT_LOGS;
    } else {
      localStorage.setItem('gamze_student_logs', JSON.stringify(result));
    }

    if (targetUsername) {
      result = result.filter(log => log.studentUsername.toLowerCase() === targetUsername.toLowerCase());
    }

    // Sort descending by date (newest first)
    result.sort((a, b) => {
      const timeA = parseTurkishDateTime(a.date);
      const timeB = parseTurkishDateTime(b.date);
      return timeB - timeA;
    });

    return result;
  } catch (error) {
    console.error('Failed to fetch student logs from Firestore, using local storage:', error);
    const raw = localStorage.getItem('gamze_student_logs');
    let local: StudentExerciseLog[] = raw ? JSON.parse(raw) : DEFAULT_STUDENT_LOGS;
    if (targetUsername) {
      local = local.filter(log => log.studentUsername.toLowerCase() === targetUsername.toLowerCase());
    }
    local.sort((a, b) => {
      const timeA = parseTurkishDateTime(a.date);
      const timeB = parseTurkishDateTime(b.date);
      return timeB - timeA;
    });
    return local;
  }
}

export async function dbAddStudentLog(logData: Omit<StudentExerciseLog, 'id'>): Promise<StudentExerciseLog> {
  const fullLog = {
    ...logData,
    date: logData.date || new Date().toLocaleString('tr-TR')
  };
  try {
    const docRef = await addDoc(collection(db, 'student_logs'), fullLog);
    const created: StudentExerciseLog = { ...fullLog, id: docRef.id };
    
    // Update local cache
    try {
      const raw = localStorage.getItem('gamze_student_logs');
      const local: StudentExerciseLog[] = raw ? JSON.parse(raw) : DEFAULT_STUDENT_LOGS;
      local.unshift(created);
      localStorage.setItem('gamze_student_logs', JSON.stringify(local));
    } catch(e) {}

    return created;
  } catch (error) {
    console.error('Failed to add student log to Firestore, saving to local storage:', error);
    const id = 'log-' + Math.random().toString(36).substring(2, 8);
    const created: StudentExerciseLog = { ...fullLog, id };
    const raw = localStorage.getItem('gamze_student_logs');
    const local: StudentExerciseLog[] = raw ? JSON.parse(raw) : DEFAULT_STUDENT_LOGS;
    local.unshift(created);
    localStorage.setItem('gamze_student_logs', JSON.stringify(local));
    return created;
  }
}

export async function dbUpdateStudentLog(id: string, updates: Partial<StudentExerciseLog>): Promise<void> {
  try {
    const ref = doc(db, 'student_logs', id);
    await updateDoc(ref, updates);
  } catch (error) {
    console.error(`Failed to update student log ${id} in Firestore:`, error);
  }

  try {
    const raw = localStorage.getItem('gamze_student_logs');
    if (raw) {
      const local: StudentExerciseLog[] = JSON.parse(raw);
      const updated = local.map(item => item.id === id ? { ...item, ...updates } : item);
      localStorage.setItem('gamze_student_logs', JSON.stringify(updated));
    }
  } catch (e) {
    console.error(e);
  }
}

export async function dbDeleteStudentLog(id: string): Promise<void> {
  try {
    const ref = doc(db, 'student_logs', id);
    await deleteDoc(ref);
  } catch (error) {
    console.error(`Failed to delete student log ${id} in Firestore:`, error);
  }

  try {
    const raw = localStorage.getItem('gamze_student_logs');
    if (raw) {
      const local: StudentExerciseLog[] = JSON.parse(raw);
      const updated = local.filter(item => item.id !== id);
      localStorage.setItem('gamze_student_logs', JSON.stringify(updated));
    }
  } catch (e) {
    console.error(e);
  }
}

export async function dbClearStudentLogs(studentUsername: string): Promise<void> {
  try {
    const q = query(collection(db, 'student_logs'));
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    querySnapshot.forEach((docSnap) => {
      if (docSnap.data().studentUsername?.toLowerCase() === studentUsername.toLowerCase()) {
        batch.delete(docSnap.ref);
      }
    });
    await batch.commit();
  } catch (error) {
    console.error(`Failed to clear logs for ${studentUsername} in Firestore:`, error);
  }

  try {
    const raw = localStorage.getItem('gamze_student_logs');
    if (raw) {
      const local: StudentExerciseLog[] = JSON.parse(raw);
      const updated = local.filter(item => item.studentUsername.toLowerCase() !== studentUsername.toLowerCase());
      localStorage.setItem('gamze_student_logs', JSON.stringify(updated));
    }
  } catch (e) {
    console.error(e);
  }
}

// ==========================================
// COACHING DAILY STUDY LOGS SERVICES
// ==========================================

export async function dbGetDailyStudyLogs(targetUsername?: string): Promise<DailyStudyLog[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'coaching_daily_logs'));
    let result: DailyStudyLog[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      result.push({
        id: docSnap.id,
        studentUsername: data.studentUsername || '',
        studentFullName: data.studentFullName || '',
        studentClass: data.studentClass || 'LGS',
        date: data.date || new Date().toLocaleDateString('tr-TR'),
        subject: data.subject || '',
        topic: data.topic || '',
        solvedQuestions: Number(data.solvedQuestions || 0),
        correctCount: data.correctCount !== undefined ? Number(data.correctCount) : undefined,
        wrongCount: data.wrongCount !== undefined ? Number(data.wrongCount) : undefined,
        emptyCount: data.emptyCount !== undefined ? Number(data.emptyCount) : undefined,
        studyDurationMinutes: Number(data.studyDurationMinutes || 0),
        notes: data.notes || '',
        createdAt: data.createdAt || new Date().toISOString()
      });
    });

    if (targetUsername) {
      result = result.filter(log => log.studentUsername.toLowerCase() === targetUsername.toLowerCase());
    }

    result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    localStorage.setItem('gamze_daily_logs', JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('Failed to fetch daily study logs from Firestore, falling back to local storage:', error);
    const raw = localStorage.getItem('gamze_daily_logs');
    let local: DailyStudyLog[] = raw ? JSON.parse(raw) : [];
    if (targetUsername) {
      local = local.filter(log => log.studentUsername.toLowerCase() === targetUsername.toLowerCase());
    }
    return local;
  }
}

export async function dbAddDailyStudyLog(logData: Omit<DailyStudyLog, 'id'>): Promise<DailyStudyLog> {
  const fullLog = {
    ...logData,
    createdAt: logData.createdAt || new Date().toISOString()
  };
  try {
    const docRef = await addDoc(collection(db, 'coaching_daily_logs'), fullLog);
    const created: DailyStudyLog = { ...fullLog, id: docRef.id };

    try {
      const raw = localStorage.getItem('gamze_daily_logs');
      const local: DailyStudyLog[] = raw ? JSON.parse(raw) : [];
      local.unshift(created);
      localStorage.setItem('gamze_daily_logs', JSON.stringify(local));
    } catch(e) {}

    return created;
  } catch (error) {
    console.error('Failed to add daily study log to Firestore:', error);
    const id = 'dlog-' + Math.random().toString(36).substring(2, 8);
    const created: DailyStudyLog = { ...fullLog, id };
    const raw = localStorage.getItem('gamze_daily_logs');
    const local: DailyStudyLog[] = raw ? JSON.parse(raw) : [];
    local.unshift(created);
    localStorage.setItem('gamze_daily_logs', JSON.stringify(local));
    return created;
  }
}

export async function dbUpdateDailyStudyLog(id: string, updates: Partial<DailyStudyLog>): Promise<void> {
  try {
    const ref = doc(db, 'coaching_daily_logs', id);
    await updateDoc(ref, updates);
  } catch (error) {
    console.error(`Failed to update daily study log ${id} in Firestore:`, error);
  }

  try {
    const raw = localStorage.getItem('gamze_daily_logs');
    if (raw) {
      const local: DailyStudyLog[] = JSON.parse(raw);
      const updated = local.map(item => item.id === id ? { ...item, ...updates } : item);
      localStorage.setItem('gamze_daily_logs', JSON.stringify(updated));
    }
  } catch (e) {}
}

export async function dbDeleteDailyStudyLog(id: string): Promise<void> {
  try {
    const ref = doc(db, 'coaching_daily_logs', id);
    await deleteDoc(ref);
  } catch (error) {
    console.error(`Failed to delete daily study log ${id} in Firestore:`, error);
  }

  try {
    const raw = localStorage.getItem('gamze_daily_logs');
    if (raw) {
      const local: DailyStudyLog[] = JSON.parse(raw);
      const updated = local.filter(item => item.id !== id);
      localStorage.setItem('gamze_daily_logs', JSON.stringify(updated));
    }
  } catch (e) {}
}

// ==========================================
// COACHING MOCK EXAM LOGS SERVICES
// ==========================================

export async function dbGetMockExamLogs(targetUsername?: string): Promise<MockExamLog[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'coaching_mock_exams'));
    let result: MockExamLog[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      result.push({
        id: docSnap.id,
        studentUsername: data.studentUsername || '',
        studentFullName: data.studentFullName || '',
        studentClass: data.studentClass || 'LGS',
        examName: data.examName || '',
        date: data.date || new Date().toLocaleDateString('tr-TR'),
        groupType: data.groupType || 'LGS',
        subjectNets: data.subjectNets || {},
        totalNet: Number(data.totalNet || 0),
        score: Number(data.score || 0),
        targetScore: data.targetScore ? Number(data.targetScore) : undefined,
        notes: data.notes || '',
        createdAt: data.createdAt || new Date().toISOString()
      });
    });

    if (targetUsername) {
      result = result.filter(log => log.studentUsername.toLowerCase() === targetUsername.toLowerCase());
    }

    result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    localStorage.setItem('gamze_mock_exams', JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('Failed to fetch mock exam logs from Firestore:', error);
    const raw = localStorage.getItem('gamze_mock_exams');
    let local: MockExamLog[] = raw ? JSON.parse(raw) : [];
    if (targetUsername) {
      local = local.filter(log => log.studentUsername.toLowerCase() === targetUsername.toLowerCase());
    }
    return local;
  }
}

export async function dbAddMockExamLog(logData: Omit<MockExamLog, 'id'>): Promise<MockExamLog> {
  const fullLog = {
    ...logData,
    createdAt: logData.createdAt || new Date().toISOString()
  };
  try {
    const docRef = await addDoc(collection(db, 'coaching_mock_exams'), fullLog);
    const created: MockExamLog = { ...fullLog, id: docRef.id };

    try {
      const raw = localStorage.getItem('gamze_mock_exams');
      const local: MockExamLog[] = raw ? JSON.parse(raw) : [];
      local.unshift(created);
      localStorage.setItem('gamze_mock_exams', JSON.stringify(local));
    } catch(e) {}

    return created;
  } catch (error) {
    console.error('Failed to add mock exam log to Firestore:', error);
    const id = 'mock-' + Math.random().toString(36).substring(2, 8);
    const created: MockExamLog = { ...fullLog, id };
    const raw = localStorage.getItem('gamze_mock_exams');
    const local: MockExamLog[] = raw ? JSON.parse(raw) : [];
    local.unshift(created);
    localStorage.setItem('gamze_mock_exams', JSON.stringify(local));
    return created;
  }
}

export async function dbUpdateMockExamLog(id: string, updates: Partial<MockExamLog>): Promise<void> {
  try {
    const ref = doc(db, 'coaching_mock_exams', id);
    await updateDoc(ref, updates);
  } catch (error) {
    console.error(`Failed to update mock exam log ${id} in Firestore:`, error);
  }

  try {
    const raw = localStorage.getItem('gamze_mock_exams');
    if (raw) {
      const local: MockExamLog[] = JSON.parse(raw);
      const updated = local.map(item => item.id === id ? { ...item, ...updates } : item);
      localStorage.setItem('gamze_mock_exams', JSON.stringify(updated));
    }
  } catch (e) {}
}

export async function dbDeleteMockExamLog(id: string): Promise<void> {
  try {
    const ref = doc(db, 'coaching_mock_exams', id);
    await deleteDoc(ref);
  } catch (error) {
    console.error(`Failed to delete mock exam log ${id} in Firestore:`, error);
  }

  try {
    const raw = localStorage.getItem('gamze_mock_exams');
    if (raw) {
      const local: MockExamLog[] = JSON.parse(raw);
      const updated = local.filter(item => item.id !== id);
      localStorage.setItem('gamze_mock_exams', JSON.stringify(updated));
    }
  } catch (e) {}
}

// ==========================================
// COACHING CURRICULUM PROGRESS SERVICES
// ==========================================

export async function dbGetCurriculumProgress(studentUsername: string): Promise<string[]> {
  try {
    const ref = doc(db, 'coaching_curriculum', studentUsername.toLowerCase());
    const docSnap = await getDoc(ref);
    if (docSnap.exists()) {
      return docSnap.data().completedTopics || [];
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch curriculum progress from Firestore:', error);
    const raw = localStorage.getItem(`gamze_curriculum_${studentUsername.toLowerCase()}`);
    return raw ? JSON.parse(raw) : [];
  }
}

export async function dbSaveCurriculumProgress(studentUsername: string, completedTopics: string[]): Promise<void> {
  const usernameKey = studentUsername.toLowerCase();
  try {
    const ref = doc(db, 'coaching_curriculum', usernameKey);
    await setDoc(ref, {
      studentUsername: usernameKey,
      completedTopics,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Failed to save curriculum progress in Firestore:', error);
  }
  localStorage.setItem(`gamze_curriculum_${usernameKey}`, JSON.stringify(completedTopics));
}

// ==========================================
// COACHING STUDENT SCHEDULE SERVICES
// ==========================================

export interface StudentScheduleRecord {
  studentUsername: string;
  studentName: string;
  examGroup: string;
  targetGoal: string;
  createdAt: string;
  schedule: Record<string, any>;
  hasUnreadNotification?: boolean;
}

export async function dbSaveStudentSchedule(studentUsername: string, record: Omit<StudentScheduleRecord, 'studentUsername'>): Promise<void> {
  const usernameKey = studentUsername.toLowerCase();
  const scheduleData: StudentScheduleRecord = {
    ...record,
    studentUsername: usernameKey,
    hasUnreadNotification: true
  };

  try {
    const ref = doc(db, 'coaching_student_schedules', usernameKey);
    await setDoc(ref, scheduleData);
  } catch (error) {
    console.error('Failed to save student schedule in Firestore:', error);
  }

  try {
    localStorage.setItem(`gamze_student_schedule_${usernameKey}`, JSON.stringify(scheduleData));
    // Also dispatch custom event for real-time notification in open tabs
    window.dispatchEvent(new CustomEvent('gamze-schedule-updated', { detail: { studentUsername: usernameKey } }));
  } catch (e) {}
}

export async function dbGetStudentSchedule(studentUsername: string): Promise<StudentScheduleRecord | null> {
  const usernameKey = studentUsername.toLowerCase();
  try {
    const ref = doc(db, 'coaching_student_schedules', usernameKey);
    const docSnap = await getDoc(ref);
    if (docSnap.exists()) {
      const data = docSnap.data() as StudentScheduleRecord;
      localStorage.setItem(`gamze_student_schedule_${usernameKey}`, JSON.stringify(data));
      return data;
    }
  } catch (error) {
    console.error('Failed to fetch student schedule from Firestore:', error);
  }

  try {
    const raw = localStorage.getItem(`gamze_student_schedule_${usernameKey}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export async function dbMarkScheduleAsRead(studentUsername: string): Promise<void> {
  const usernameKey = studentUsername.toLowerCase();
  try {
    const ref = doc(db, 'coaching_student_schedules', usernameKey);
    await updateDoc(ref, { hasUnreadNotification: false });
  } catch (error) {
    console.error('Failed to mark schedule as read in Firestore:', error);
  }

  try {
    const raw = localStorage.getItem(`gamze_student_schedule_${usernameKey}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.hasUnreadNotification = false;
      localStorage.setItem(`gamze_student_schedule_${usernameKey}`, JSON.stringify(parsed));
    }
  } catch (e) {}
}

export async function dbDeleteStudentSchedule(studentUsername: string): Promise<void> {
  const usernameKey = studentUsername.toLowerCase();
  try {
    const ref = doc(db, 'coaching_student_schedules', usernameKey);
    await deleteDoc(ref);
  } catch (error) {
    console.error('Failed to delete student schedule from Firestore:', error);
  }

  try {
    localStorage.removeItem(`gamze_student_schedule_${usernameKey}`);
  } catch (e) {}
}




