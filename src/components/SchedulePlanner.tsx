import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Calendar, Plus, Trash2, Edit2, Copy, Download, Save, 
  RefreshCw, Printer, BookOpen, Clock, AlertCircle, CheckCircle, 
  FileText, Share2, Send, ChevronRight, GraduationCap, X, Check,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Subject database based on Turkish curriculum
interface SubjectTemplate {
  name: string;
  color: string;
  focusTopics: string[];
}

const EXAM_SUBJECTS: Record<string, SubjectTemplate[]> = {
  'YKS Sayısal': [
    { name: 'Matematik (AYT)', color: 'bg-indigo-50 border-indigo-200 text-indigo-800', focusTopics: ['Fonksiyonlar', 'Trigonometri', 'Limit ve Süreklilik', 'Türev', 'İntegral', 'Logaritma', 'Diziler'] },
    { name: 'Matematik (TYT)', color: 'bg-blue-50 border-blue-200 text-blue-800', focusTopics: ['Sayı Basamakları', 'Rasyonel Sayılar', 'Üslü ve Köklü Sayılar', 'Çarpanlara Ayırma', 'Problemler', 'Kümeler', 'Olasılık'] },
    { name: 'Geometri', color: 'bg-cyan-50 border-cyan-200 text-cyan-800', focusTopics: ['Üçgende Açılar ve Benzerlik', 'Çokgenler', 'Çember ve Daire', 'Katı Cisimler', 'Analitik Geometri'] },
    { name: 'Fizik (AYT/TYT)', color: 'bg-rose-50 border-rose-200 text-rose-800', focusTopics: ['Kuvvet ve Hareket', 'Elektrik ve Manyetizma', 'Dalgalar', 'Optik', 'Modern Fizik', 'Madde ve Özellikleri'] },
    { name: 'Kimya (AYT/TYT)', color: 'bg-emerald-50 border-emerald-200 text-emerald-800', focusTopics: ['Atom ve Periyodik Sistem', 'Kimyasal Türler Arası Etkileşimler', 'Mol Kavramı', 'Gazlar', 'Çözeltiler', 'Kimyasal Tepkimelerde Enerji'] },
    { name: 'Biyoloji (AYT/TYT)', color: 'bg-teal-50 border-teal-200 text-teal-800', focusTopics: ['Hücre ve Organeller', 'Canlıların Temel Bileşenleri', 'Kalıtım', 'Sistemler (Sinir, Sindirim, Dolaşım)', 'Hücre Bölünmeleri'] },
    { name: 'Türkçe & Paragraf', color: 'bg-amber-50 border-amber-200 text-amber-800', focusTopics: ['Sözcükte ve Cümlede Anlam', 'Paragrafta Yapı ve Ana Düşünce', 'Yazım Kuralları ve Noktalama', 'Dil Bilgisi'] }
  ],
  'YKS Eşit Ağırlık': [
    { name: 'Matematik (AYT)', color: 'bg-indigo-50 border-indigo-200 text-indigo-800', focusTopics: ['Fonksiyonlar', 'Trigonometri', 'Limit ve Süreklilik', 'Türev', 'İntegral', 'Logaritma', 'Diziler'] },
    { name: 'Matematik (TYT)', color: 'bg-blue-50 border-blue-200 text-blue-800', focusTopics: ['Sayı Basamakları', 'Rasyonel Sayılar', 'Üslü ve Köklü Sayılar', 'Problemler', 'Kümeler', 'Fonksiyon Giriş'] },
    { name: 'Türk Dili ve Edebiyatı', color: 'bg-purple-50 border-purple-200 text-purple-800', focusTopics: ['Şiir Bilgisi', 'Divan Edebiyatı', 'Tanzimat ve Servet-i Fünun Edebiyatı', 'Cumhuriyet Dönemi Edebiyatı', 'Edebi Sanatlar'] },
    { name: 'Tarih', color: 'bg-amber-50 border-amber-200 text-amber-800', focusTopics: ['İlk ve Orta Çağlarda Türk Dünyası', 'İslam Medeniyeti', 'Osmanlı Tarihi', 'Atatürkçülük ve İnkılap Tarihi'] },
    { name: 'Coğrafya', color: 'bg-orange-50 border-orange-200 text-orange-800', focusTopics: ['Doğa ve İnsan', 'Dünyanın Şekli ve Hareketleri', 'Harita Bilgisi', 'İklim Bilgisi', 'Nüfus ve Göç'] },
    { name: 'Geometri', color: 'bg-cyan-50 border-cyan-200 text-cyan-800', focusTopics: ['Üçgenler', 'Çokgenler ve Dörtgenler', 'Çember', 'Analitik Geometri'] },
    { name: 'Türkçe & Paragraf', color: 'bg-rose-50 border-rose-200 text-rose-800', focusTopics: ['Sözcükte ve Cümlede Anlam', 'Paragrafta Yapı ve Ana Düşünce', 'Yazım Kuralları ve Noktalama'] }
  ],
  'YKS Sözel': [
    { name: 'Türk Dili ve Edebiyatı', color: 'bg-purple-50 border-purple-200 text-purple-800', focusTopics: ['Şiir Bilgisi', 'Halk Edebiyatı', 'Divan Edebiyatı', 'Cumhuriyet Dönemi Romanı', 'Edebi Sanatlar'] },
    { name: 'Tarih-1 & Tarih-2', color: 'bg-amber-50 border-amber-200 text-amber-800', focusTopics: ['Tarih Bilimine Giriş', 'İlk Türk Devletleri', 'Osmanlı Kuruluş ve Yükselme', 'Milli Mücadele Dönemi'] },
    { name: 'Coğrafya-1 & Coğrafya-2', color: 'bg-orange-50 border-orange-200 text-orange-800', focusTopics: ['Ekosistem ve Madde Döngüsü', 'Türkiye’de Tarım ve Hayvancılık', 'Küresel Ortam ve Bölgeler', 'Çevre ve Toplum'] },
    { name: 'Felsefe Grubu', color: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-800', focusTopics: ['Felsefeye Giriş', 'Bilgi Felsefesi', 'Ahlak Felsefesi', 'Siyaset Felsefesi', 'Mantık', 'Sosyoloji', 'Psikoloji'] },
    { name: 'Din Kültürü ve Ahlak Bilgisi', color: 'bg-emerald-50 border-emerald-200 text-emerald-800', focusTopics: ['Kur’an’da Bazı Kavramlar', 'İslam ve Bilim', 'Dünya ve Ahiret', 'İnanç ve İbadetler'] },
    { name: 'Türkçe & Paragraf', color: 'bg-rose-50 border-rose-200 text-rose-800', focusTopics: ['Paragrafta Ana Düşünce', 'Paragrafta Yardımcı Düşünce', 'Sözcükte Anlam'] },
    { name: 'Temel Matematik', color: 'bg-slate-100 border-slate-300 text-slate-700', focusTopics: ['Temel Kavramlar', 'Bölme-Bölünebilme', 'Rasyonel Sayılar', 'Basit Denklemler'] }
  ],
  'LGS (8. Sınıf)': [
    { name: 'Matematik', color: 'bg-blue-50 border-blue-200 text-blue-800', focusTopics: ['Çarpanlar ve Katlar', 'Üslü İfadeler', 'Kareköklü İfadeler', 'Veri Analizi', 'Basit Olayların Olma Olasılığı', 'Cebirsel İfadeler'] },
    { name: 'Fen Bilimleri', color: 'bg-emerald-50 border-emerald-200 text-emerald-800', focusTopics: ['Mevsimler ve İklim', 'DNA ve Genetik Kod', 'Basınç', 'Madde ve Endüstri', 'Basit Makineler', 'Enerji Dönüşümleri'] },
    { name: 'Türkçe', color: 'bg-rose-50 border-rose-200 text-rose-800', focusTopics: ['Sözcükte ve Cümlede Anlam', 'Paragrafta Anlam', 'Fiilimsiler', 'Cümlenin Ögeleri', 'Yazım ve Noktalama', 'Sözel Mantık'] },
    { name: 'T.C. İnkılap Tarihi', color: 'bg-amber-50 border-amber-200 text-amber-800', focusTopics: ['Bir Kahraman Doğuyor', 'Milli Uyanış', 'Ya İstiklal Ya Ölüm', 'Atatürkçülük ve Çağdaşlaşan Türkiye'] },
    { name: 'Din Kültürü ve Ahlak Bilgisi', color: 'bg-teal-50 border-teal-200 text-teal-800', focusTopics: ['Kader İnancı', 'Zekat ve Sadaka', 'Din ve Hayat', 'Hz. Muhammed’in Örnekliği'] },
    { name: 'İngilizce', color: 'bg-purple-50 border-purple-200 text-purple-800', focusTopics: ['Friendship', 'Teen Life', 'In The Kitchen', 'On The Phone', 'The Internet', 'Adventures'] }
  ],
  'Ara Sınıf (9, 10, 11)': [
    { name: 'Matematik', color: 'bg-blue-50 border-blue-200 text-blue-800', focusTopics: ['Müfredat Konu Tekrarı', 'Haftalık Ödev Çözümleri', 'Yazılı Sınav Hazırlığı', 'Temel Formül Çalışması'] },
    { name: 'Fizik / Kimya / Biyoloji', color: 'bg-emerald-50 border-emerald-200 text-emerald-800', focusTopics: ['Fen Bilimleri Temelleri', 'Yazılıya Hazırlık', 'Konu Özet Çıkarma'] },
    { name: 'Edebiyat ve Tarih', color: 'bg-amber-50 border-amber-200 text-amber-800', focusTopics: ['Edebi Türler Çalışması', 'Tarih Özet Okuma', 'Sözlü Sınav Çalışmaları'] },
    { name: 'Kitap Okuma & Analiz', color: 'bg-purple-50 border-purple-200 text-purple-800', focusTopics: ['Haftalık Belirlenen Kitabın Okunması', 'Okuma Notları Alma', 'Kelime Dağarcığı Geliştirme'] },
    { name: 'Ödev ve Tekrar Saati', color: 'bg-stone-50 border-stone-200 text-stone-700', focusTopics: ['Haftalık Ödevlerin Tamamlanması', 'Eksik Konuların Defterden Okunması'] }
  ]
};

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

const COACH_ADVICES = [
  'Düzenli paragraf çözmek okuma hızını ve anlama kabiliyetini %40 oranında artırır.',
  'Çözemediğin her soruyu kesip "yanlış kutuna" at, haftalık olarak o soruları mutlaka öğretmenine çözdür.',
  'Uykudan önceki son 20 dakikayı sözel derslerin tekrarına ayırarak kalıcı hafızayı güçlendir.',
  'Masaya oturmadan önce telefonunu kesinlikle başka bir odaya bırak, dikkatinin bölünmesine izin verme.',
  'Her 50 dakikalık çalışmadan sonra 10 dakika temiz hava al. Ekranlardan uzak dur!',
  'Deneme sınavı sonuçlarında netlerine değil, yaptığın yanlışların hangi konulardan olduğuna odaklan.'
];

interface ScheduleItem {
  id: string;
  time: string;
  subject: string;
  focus: string;
  advice: string;
  color: string;
}

interface SavedSchedule {
  id: string;
  studentName: string;
  examGroup: string;
  targetGoal: string;
  createdAt: string;
  schedule: Record<string, ScheduleItem[]>;
}

export default function SchedulePlanner() {
  // Wizard Input States
  const [studentName, setStudentName] = useState('');
  const [examGroup, setExamGroup] = useState('YKS Sayısal');
  const [targetGoal, setTargetGoal] = useState('');
  const [dailyHours, setDailyHours] = useState(5);
  const [weakSubjects, setWeakSubjects] = useState<string[]>([]);
  const [hasSchool, setHasSchool] = useState(true);
  const [customAdvice, setCustomAdvice] = useState('');

  // Generated Schedule State
  const [schedule, setSchedule] = useState<Record<string, ScheduleItem[]>>({});
  const [selectedDay, setSelectedDay] = useState('Pazartesi');
  const [savedSchedules, setSavedSchedules] = useState<SavedSchedule[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);

  // Editor Modal States
  const [editingSlot, setEditingSlot] = useState<{ day: string; index: number; slot: ScheduleItem } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load Saved Schedules from local storage
  useEffect(() => {
    const saved = localStorage.getItem('gamze_tosun_saved_schedules');
    if (saved) {
      try {
        setSavedSchedules(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Update Weak Subjects checkboxes list when examGroup changes
  useEffect(() => {
    setWeakSubjects([]);
  }, [examGroup]);

  // Handle Weak Subjects Checkbox Changes
  const handleWeakSubjectToggle = (subjName: string) => {
    if (weakSubjects.includes(subjName)) {
      setWeakSubjects(weakSubjects.filter(s => s !== subjName));
    } else {
      setWeakSubjects([...weakSubjects, subjName]);
    }
  };

  // Robot Generator Algorithm
  const handleGenerateSchedule = () => {
    if (!studentName.trim()) {
      alert('Lütfen öğrenci adını giriniz.');
      return;
    }

    const generated: Record<string, ScheduleItem[]> = {};
    const subjects = EXAM_SUBJECTS[examGroup] || EXAM_SUBJECTS['YKS Sayısal'];

    // Generate times based on hasSchool and dailyHours
    const generateTimes = (isWeekend: boolean) => {
      const times: string[] = [];
      const blocks = Math.ceil(dailyHours);

      if (hasSchool && !isWeekend) {
        // Weekday (School hours): study starts in the late afternoon/evening
        let startHour = 16.5; // 16:30
        for (let i = 0; i < blocks; i++) {
          const hStr = Math.floor(startHour).toString().padStart(2, '0');
          const mStr = (startHour % 1 === 0 ? '00' : '30');
          
          let endHour = startHour + 1.5; // 1.5 hour study block
          const ehStr = Math.floor(endHour).toString().padStart(2, '0');
          const emStr = (endHour % 1 === 0 ? '00' : '30');

          times.push(`${hStr}:${mStr} - ${ehStr}:${emStr}`);
          startHour = endHour + 0.5; // 30 min break
        }
      } else {
        // Weekend or non-school day: distributed throughout the day
        let startHour = 9.5; // 09:30
        for (let i = 0; i < blocks; i++) {
          const hStr = Math.floor(startHour).toString().padStart(2, '0');
          const mStr = (startHour % 1 === 0 ? '00' : '30');
          
          let endHour = startHour + 1.5;
          const ehStr = Math.floor(endHour).toString().padStart(2, '0');
          const emStr = (endHour % 1 === 0 ? '00' : '30');

          times.push(`${hStr}:${mStr} - ${ehStr}:${emStr}`);
          
          // Break is 30 mins, but longer midday break after slot 2
          if (i === 1) {
            startHour = endHour + 1.5; // 1.5 hour lunch/rest break
          } else {
            startHour = endHour + 0.5;
          }
        }
      }
      return times;
    };

    // Cycle through subjects ensuring weak subjects and core subjects are prioritized
    DAYS.forEach((day, dayIndex) => {
      const isWeekend = day === 'Cumartesi' || day === 'Pazar';
      const times = generateTimes(isWeekend);
      const items: ScheduleItem[] = [];

      // Determine subject queue for this day to keep it varied
      let daySubjects = [...subjects];
      
      // Shuffle slightly or shift based on dayIndex to avoid exact repetition
      const shift = dayIndex % daySubjects.length;
      daySubjects = [...daySubjects.slice(shift), ...daySubjects.slice(0, shift)];

      // Prioritize weak subjects by putting them first
      if (weakSubjects.length > 0) {
        const weakOnes = daySubjects.filter(s => weakSubjects.includes(s.name));
        const otherOnes = daySubjects.filter(s => !weakSubjects.includes(s.name));
        daySubjects = [...weakOnes, ...otherOnes];
      }

      times.forEach((time, index) => {
        // If it is LGS/YKS and first slot of the day, inject Paragraf/Problem warmup
        const isWarmup = (index === 0 && (examGroup.includes('YKS') || examGroup.includes('LGS')));
        
        let selectedSubject: SubjectTemplate;
        let focusText = '';
        let adviceText = '';

        if (isWarmup) {
          selectedSubject = subjects.find(s => s.name.includes('Türkçe') || s.name.includes('Paragraf')) || subjects[0];
          focusText = 'Hız ve Odak: 25 Paragraf Sorusu Çözümü ve Yanlış Analizi';
          adviceText = 'Süre tutarak çöz! Soru başına ortalama 1.2 dakika hedefle.';
        } else {
          // Normal cycling
          const subIdx = (index - (isWarmup ? 1 : 0)) % daySubjects.length;
          selectedSubject = daySubjects[subIdx];

          // Pick a random topic focus
          const randomTopic = selectedSubject.focusTopics[Math.floor(Math.random() * selectedSubject.focusTopics.length)];
          focusText = `${randomTopic} Konu Tekrarı + Eksiksiz Soru Çözümü`;

          // Pick dynamic coach advice
          if (weakSubjects.includes(selectedSubject.name)) {
            adviceText = `Gamze Hoca'nın Notu: Bu senin gelişim dersin! Anlamadığın her formülü defterine yaz, pes etmek yok.`;
          } else {
            adviceText = COACH_ADVICES[Math.floor(Math.random() * COACH_ADVICES.length)];
          }
        }

        items.push({
          id: `slot-${day}-${index}`,
          time,
          subject: selectedSubject.name,
          focus: focusText,
          advice: adviceText,
          color: selectedSubject.color
        });
      });

      generated[day] = items;
    });

    setSchedule(generated);
    setIsGenerated(true);
    setSelectedDay('Pazartesi');
  };

  // Save Schedule to Local Storage
  const handleSaveSchedule = () => {
    if (!isGenerated) return;

    const newSave: SavedSchedule = {
      id: `sch-${Date.now()}`,
      studentName,
      examGroup,
      targetGoal: targetGoal || 'Yüksek Başarı',
      createdAt: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      schedule
    };

    const updated = [newSave, ...savedSchedules];
    setSavedSchedules(updated);
    localStorage.setItem('gamze_tosun_saved_schedules', JSON.stringify(updated));
    alert(`${studentName} isimli öğrencinin ders programı başarıyla kaydedildi!`);
  };

  // Load a Saved Schedule
  const handleLoadSchedule = (saved: SavedSchedule) => {
    setStudentName(saved.studentName);
    setExamGroup(saved.examGroup);
    setTargetGoal(saved.targetGoal);
    setSchedule(saved.schedule);
    setIsGenerated(true);
    setSelectedDay('Pazartesi');
  };

  // Delete a Saved Schedule
  const handleDeleteSavedSchedule = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Bu ders programını silmek istediğinize emin misiniz?')) return;
    const updated = savedSchedules.filter(s => s.id !== id);
    setSavedSchedules(updated);
    localStorage.setItem('gamze_tosun_saved_schedules', JSON.stringify(updated));
  };

  // Open Edit Modal for a slot
  const handleOpenEditSlot = (day: string, index: number, slot: ScheduleItem) => {
    setEditingSlot({ day, index, slot });
    setIsEditModalOpen(true);
  };

  // Save edited slot
  const handleSaveEditedSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    const { day, index, slot } = editingSlot;
    const updatedDaySlots = [...schedule[day]];
    updatedDaySlots[index] = slot;

    setSchedule({
      ...schedule,
      [day]: updatedDaySlots
    });
    setIsEditModalOpen(false);
    setEditingSlot(null);
  };

  // Add empty study slot
  const handleAddNewSlot = (day: string) => {
    const daySlots = schedule[day] || [];
    const lastSlot = daySlots[daySlots.length - 1];
    let newTime = '18:00 - 19:30';
    
    if (lastSlot) {
      // Intelligently guess next time
      try {
        const [, endTime] = lastSlot.time.split(' - ');
        const [h, m] = endTime.split(':').map(Number);
        const startH = (h + 1) % 24;
        const endH = (startH + 1) % 24;
        newTime = `${startH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} - ${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      } catch (e) {
        // Fallback
      }
    }

    const newSlot: ScheduleItem = {
      id: `slot-${day}-${Date.now()}`,
      time: newTime,
      subject: 'Serbest Çalışma / Soru Analizi',
      focus: 'Kişisel Soru Çözümü & Günlük Değerlendirme',
      advice: 'Bugün çözdüğün tüm soruların yanlış analizini tamamlamadan uyuma!',
      color: 'bg-stone-50 border-stone-200 text-stone-700'
    };

    setSchedule({
      ...schedule,
      [day]: [...daySlots, newSlot]
    });
  };

  // Delete specific slot from day
  const handleDeleteSlot = (day: string, index: number) => {
    const updated = (schedule[day] || []).filter((_, i) => i !== index);
    setSchedule({
      ...schedule,
      [day]: updated
    });
  };

  // Compile full schedule into nicely formatted WhatsApp copyable text
  const getWhatsAppText = () => {
    let text = `🌟 *GAMZE TOSUN DANIŞMANLIK & ÖĞRENCİ KOÇLUĞU* 🌟\n`;
    text += `🎯 *ÖĞRENCİ:* ${studentName}\n`;
    text += `📈 *ALAN/GRUP:* ${examGroup}\n`;
    if (targetGoal) text += `🏫 *HEDEF:* ${targetGoal}\n`;
    text += `📅 *HAFTALIK DERS ÇALIŞMA PROGRAMI*\n`;
    text += `───────────────────────\n\n`;

    DAYS.forEach(day => {
      text += `📅 *${day.toUpperCase()}*\n`;
      const slots = schedule[day] || [];
      if (slots.length === 0) {
        text += `• _Dinlenme / Serbest Gün_\n`;
      } else {
        slots.forEach(slot => {
          text += `⏰ *${slot.time}* | *${slot.subject}*\n`;
          text += `📝 _Konu:_ ${slot.focus}\n`;
          text += `💡 _Gamze Hoca'dan:_ ${slot.advice}\n\n`;
        });
      }
      text += `───────────────────────\n`;
    });

    text += `\n✨ _"Başarı tesadüf değil, doğru rehberliğin sonucudur. Sana inanıyorum, harika bir hafta olsun!"_ - *Gamze Tosun*`;
    return text;
  };

  // Copy WhatsApp format to clipboard
  const handleCopyWhatsApp = () => {
    const text = getWhatsAppText();
    navigator.clipboard.writeText(text);
    alert('Program WhatsApp formatında panoya kopyalandı! Doğrudan öğrencinizin sohbet ekranına yapıştırabilirsiniz.');
  };

  // Trigger standard print
  const handlePrint = () => {
    window.print();
  };

  // Export Weekly Schedule as Excel Format (HTML base table with application/vnd.ms-excel)
  const handleExportExcel = () => {
    if (!isGenerated) return;

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Haftalik Ders Programi</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif; }
          td, th { border: 1px solid #D1D5DB; padding: 10px; font-size: 11px; vertical-align: top; }
          th { background-color: #2D2D2D; color: #FFFFFF; font-weight: bold; font-size: 12px; text-align: center; }
          .header-title { font-size: 16px; font-weight: bold; color: #C5A059; text-align: center; padding: 15px; background-color: #FAF9F6; border: 1px solid #C5A059; }
          .student-info { font-weight: bold; font-size: 11px; background-color: #F3F4F6; }
          .time-col { background-color: #FAF9F6; font-weight: bold; color: #4B5563; text-align: center; font-family: monospace; }
          .day-header { background-color: #C5A059; color: #FFFFFF; font-weight: bold; text-align: center; }
          .advice-text { font-style: italic; color: #7C2D12; font-size: 10px; background-color: #FFF7ED; padding: 4px; border-radius: 4px; }
          .subject-name { font-weight: bold; color: #1E3A8A; font-size: 12px; }
          .focus-text { color: #374151; font-weight: 500; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="8" class="header-title">GAMZE TOSUN DANIŞMANLIK & ÖĞRENCİ KOÇLUĞU - HAFTALIK DERS PROGRAMI</td>
          </tr>
          <tr class="student-info">
            <td colspan="2" style="background-color: #F5F5F4;">ÖĞRENCİ ADI:</td>
            <td colspan="2" style="color: #2D2D2D;">${studentName}</td>
            <td colspan="2" style="background-color: #F5F5F4;">ALAN / GRUP:</td>
            <td colspan="2" style="color: #2D2D2D;">${examGroup}</td>
          </tr>
          <tr class="student-info">
            <td colspan="2" style="background-color: #F5F5F4;">HEDEF / PROGRAM:</td>
            <td colspan="6" style="color: #C5A059;">${targetGoal || 'Genel Gelişim / Bireysel Başarı Hedefi'}</td>
          </tr>
          <tr><td colspan="8" style="border:none; height:10px;"></td></tr>
          
          <!-- DAYS HEADER -->
          <tr>
            <th style="width: 130px; background-color: #1F2937; color: white;">DERS SAATİ</th>
            ${DAYS.map(day => `<th class="day-header" style="width: 260px;">${day.toUpperCase()}</th>`).join('')}
          </tr>
    `;

    const maxSlots = Math.max(...DAYS.map(day => (schedule[day] || []).length));

    for (let slotIdx = 0; slotIdx < maxSlots; slotIdx++) {
      html += `<tr>`;
      
      // Get time for this row
      let slotTime = '';
      for (const d of DAYS) {
        if (schedule[d] && schedule[d][slotIdx]) {
          slotTime = schedule[d][slotIdx].time;
          break;
        }
      }
      if (!slotTime) slotTime = `${slotIdx + 1}. Etüt`;

      html += `<td class="time-col" style="vertical-align: middle;">${slotTime}</td>`;

      for (const day of DAYS) {
        const slot = schedule[day] && schedule[day][slotIdx];
        if (slot) {
          html += `
            <td style="background-color: #FFFFFF;">
              <div class="subject-name">${slot.subject}</div>
              <div class="focus-text" style="margin-top: 4px;">• ${slot.focus}</div>
              <div class="advice-text" style="margin-top: 6px;">
                Gamze Hoca: ${slot.advice}
              </div>
            </td>
          `;
        } else {
          html += `<td style="background-color: #FAFBFB; text-align: center; color: #9CA3AF; font-style: italic; vertical-align: middle;">Serbest Zaman / Dinlenme</td>`;
        }
      }
      html += `</tr>`;
    }

    html += `
          <tr><td colspan="8" style="border:none; height:15px;"></td></tr>
          <tr>
            <td colspan="8" style="text-align: center; font-style: italic; font-weight: bold; background-color: #FAF9F6; color: #2D2D2D; padding: 14px; border: 1px solid #C5A059; font-size: 12px;">
              "Başarı tesadüf değil, doğru rehberliğin sonucudur. Sana inanıyorum, harika bir çalışma haftası dilerim!" - Gamze Tosun
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${studentName.replace(/\s+/g, '_')}_Haftalik_Calisma_Programi.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* LEFT COLUMN: Input Form Wizard & Saved List */}
      <div className="lg:col-span-4 space-y-6 print:hidden">
        
        {/* Saved List section if available */}
        {savedSchedules.length > 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-serif text-sm font-bold text-[#2D2D2D] flex items-center gap-2 border-b border-stone-100 pb-2">
              <GraduationCap className="w-4 h-4 text-[#C5A059]" />
              <span>Kayıtlı Öğrenci Programları ({savedSchedules.length})</span>
            </h3>
            
            <div className="max-h-52 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
              {savedSchedules.map((saved) => (
                <div 
                  key={saved.id}
                  onClick={() => handleLoadSchedule(saved)}
                  className="p-3 bg-[#FAF9F6] border border-stone-200/60 hover:border-[#C5A059]/60 rounded-xl transition-all flex items-center justify-between cursor-pointer group text-left"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-800 text-xs leading-none group-hover:text-[#C5A059] transition-colors">
                      {saved.studentName}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {saved.examGroup} • {saved.targetGoal}
                    </p>
                    <span className="text-[9px] text-slate-400 block pt-0.5">Kaydedildi: {saved.createdAt}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSavedSchedule(saved.id, e)}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wizard Input Card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-5 text-left">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-serif text-base font-bold text-[#2D2D2D] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <span>Program Hazırlama Robotu</span>
            </h3>
            <p className="text-stone-400 text-[10px] leading-relaxed mt-0.5">
              Gamze Tosun koçluk standartlarında, ders bazlı ve sınav tipine özel haftalık çalışma şeması oluşturun.
            </p>
          </div>

          <div className="space-y-4">
            {/* Student Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Öğrenci Ad Soyad</label>
              <input 
                type="text"
                placeholder="Örn: Ahmet Yılmaz"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-200 rounded-xl text-xs focus:border-[#C5A059] focus:outline-none transition-colors"
              />
            </div>

            {/* Exam / Area Group */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sınav / Sınıf Seviyesi</label>
              <select 
                value={examGroup}
                onChange={(e) => setExamGroup(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-200 rounded-xl text-xs focus:border-[#C5A059] focus:outline-none transition-colors"
              >
                {Object.keys(EXAM_SUBJECTS).map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Target Major / Dream school */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Hedeflenen Üniversite / Lise veya Bölüm</label>
              <input 
                type="text"
                placeholder="Örn: ODTÜ Bilgisayar Mühendisliği"
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-200 rounded-xl text-xs focus:border-[#C5A059] focus:outline-none transition-colors"
              />
            </div>

            {/* Daily Hours Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Günlük Hedef Çalışma Süresi</label>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  {dailyHours} Saat / Gün
                </span>
              </div>
              <input 
                type="range"
                min="2"
                max="8"
                step="1"
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
              />
              <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium">
                <span>2 Saat (Yumuşak Başlangıç)</span>
                <span>8 Saat (Kamplar / Son Aylar)</span>
              </div>
            </div>

            {/* Has School switch */}
            <div className="flex items-center justify-between p-3 bg-[#FAF9F6] rounded-xl border border-stone-200/50">
              <div className="text-left space-y-0.5">
                <span className="text-xs font-bold text-slate-700">Hafta İçi Okul / Dershane Var mı?</span>
                <p className="text-[9px] text-slate-400 leading-none">Evet ise çalışma saatleri okul sonrasına ayarlanır.</p>
              </div>
              <button 
                onClick={() => setHasSchool(!hasSchool)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${hasSchool ? 'bg-emerald-600' : 'bg-stone-300'}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${hasSchool ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Weak Subjects list based on Selected Exam Group */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Zorlanılan / Yoğunlaşılması Gereken Dersler (Öncelikli)
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {EXAM_SUBJECTS[examGroup]?.map(subj => (
                  <label 
                    key={subj.name}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-[10px] font-semibold transition-all cursor-pointer ${
                      weakSubjects.includes(subj.name)
                        ? 'bg-[#C5A059]/10 border-[#C5A059] text-[#C5A059]'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <input 
                      type="checkbox"
                      checked={weakSubjects.includes(subj.name)}
                      onChange={() => handleWeakSubjectToggle(subj.name)}
                      className="hidden"
                    />
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                      weakSubjects.includes(subj.name) ? 'bg-[#C5A059] border-[#C5A059] text-white' : 'border-stone-300 bg-white'
                    }`}>
                      {weakSubjects.includes(subj.name) && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="truncate">{subj.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={handleGenerateSchedule}
              className="w-full py-3 bg-[#2D2D2D] hover:bg-[#C5A059] text-white text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              <span>Yeni Program Oluştur</span>
            </button>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Interactive Grid, WhatsApp copier, print preview */}
      <div className="lg:col-span-8 space-y-6">
        
        {isGenerated ? (
          <div className="space-y-6">
            
            {/* Header controls for generated schedule */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
              <div className="text-left space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="font-serif text-lg font-bold text-[#2D2D2D]">
                    {studentName} - Çalışma Planı
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  Alan: <span className="font-semibold text-slate-700">{examGroup}</span> • Hedef: <span className="font-semibold text-emerald-800">{targetGoal || 'Genel Gelişim'}</span>
                </p>
              </div>

              {/* Utility Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSaveSchedule}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="Gelecekte hızlıca çağırmak için kaydet"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Sisteme Kaydet</span>
                </button>

                <button
                  onClick={handleCopyWhatsApp}
                  className="flex items-center gap-1.5 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-800 border border-green-200/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="WhatsApp mesaj şablonu kopyala"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>WhatsApp Kopyala</span>
                </button>

                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="Excel (Haftalık Program) indir"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel İndir</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="Programı Yazdır / PDF olarak kaydet"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Yazdır / PDF</span>
                </button>
              </div>
            </div>

            {/* Print Friendly Page (Hidden on screen, shown on print) */}
            <div className="hidden print:block bg-white text-black p-8 text-left space-y-6">
              <div className="text-center border-b-2 border-stone-900 pb-4">
                <h1 className="text-2xl font-serif font-bold tracking-tight">GAMZE TOSUN DANIŞMANLIK & ÖĞRENCİ KOÇLUĞU</h1>
                <p className="text-sm font-serif italic mt-1">"Başarı tesadüf değil, doğru rehberliğin sonucudur."</p>
                <div className="mt-4 grid grid-cols-3 gap-4 text-xs font-semibold max-w-xl mx-auto border border-stone-200 p-2 bg-stone-50">
                  <div>ÖĞRENCİ: {studentName}</div>
                  <div>ALAN: {examGroup}</div>
                  <div>HEDEF: {targetGoal || 'Bireysel Başarı'}</div>
                </div>
              </div>

              <div className="space-y-6 text-xs">
                {DAYS.map(day => (
                  <div key={day} className="border-b border-stone-200 pb-4">
                    <h3 className="font-bold text-sm text-stone-800 uppercase border-l-4 border-stone-800 pl-2 mb-2">{day}</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {(schedule[day] || []).map((slot, i) => (
                        <div key={i} className="grid grid-cols-12 gap-3 border border-stone-100 p-2 bg-stone-50/50 rounded">
                          <div className="col-span-2 font-bold font-mono text-stone-600">{slot.time}</div>
                          <div className="col-span-3 font-bold text-stone-800">{slot.subject}</div>
                          <div className="col-span-4 text-stone-600">{slot.focus}</div>
                          <div className="col-span-3 italic text-stone-500">Öneri: {slot.advice}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Day Selector Tabs (Interactive Screen Grid) */}
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm flex flex-col print:hidden">
              
              {/* Tabs list */}
              <div className="flex border-b border-stone-150 overflow-x-auto bg-stone-50 scrollbar-none">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`flex-1 py-3 px-4 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                      selectedDay === day
                        ? 'bg-white text-[#C5A059] border-[#C5A059]'
                        : 'text-stone-500 hover:bg-stone-100/50 border-transparent'
                    }`}
                  >
                    {day}
                    <span className="ml-1 text-[10px] text-stone-400 font-normal">
                      ({(schedule[day] || []).length})
                    </span>
                  </button>
                ))}
              </div>

              {/* Day slots listing */}
              <div className="p-6 bg-white space-y-4">
                
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="text-left">
                    <h4 className="font-serif font-bold text-base text-[#2D2D2D]">
                      {selectedDay} Günü Çalışma Akışı
                    </h4>
                    <p className="text-[10px] text-stone-400">
                      Zaman dilimlerini ve ders detaylarını aşağıdan dilediğiniz gibi özelleştirebilirsiniz.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleAddNewSlot(selectedDay)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#C5A059]/10 hover:bg-[#C5A059]/20 text-[#C5A059] rounded-xl text-[10px] font-bold transition-all cursor-pointer border border-[#C5A059]/30"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Ders Ekle</span>
                  </button>
                </div>

                <div className="space-y-3.5">
                  {(schedule[selectedDay] || []).length > 0 ? (
                    (schedule[selectedDay] || []).map((slot, index) => (
                      <motion.div
                        key={slot.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`border rounded-xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-left ${slot.color}`}
                      >
                        
                        {/* Time & Subject */}
                        <div className="flex items-start gap-3.5 md:w-1/3">
                          <div className="p-2 bg-white/70 border border-white/20 rounded-lg shrink-0 flex flex-col items-center justify-center text-center">
                            <Clock className="w-3.5 h-3.5 text-stone-500 mb-0.5" />
                            <span className="text-[9px] font-bold font-mono text-stone-600 tracking-tight leading-none">
                              {slot.time}
                            </span>
                          </div>
                          
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Ders</span>
                            <h5 className="font-bold text-slate-900 text-sm">{slot.subject}</h5>
                          </div>
                        </div>

                        {/* Focus & Coaching advice */}
                        <div className="flex-1 space-y-1 bg-white/30 rounded-xl p-3 border border-white/10">
                          <p className="text-xs text-slate-800 font-medium flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                            <span>{slot.focus}</span>
                          </p>
                          <p className="text-[10px] text-slate-500 italic flex items-start gap-1">
                            <AlertCircle className="w-3 h-3 text-[#C5A059] mt-0.5 shrink-0" />
                            <span>{slot.advice}</span>
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0 self-end md:self-center">
                          <button
                            onClick={() => handleOpenEditSlot(selectedDay, index, slot)}
                            className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-white/70 border border-stone-200/50 rounded-lg transition-colors bg-white/20"
                            title="Düzenle"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSlot(selectedDay, index)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 border border-stone-200/50 rounded-lg transition-colors bg-white/20"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-xl space-y-3">
                      <Calendar className="w-10 h-10 text-stone-300 mx-auto" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-stone-500">Bugün Boş Bırakıldı</p>
                        <p className="text-[10px] text-stone-400 max-w-xs mx-auto">
                          Öğrencinin bu günü dinlenme günü olabilir veya yukarıdaki butona tıklayarak dilediğiniz bir çalışma planı ekleyebilirsiniz.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px] space-y-5">
            <div className="p-4 bg-[#C5A059]/10 text-[#C5A059] rounded-2xl border border-[#C5A059]/20 animate-pulse">
              <Sparkles className="w-10 h-10 stroke-1" />
            </div>
            
            <div className="space-y-2 max-w-md">
              <h3 className="font-serif text-lg font-bold text-[#2D2D2D]">Ders Programı Robotu Hazır!</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Sol taraftaki panelden öğrencimizin ismini, hedeflerini, haftalık yoğunluğunu ve öncelikli derslerini seçin, ardından <strong>"Yeni Program Oluştur"</strong> butonuna basın. Gamze Hanım'ın koçluk standartlarında, dengeli ve hedefe ulaştıran profesyonel program anında tasarlanacaktır.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* EDIT MODAL OVERLAY */}
      <AnimatePresence>
        {isEditModalOpen && editingSlot && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-60 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden border border-stone-200 shadow-2xl text-left flex flex-col"
            >
              {/* Header */}
              <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
                <h4 className="font-serif font-bold text-sm">Zaman Dilimi Düzenle ({editingSlot.day})</h4>
                <button 
                  onClick={() => { setIsEditModalOpen(false); setEditingSlot(null); }}
                  className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveEditedSlot} className="p-5 space-y-4">
                
                {/* Time range */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Çalışma Saat Aralığı</label>
                  <input 
                    type="text"
                    required
                    value={editingSlot.slot.time}
                    onChange={(e) => setEditingSlot({
                      ...editingSlot,
                      slot: { ...editingSlot.slot, time: e.target.value }
                    })}
                    placeholder="Örn: 17:00 - 18:30"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-200 rounded-xl text-xs focus:border-[#C5A059] focus:outline-none transition-colors"
                  />
                </div>

                {/* Subject Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Ders Adı</label>
                  <input 
                    type="text"
                    required
                    value={editingSlot.slot.subject}
                    onChange={(e) => setEditingSlot({
                      ...editingSlot,
                      slot: { ...editingSlot.slot, subject: e.target.value }
                    })}
                    placeholder="Örn: Matematik (AYT)"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-200 rounded-xl text-xs focus:border-[#C5A059] focus:outline-none transition-colors"
                  />
                </div>

                {/* Focus / Topics */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Konu Odak Noktası</label>
                  <textarea 
                    required
                    rows={2}
                    value={editingSlot.slot.focus}
                    onChange={(e) => setEditingSlot({
                      ...editingSlot,
                      slot: { ...editingSlot.slot, focus: e.target.value }
                    })}
                    placeholder="Örn: Fonksiyonlar Soru Çözümü + Çözülemeyenler Analizi"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-200 rounded-xl text-xs focus:border-[#C5A059] focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Advice / Tip */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Öğretmen Tavsiyesi / Notu</label>
                  <textarea 
                    rows={2}
                    value={editingSlot.slot.advice}
                    onChange={(e) => setEditingSlot({
                      ...editingSlot,
                      slot: { ...editingSlot.slot, advice: e.target.value }
                    })}
                    placeholder="Örn: Süre tutarak çöz ve yanlış soruların formüllerini panoya as!"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-200 rounded-xl text-xs focus:border-[#C5A059] focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Submit */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setIsEditModalOpen(false); setEditingSlot(null); }}
                    className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl text-center cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl text-center cursor-pointer shadow-md"
                  >
                    Kaydet
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
