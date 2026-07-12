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

