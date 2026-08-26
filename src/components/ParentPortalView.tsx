import React, { useState, useMemo } from 'react';
import { 
  User, GraduationCap, Clock, CheckCircle2, BookOpen, Award, 
  BarChart2, Calendar, FileText, Printer, ArrowUpRight, TrendingUp, Sparkles, Filter, Bookmark 
} from 'lucide-react';
import { 
  ParentAccount, StudentAccount, DailyStudyLog, MockExamLog, BookReadingLog 
} from '../types';
import TopicAnalyticsBarChart from './TopicAnalyticsBarChart';
import BookReadingTracker from './BookReadingTracker';
import StudentReportPdfModal from './StudentReportPdfModal';

interface ParentPortalViewProps {
  parent: ParentAccount;
  student: StudentAccount;
  dailyLogs: DailyStudyLog[];
  mockLogs: MockExamLog[];
  bookLogs: BookReadingLog[];
  scheduleRecord: any;
}

export default function ParentPortalView({
  parent,
  student,
  dailyLogs,
  mockLogs,
  bookLogs,
  scheduleRecord
}: ParentPortalViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'topic_analytics' | 'daily' | 'book_reading' | 'mock' | 'schedule'>('overview');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [dailyFilterSubject, setDailyFilterSubject] = useState('all');

  // Key totals
  const totalStudyMinutes = useMemo(() => dailyLogs.reduce((acc, l) => acc + (Number(l.studyDurationMinutes) || 0), 0), [dailyLogs]);
  const totalQuestions = useMemo(() => dailyLogs.reduce((acc, l) => acc + (Number(l.solvedQuestions) || 0), 0), [dailyLogs]);
  const totalPages = useMemo(() => bookLogs.reduce((acc, l) => acc + (Number(l.pageCount) || 0), 0), [bookLogs]);
  const lastExam = mockLogs[0] || null;

  // Filtered daily study logs
  const filteredDailyLogs = useMemo(() => {
    if (dailyFilterSubject === 'all') return dailyLogs;
    return dailyLogs.filter(l => (l.subject || '').toLowerCase() === dailyFilterSubject.toLowerCase());
  }, [dailyLogs, dailyFilterSubject]);

  const uniqueSubjects = useMemo(() => {
    const set = new Set<string>();
    dailyLogs.forEach(l => {
      if (l.subject) set.add(l.subject);
    });
    return Array.from(set);
  }, [dailyLogs]);

  return (
    <div className="space-y-6">
      
      {/* 1. PARENT WELCOME & STUDENT IDENTITY HERO CARD */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 sm:p-7 shadow-xl border border-[#C5A059]/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-[#C5A059] text-slate-950 flex items-center justify-center font-serif font-black text-2xl rounded-2xl shadow-lg shrink-0">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="bg-[#C5A059] text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                  Veli Portalı
                </span>
                <span className="text-slate-400 text-xs">
                  Giriş Yapan: <strong className="text-white">{parent.fullName}</strong>
                </span>
              </div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-white">
                Öğrenciniz: <span className="text-[#C5A059]">{student.fullName}</span>
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Sınıf / Hazırlık Grubu: <span className="font-bold text-amber-200">{student.studentClass}</span> • Danışman: <span className="font-bold text-white">Gamze Tosun</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#C5A059] hover:bg-[#b08d47] text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Gelişim Raporunu (PDF / Yazdır) Al</span>
            </button>
          </div>

        </div>

        {/* SUMMARY METRICS IN HERO */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/60">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider block">Toplam Çalışma</span>
            <span className="font-serif font-black text-xl sm:text-2xl text-white font-mono block mt-0.5">
              {Math.floor(totalStudyMinutes / 60)}s {totalStudyMinutes % 60}dk
            </span>
            <span className="text-[10px] text-slate-400">{dailyLogs.length} Günlük Kayıt</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">Çözülen Soru</span>
            <span className="font-serif font-black text-xl sm:text-2xl text-white font-mono block mt-0.5">
              {totalQuestions.toLocaleString('tr-TR')}
            </span>
            <span className="text-[10px] text-slate-400">Toplam Çözülen</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-[10px] text-sky-400 uppercase font-bold tracking-wider block">Okunan Kitap</span>
            <span className="font-serif font-black text-xl sm:text-2xl text-white font-mono block mt-0.5">
              {totalPages} sf
            </span>
            <span className="text-[10px] text-slate-400">{bookLogs.length} Okuma Seansı</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider block">Son Deneme Neti</span>
            <span className="font-serif font-black text-xl sm:text-2xl text-white font-mono block mt-0.5">
              {lastExam ? `${lastExam.totalNet} Net` : '-'}
            </span>
            <span className="text-[10px] text-slate-400">{lastExam ? lastExam.examName : 'Deneme Girilmedi'}</span>
          </div>
        </div>
      </div>

      {/* 2. VELİ NAVİGASYON SEKMELERİ */}
      <div className="flex overflow-x-auto pb-1 gap-1.5 bg-white p-1.5 rounded-2xl border border-stone-200 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#C5A059] text-slate-950 shadow-sm'
              : 'text-slate-600 hover:text-slate-950 hover:bg-stone-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Gelişim Özeti</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('topic_analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'topic_analytics'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-950 hover:bg-stone-100'
          }`}
        >
          <BarChart2 className="w-4 h-4 text-amber-400" />
          <span>Konu Analizi & Sütun Grafiği</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('daily')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'daily'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-950 hover:bg-stone-100'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Günlük & Aylık Çalışmalar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('book_reading')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'book_reading'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-950 hover:bg-stone-100'
          }`}
        >
          <BookOpen className="w-4 h-4 text-sky-400" />
          <span>Kitap Okuma Takibi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mock')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'mock'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-950 hover:bg-stone-100'
          }`}
        >
          <Award className="w-4 h-4 text-indigo-400" />
          <span>Deneme Sınavları</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'schedule'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-950 hover:bg-stone-100'
          }`}
        >
          <Calendar className="w-4 h-4 text-rose-400" />
          <span>Ders Programı</span>
        </button>
      </div>

      {/* 3. SEKME İÇERİKLERİ */}

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <TopicAnalyticsBarChart 
            logs={dailyLogs} 
            studentName={student.fullName}
            studentClass={student.studentClass}
            title={`${student.fullName} - Konu Bazlı Çalışma & Soru Sütun Grafikleri`}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* SON GÜNLÜK ÇALIŞMALAR */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Son Günlük Çalışmalar
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveTab('daily')}
                  className="text-xs font-bold text-[#C5A059] hover:underline"
                >
                  Tümünü Gör
                </button>
              </div>

              {dailyLogs.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">Henüz çalışma girilmedi.</p>
              ) : (
                <div className="space-y-2.5">
                  {dailyLogs.slice(0, 5).map(l => (
                    <div key={l.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{l.subject}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-700 font-medium">{l.topic}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{l.date}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded block">
                          {l.solvedQuestions} Soru
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{l.studyDurationMinutes} dk</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SON KİTAP OKUMALARI */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-600" />
                  Son Kitap Okuma Kayıtları
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveTab('book_reading')}
                  className="text-xs font-bold text-[#C5A059] hover:underline"
                >
                  Tümünü Gör
                </button>
              </div>

              {bookLogs.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">Henüz kitap okuma girilmedi.</p>
              ) : (
                <div className="space-y-2.5">
                  {bookLogs.slice(0, 5).map(b => (
                    <div key={b.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{b.bookTitle}</span>
                        <span className="text-[10px] text-slate-500">{b.author || 'Yazar Belirtilmedi'} • {b.date}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded block font-mono">
                          {b.pageCount} Sayfa
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{b.durationMinutes} dk</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* TAB: TOPIC ANALYTICS & BAR CHARTS */}
      {activeTab === 'topic_analytics' && (
        <TopicAnalyticsBarChart 
          logs={dailyLogs} 
          studentName={student.fullName}
          studentClass={student.studentClass}
          title={`${student.fullName} - Konu Bazlı Kümülatif Çalışma, Süre & Soru Analizi`}
        />
      )}

      {/* TAB: DAILY LOGS */}
      {activeTab === 'daily' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-serif font-black text-lg text-slate-900">
                Günlük ve Aylık Çalışma Geçmişi
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Öğrencinin gün gün sisteme girdiği tüm ders, konu, soru ve süre detayları.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={dailyFilterSubject}
                onChange={(e) => setDailyFilterSubject(e.target.value)}
                className="bg-stone-50 border border-stone-300 text-slate-800 text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none"
              >
                <option value="all">Tüm Dersler</option>
                {uniqueSubjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredDailyLogs.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs sm:text-sm">
              Seçilen derse ait çalışma kaydı bulunmuyor.
            </div>
          ) : (
            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-stone-100 text-slate-700 font-bold uppercase text-[10px] border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Tarih</th>
                    <th className="py-3 px-4">Ders & Konu</th>
                    <th className="py-3 px-3 text-center">Çözülen Soru</th>
                    <th className="py-3 px-3 text-center">Doğru / Yanlış</th>
                    <th className="py-3 px-3 text-center">Çalışma Süresi</th>
                    <th className="py-3 px-4">Öğrenci Notu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-slate-800">
                  {filteredDailyLogs.map(l => (
                    <tr key={l.id} className="hover:bg-amber-50/30">
                      <td className="py-3 px-4 font-mono font-bold text-slate-600 whitespace-nowrap">{l.date}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{l.subject}</span>
                        <span className="text-slate-600 text-[11px]">{l.topic}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-emerald-800">
                        {l.solvedQuestions} Soru
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-[11px]">
                        {l.correctCount !== undefined ? `${l.correctCount} D / ${l.wrongCount || 0} Y` : '-'}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-amber-900">
                        {l.studyDurationMinutes} dk
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate text-[11px]" title={l.notes}>
                        {l.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: BOOK READING */}
      {activeTab === 'book_reading' && (
        <BookReadingTracker
          logs={bookLogs}
          student={student}
          readOnly={true}
          userRole="parent"
        />
      )}

      {/* TAB: MOCK EXAMS */}
      {activeTab === 'mock' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-serif font-black text-lg text-slate-900">
              Deneme Sınavları & Net Gelişim Tablosu
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Öğrencinin katıldığı tüm deneme sınavları, ders bazlı netleri ve hesaplanan puanları.
            </p>
          </div>

          {mockLogs.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs sm:text-sm">
              Henüz girilmiş deneme sınavı sonucu bulunmuyor.
            </div>
          ) : (
            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-stone-100 text-slate-700 font-bold uppercase text-[10px] border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Tarih</th>
                    <th className="py-3 px-4">Sınav Adı</th>
                    <th className="py-3 px-4">Ders Netleri</th>
                    <th className="py-3 px-3 text-center">Toplam Net</th>
                    <th className="py-3 px-3 text-center">Hesaplanan Puan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-slate-800">
                  {mockLogs.map(m => (
                    <tr key={m.id} className="hover:bg-indigo-50/30">
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">{m.date}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{m.examName}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(m.subjectNets || {}).map(([subj, net]) => (
                            <span key={subj} className="bg-stone-100 px-1.5 py-0.5 rounded text-[10px] font-mono">
                              {subj}: <strong>{net}</strong>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-black text-indigo-700 text-sm">
                        {m.totalNet}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-900 text-sm">
                        {m.score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: SCHEDULE */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-serif font-black text-lg text-slate-900">
              Haftalık Ders Çalışma Programı
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Gamze Hoca tarafından öğrenciye özel olarak hazırlanmış haftalık ders ve soru hedefleri.
            </p>
          </div>

          {!scheduleRecord?.schedule ? (
            <div className="text-center py-10 text-slate-400 text-xs sm:text-sm">
              Bu öğrenci için henüz haftalık ders programı tanımlanmamış.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
              {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map((day) => {
                const dayPlan = scheduleRecord.schedule[day] || [];
                return (
                  <div key={day} className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900 border-b border-stone-200 pb-1.5 mb-2 text-center uppercase tracking-wider">
                        {day}
                      </div>
                      {dayPlan.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic text-center py-3">Serbest / Tekrar</p>
                      ) : (
                        <div className="space-y-1.5">
                          {dayPlan.map((item: any, i: number) => (
                            <div key={i} className="bg-white p-2 rounded-lg border border-stone-200 text-[10px]">
                              <span className="font-bold text-slate-800 block truncate">{item.subject}</span>
                              <span className="text-slate-500 truncate block">{item.topic}</span>
                              <div className="flex items-center justify-between text-[#C5A059] font-bold mt-1">
                                <span>{item.targetQuestions} Soru</span>
                                <span>{item.duration} dk</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PDF REPORT MODAL */}
      <StudentReportPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        student={student}
        parent={parent}
        dailyLogs={dailyLogs}
        mockLogs={mockLogs}
        bookLogs={bookLogs}
      />

    </div>
  );
}
