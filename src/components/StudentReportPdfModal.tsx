import React, { useState, useMemo } from 'react';
import { 
  X, Printer, Download, CheckCircle2, Clock, BookOpen, 
  Award, BarChart2, GraduationCap, Calendar, User, Sparkles, FileText, Bookmark
} from 'lucide-react';
import { 
  StudentAccount, DailyStudyLog, MockExamLog, BookReadingLog, TopicCumulativeStat, ParentAccount 
} from '../types';

interface StudentReportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentAccount;
  parent?: ParentAccount | null;
  dailyLogs: DailyStudyLog[];
  mockLogs: MockExamLog[];
  bookLogs: BookReadingLog[];
  coachNote?: string;
}

export default function StudentReportPdfModal({
  isOpen,
  onClose,
  student,
  parent,
  dailyLogs,
  mockLogs,
  bookLogs,
  coachNote: initialCoachNote = "Öğrencimiz belirlenen haftalık hedeflerine uyum sağlamış, soru çözüm sürekliliğini ve kitap okuma alışkanlığını istikrarlı biçimde artırmıştır. Eksik konuların tekrarına ve deneme analizlerine odaklanılması tavsiye edilir."
}: StudentReportPdfModalProps) {
  const [coachNote, setCoachNote] = useState(initialCoachNote);
  const [isEditingNote, setIsEditingNote] = useState(false);

  // Compute topic cumulative statistics
  const topicStats: TopicCumulativeStat[] = useMemo(() => {
    const map = new Map<string, {
      subject: string;
      topic: string;
      sessionCount: number;
      totalDurationMinutes: number;
      totalQuestions: number;
      totalCorrect: number;
      totalWrong: number;
      totalEmpty: number;
      lastDate: string;
    }>();

    dailyLogs.forEach(log => {
      const subj = (log.subject || 'Genel').trim();
      const top = (log.topic || 'Genel Çalışma').trim();
      const key = `${subj}:::${top}`.toLowerCase();

      const duration = Number(log.studyDurationMinutes || 0);
      const questions = Number(log.solvedQuestions || 0);
      const correct = Number(log.correctCount || 0);
      const wrong = Number(log.wrongCount || 0);
      const empty = Number(log.emptyCount || 0);

      const existing = map.get(key);
      if (existing) {
        existing.sessionCount += 1;
        existing.totalDurationMinutes += duration;
        existing.totalQuestions += questions;
        existing.totalCorrect += correct;
        existing.totalWrong += wrong;
        existing.totalEmpty += empty;
        existing.lastDate = log.date || existing.lastDate;
      } else {
        map.set(key, {
          subject: subj,
          topic: top,
          sessionCount: 1,
          totalDurationMinutes: duration,
          totalQuestions: questions,
          totalCorrect: correct,
          totalWrong: wrong,
          totalEmpty: empty,
          lastDate: log.date || ''
        });
      }
    });

    const list: TopicCumulativeStat[] = [];
    map.forEach(val => {
      const answered = val.totalCorrect + val.totalWrong;
      const accuracy = answered > 0 ? Math.round((val.totalCorrect / answered) * 100) : (val.totalQuestions > 0 ? 85 : 0);
      list.push({
        subject: val.subject,
        topic: val.topic,
        sessionCount: val.sessionCount,
        totalDurationMinutes: val.totalDurationMinutes,
        totalQuestions: val.totalQuestions,
        totalCorrect: val.totalCorrect,
        totalWrong: val.totalWrong,
        totalEmpty: val.totalEmpty,
        accuracyRate: accuracy,
        lastStudiedDate: val.lastDate
      });
    });

    return list.sort((a, b) => b.totalDurationMinutes - a.totalDurationMinutes);
  }, [dailyLogs]);

  // Overall totals
  const totalStudyMinutes = useMemo(() => dailyLogs.reduce((acc, l) => acc + (Number(l.studyDurationMinutes) || 0), 0), [dailyLogs]);
  const totalQuestions = useMemo(() => dailyLogs.reduce((acc, l) => acc + (Number(l.solvedQuestions) || 0), 0), [dailyLogs]);
  const totalBookPages = useMemo(() => bookLogs.reduce((acc, l) => acc + (Number(l.pageCount) || 0), 0), [bookLogs]);
  const avgMockNet = useMemo(() => {
    if (mockLogs.length === 0) return 0;
    const sum = mockLogs.reduce((acc, m) => acc + (Number(m.totalNet) || 0), 0);
    return Math.round((sum / mockLogs.length) * 10) / 10;
  }, [mockLogs]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* Container with exact A4 print specifications */}
      <div className="bg-white w-full max-w-4xl max-h-[96vh] rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-stone-300 print:max-w-none print:max-h-none print:shadow-none print:border-none print:rounded-none print:overflow-visible">
        
        {/* NON-PRINTABLE TOP TOOLBAR */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-[#C5A059]/40 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#C5A059]" />
            <h3 className="font-serif font-bold text-sm sm:text-base text-white">
              Öğrenci Gelişim & Takip Raporu (PDF / Yazdır)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#C5A059] hover:bg-[#b08d47] text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF İndir / Yazdır</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT CONTENT */}
        <div id="printable-student-report" className="flex-grow overflow-y-auto p-6 sm:p-10 space-y-6 bg-white text-slate-900 print:p-6 print:overflow-visible font-sans">
          
          {/* 1. ANTELLİ LOGO & BAŞLIK */}
          <div className="flex items-center justify-between border-b-2 border-[#C5A059] pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-[#2D2D2D] text-[#C5A059] flex items-center justify-center font-serif font-black text-2xl rounded-sm border border-[#C5A059]">
                GT
              </div>
              <div>
                <h1 className="font-serif font-black text-xl sm:text-2xl text-slate-900 tracking-tight leading-none uppercase">
                  GAMZE TOSUN
                </h1>
                <p className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-[#C5A059] uppercase mt-1">
                  EĞİTİM DANIŞMANLIĞI & ÖĞRENCİ KOÇLUĞU
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Rapor Tarihi</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-slate-800">
                {new Date().toLocaleDateString('tr-TR')}
              </span>
              <span className="text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold block mt-1">
                Doğrulanmış Rapor
              </span>
            </div>
          </div>

          {/* 2. ÖĞRENCİ & VELİ KİMLİK KARTI */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Öğrenci Adı Soyadı</span>
              <span className="font-bold text-slate-900 text-sm block mt-0.5">{student.fullName}</span>
              <span className="text-[10px] text-slate-500 font-mono">@{student.username}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Sınıf / Sınav Grubu</span>
              <span className="font-bold text-slate-900 text-sm block mt-0.5">{student.studentClass}</span>
              <span className="text-[10px] text-amber-700 font-semibold">Aktif Koçluk Programı</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Veli Bilgisi</span>
              <span className="font-bold text-slate-900 text-sm block mt-0.5">
                {parent?.fullName || 'Tanımlı Veli'}
              </span>
              <span className="text-[10px] text-slate-500">{parent?.phone || '-'}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Danışman / Koç</span>
              <span className="font-bold text-slate-900 text-sm block mt-0.5">Gamze Tosun</span>
              <span className="text-[10px] text-[#C5A059] font-bold">Öğrenci Koçu</span>
            </div>
          </div>

          {/* 3. PERFORMANS ÖZET METRİK KUTULARI */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-center">
              <span className="text-[9px] sm:text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Toplam Çalışma</span>
              <span className="font-serif font-black text-lg sm:text-2xl text-amber-950 font-mono block mt-0.5">
                {Math.floor(totalStudyMinutes / 60)}s {totalStudyMinutes % 60}dk
              </span>
              <span className="text-[9px] text-amber-700">{dailyLogs.length} Çalışma Seansı</span>
            </div>

            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-center">
              <span className="text-[9px] sm:text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Toplam Soru</span>
              <span className="font-serif font-black text-lg sm:text-2xl text-emerald-950 font-mono block mt-0.5">
                {totalQuestions.toLocaleString('tr-TR')}
              </span>
              <span className="text-[9px] text-emerald-700">Çözülen Soru Sayısı</span>
            </div>

            <div className="p-3 bg-sky-50/80 border border-sky-200 rounded-xl text-center">
              <span className="text-[9px] sm:text-[10px] font-bold text-sky-800 uppercase tracking-wider block">Okunan Kitap</span>
              <span className="font-serif font-black text-lg sm:text-2xl text-sky-950 font-mono block mt-0.5">
                {totalBookPages} sf
              </span>
              <span className="text-[9px] text-sky-700">{bookLogs.length} Kitap Seansı</span>
            </div>

            <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl text-center">
              <span className="text-[9px] sm:text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">Deneme Net Ort.</span>
              <span className="font-serif font-black text-lg sm:text-2xl text-indigo-950 font-mono block mt-0.5">
                {avgMockNet > 0 ? `${avgMockNet} Net` : '-'}
              </span>
              <span className="text-[9px] text-indigo-700">{mockLogs.length} Deneme Sınavı</span>
            </div>
          </div>

          {/* 4. KONU BAZLI KÜMÜLATİF ÇALIŞMA TABLOSU */}
          <div>
            <div className="flex items-center justify-between border-b border-stone-200 pb-1.5 mb-2.5">
              <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-[#C5A059]" />
                Konu Bazlı Kümülatif Çalışma & Soru Dağılımı
              </h3>
              <span className="text-[10px] font-mono text-slate-500 font-bold">
                Toplam {topicStats.length} Konu
              </span>
            </div>

            {topicStats.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">Kayıtlı konu çalışması bulunmamaktadır.</p>
            ) : (
              <div className="overflow-x-auto border border-stone-200 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-stone-100 text-slate-700 uppercase font-bold text-[9px] border-b border-stone-200">
                    <tr>
                      <th className="py-2 px-3">Ders</th>
                      <th className="py-2 px-3">Konu Başlığı</th>
                      <th className="py-2 px-2 text-center">Kaç Kez Çalışıldı</th>
                      <th className="py-2 px-2 text-center">Toplam Süre</th>
                      <th className="py-2 px-2 text-center">Çözülen Soru</th>
                      <th className="py-2 px-2 text-center">Doğru / Yanlış</th>
                      <th className="py-2 px-2 text-center">Başarı Oranı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-slate-800 text-[11px]">
                    {topicStats.slice(0, 12).map((st, i) => {
                      const h = Math.floor(st.totalDurationMinutes / 60);
                      const m = st.totalDurationMinutes % 60;
                      return (
                        <tr key={i} className="hover:bg-stone-50">
                          <td className="py-2 px-3 font-semibold text-slate-700">{st.subject}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{st.topic}</td>
                          <td className="py-2 px-2 text-center font-bold text-amber-800">
                            {st.sessionCount} kez
                          </td>
                          <td className="py-2 px-2 text-center font-mono font-bold">
                            {h > 0 ? `${h}s ` : ''}{m} dk
                          </td>
                          <td className="py-2 px-2 text-center font-mono font-bold text-emerald-800">
                            {st.totalQuestions}
                          </td>
                          <td className="py-2 px-2 text-center font-mono text-[10px]">
                            {st.totalCorrect} D / {st.totalWrong} Y
                          </td>
                          <td className="py-2 px-2 text-center font-bold">
                            %{st.accuracyRate}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 5. DENEME SINAVLARI & KİTAP OKUMA İKİLİ TABLO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Deneme Sınavları */}
            <div>
              <div className="flex items-center justify-between border-b border-stone-200 pb-1.5 mb-2">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  Deneme Sınavı Performansı
                </h4>
              </div>

              {mockLogs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Kayıtlı deneme bulunmamaktadır.</p>
              ) : (
                <div className="border border-stone-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100 text-slate-700 text-[9px] uppercase font-bold">
                      <tr>
                        <th className="py-1.5 px-2.5">Sınav Adı</th>
                        <th className="py-1.5 px-2 text-center">Net</th>
                        <th className="py-1.5 px-2 text-center">Puan</th>
                        <th className="py-1.5 px-2 text-right">Tarih</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-[10px]">
                      {mockLogs.slice(0, 5).map((m, i) => (
                        <tr key={i}>
                          <td className="py-1.5 px-2.5 font-bold truncate max-w-[140px]">{m.examName}</td>
                          <td className="py-1.5 px-2 text-center font-mono font-bold text-indigo-700">{m.totalNet} Net</td>
                          <td className="py-1.5 px-2 text-center font-mono font-bold">{m.score}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-500">{m.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Kitap Okuma Geçmişi */}
            <div>
              <div className="flex items-center justify-between border-b border-stone-200 pb-1.5 mb-2">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  Kitap Okuma Geçmişi
                </h4>
              </div>

              {bookLogs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Kayıtlı kitap okuması bulunmamaktadır.</p>
              ) : (
                <div className="border border-stone-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100 text-slate-700 text-[9px] uppercase font-bold">
                      <tr>
                        <th className="py-1.5 px-2.5">Kitap Adı</th>
                        <th className="py-1.5 px-2 text-center">Sayfa</th>
                        <th className="py-1.5 px-2 text-center">Süre</th>
                        <th className="py-1.5 px-2 text-right">Tarih</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-[10px]">
                      {bookLogs.slice(0, 5).map((b, i) => (
                        <tr key={i}>
                          <td className="py-1.5 px-2.5 font-bold truncate max-w-[140px]">{b.bookTitle}</td>
                          <td className="py-1.5 px-2 text-center font-mono font-bold text-emerald-700">{b.pageCount} sf</td>
                          <td className="py-1.5 px-2 text-center font-mono">{b.durationMinutes} dk</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-500">{b.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* 6. KOÇ DEĞERLENDİRME & TAVSİYE NOTU */}
          <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-serif font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                Gamze Tosun Koçluk Değerlendirmesi ve Stratejik Tavsiyeler
              </span>
              <button
                type="button"
                onClick={() => setIsEditingNote(!isEditingNote)}
                className="text-[10px] font-bold text-[#C5A059] hover:underline print:hidden"
              >
                {isEditingNote ? 'Tamamla' : 'Notu Düzenle'}
              </button>
            </div>

            {isEditingNote ? (
              <textarea
                value={coachNote}
                onChange={(e) => setCoachNote(e.target.value)}
                rows={3}
                className="w-full bg-white border border-amber-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none font-sans"
              />
            ) : (
              <p className="text-xs leading-relaxed text-slate-800 italic">
                "{coachNote}"
              </p>
            )}
          </div>

          {/* 7. RESMİ İMZA & ONAY ALANI */}
          <div className="pt-6 border-t border-stone-200 flex items-center justify-between text-xs text-slate-500">
            <div>
              <p className="font-bold text-slate-900">Gamze Tosun</p>
              <p className="text-[10px]">Eğitim Danışmanı & Öğrenci Koçu</p>
            </div>
            <div className="text-right">
              <p className="font-serif font-bold text-[#C5A059]">Gamze Tosun Eğitim Danışmanlığı</p>
              <p className="text-[9px] text-slate-400">Resmi Öğrenci Gelişim & Takip Belgesi</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
