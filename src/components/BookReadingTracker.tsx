import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Plus, Trash2, Calendar, Clock, CheckCircle2, 
  Sparkles, Search, Filter, Bookmark, Award, FileText, ChevronDown 
} from 'lucide-react';
import { BookReadingLog, StudentAccount } from '../types';

interface BookReadingTrackerProps {
  logs: BookReadingLog[];
  onAddLog?: (log: Omit<BookReadingLog, 'id'>) => Promise<void>;
  onDeleteLog?: (id: string) => Promise<void>;
  student?: StudentAccount | null;
  readOnly?: boolean;
  userRole?: 'student' | 'coach' | 'parent';
}

export default function BookReadingTracker({
  logs,
  onAddLog,
  onDeleteLog,
  student,
  readOnly = false,
  userRole = 'student'
}: BookReadingTrackerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'pages' | 'duration'>('date');
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pageCount, setPageCount] = useState<number | ''>(25);
  const [durationMinutes, setDurationMinutes] = useState<number | ''>(30);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('tr-TR'));

  // Quick book presets for easy selection
  const commonBooks = [
    { title: 'Şeker Portakalı', author: 'José Mauro de Vasconcelos' },
    { title: 'Küçük Prens', author: 'Antoine de Saint-Exupéry' },
    { title: 'Simyacı', author: 'Paulo Coelho' },
    { title: '1984', author: 'George Orwell' },
    { title: 'Fahrenheit 451', author: 'Ray Bradbury' },
    { title: 'Beyaz Diş', author: 'Jack London' },
    { title: 'Dönüşüm', author: 'Franz Kafka' },
    { title: 'Martı Jonathan Livingston', author: 'Richard Bach' }
  ];

  // Key metrics
  const totalPages = useMemo(() => logs.reduce((acc, l) => acc + (Number(l.pageCount) || 0), 0), [logs]);
  const totalMinutes = useMemo(() => logs.reduce((acc, l) => acc + (Number(l.durationMinutes) || 0), 0), [logs]);
  const totalSessions = logs.length;
  const distinctBooks = useMemo(() => {
    const set = new Set(logs.map(l => l.bookTitle.trim().toLowerCase()));
    return set.size;
  }, [logs]);

  // Filtered and sorted logs
  const filteredLogs = useMemo(() => {
    return logs
      .filter(l => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return l.bookTitle.toLowerCase().includes(q) || 
               (l.author && l.author.toLowerCase().includes(q)) || 
               (l.notes && l.notes.toLowerCase().includes(q)) ||
               l.date.includes(q);
      })
      .sort((a, b) => {
        if (sortBy === 'pages') return (b.pageCount || 0) - (a.pageCount || 0);
        if (sortBy === 'duration') return (b.durationMinutes || 0) - (a.durationMinutes || 0);
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [logs, searchTerm, sortBy]);

  const maxPageInLogs = useMemo(() => {
    return Math.max(...logs.map(l => l.pageCount || 0), 50);
  }, [logs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student && userRole === 'student') return;
    if (!bookTitle.trim()) {
      alert('Lütfen kitap adını giriniz.');
      return;
    }
    if (!pageCount || Number(pageCount) <= 0) {
      alert('Lütfen okunan geçerli bir sayfa sayısı giriniz.');
      return;
    }

    setSubmitting(true);
    try {
      if (onAddLog) {
        await onAddLog({
          studentUsername: student?.username || 'ogrenci',
          studentFullName: student?.fullName || 'Öğrenci',
          studentClass: student?.studentClass || 'LGS',
          date: date || new Date().toLocaleDateString('tr-TR'),
          bookTitle: bookTitle.trim(),
          author: author.trim(),
          pageCount: Number(pageCount),
          durationMinutes: Number(durationMinutes || 0),
          notes: notes.trim(),
          createdAt: new Date().toISOString()
        });
      }

      // Reset form
      setBookTitle('');
      setAuthor('');
      setPageCount(25);
      setDurationMinutes(30);
      setNotes('');
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-sm space-y-6">
      
      {/* HEADER & SUMMARY CHIPS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </span>
            <h3 className="font-serif font-black text-lg sm:text-xl text-slate-900">
              Günlük Kitap Okuma Takibi & Raporu
            </h3>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Öğrencinin okuduğu kitaplar, sayfa sayıları, günlük okuma alışkanlığı ve kitap tahlil notları.
          </p>
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C5A059] hover:bg-[#b08d47] text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Okuma Ekle</span>
          </button>
        )}
      </div>

      {/* STATS METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-left">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Toplam Sayfa</span>
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="font-serif font-black text-xl sm:text-3xl text-emerald-950 font-mono">
            {totalPages.toLocaleString('tr-TR')}
          </div>
          <p className="text-[10px] text-emerald-700 mt-0.5">Okunan toplam sayfa</p>
        </div>

        <div className="p-3 sm:p-4 bg-amber-50/70 border border-amber-200/70 rounded-xl text-left">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Okuma Süresi</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="font-serif font-black text-xl sm:text-3xl text-amber-950 font-mono">
            {Math.floor(totalMinutes / 60)}s {totalMinutes % 60}dk
          </div>
          <p className="text-[10px] text-amber-700 mt-0.5">Toplam ayrılan zaman</p>
        </div>

        <div className="p-3 sm:p-4 bg-sky-50/70 border border-sky-200/70 rounded-xl text-left">
          <div className="flex items-center justify-between text-sky-700 mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Farklı Kitap</span>
            <Bookmark className="w-4 h-4" />
          </div>
          <div className="font-serif font-black text-xl sm:text-3xl text-sky-950 font-mono">
            {distinctBooks}
          </div>
          <p className="text-[10px] text-sky-700 mt-0.5">Okuma listesindeki eser</p>
        </div>

        <div className="p-3 sm:p-4 bg-indigo-50/70 border border-indigo-200/70 rounded-xl text-left">
          <div className="flex items-center justify-between text-indigo-700 mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Okuma Seansı</span>
            <Award className="w-4 h-4" />
          </div>
          <div className="font-serif font-black text-xl sm:text-3xl text-indigo-950 font-mono">
            {totalSessions}
          </div>
          <p className="text-[10px] text-indigo-700 mt-0.5">Kayıtlı oturum sayısı</p>
        </div>
      </div>

      {/* ADD READING LOG FORM MODAL/DRAWER */}
      {isFormOpen && !readOnly && (
        <form onSubmit={handleSubmit} className="bg-stone-50 p-4 sm:p-6 rounded-xl border border-[#C5A059]/40 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <h4 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              Günlük Kitap Okuma Kaydı Ekle
            </h4>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold"
            >
              Vazgeç
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            
            {/* Kitap Adı */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Kitap Adı *</label>
              <input
                type="text"
                placeholder="Örn: Şeker Portakalı, Simyacı..."
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                required
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
              />
              {/* Quick Select Presets */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                <span className="text-[9px] text-slate-400 font-bold">Örnekler:</span>
                {commonBooks.slice(0, 4).map((b, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setBookTitle(b.title); setAuthor(b.author); }}
                    className="text-[9px] bg-white border border-stone-200 text-slate-600 px-1.5 py-0.5 rounded hover:bg-[#C5A059]/10 hover:text-[#C5A059]"
                  >
                    {b.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Yazar */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Yazar (İsteğe Bağlı)</label>
              <input
                type="text"
                placeholder="Örn: José Mauro de Vasconcelos"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
              />
            </div>

            {/* Tarih */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Okuma Tarihi</label>
              <input
                type="text"
                placeholder="GG.AA.YYYY"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
              />
            </div>

            {/* Okunan Sayfa */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Okunan Sayfa Sayısı *</label>
              <input
                type="number"
                min="1"
                max="1500"
                placeholder="Örn: 35"
                value={pageCount}
                onChange={(e) => setPageCount(e.target.value === '' ? '' : Number(e.target.value))}
                required
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C5A059] focus:outline-none font-mono font-bold"
              />
            </div>

            {/* Okuma Süresi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Okuma Süresi (Dakika)</label>
              <input
                type="number"
                min="1"
                max="600"
                placeholder="Örn: 30"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C5A059] focus:outline-none font-mono"
              />
            </div>

            {/* Not & Özet */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Kısa Not / Özet / Kazanım</label>
              <input
                type="text"
                placeholder="Örn: 4. bölüm bitti, karakterin iç çatışması incelendi."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
              />
            </div>

          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 bg-white border border-stone-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-stone-100 cursor-pointer"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Kaydediliyor...' : 'Kitap Okuma Kaydet'}
            </button>
          </div>
        </form>
      )}

      {/* READING VISUAL BAR CHART */}
      {logs.length > 0 && (
        <div className="bg-stone-50/80 p-4 sm:p-5 rounded-xl border border-stone-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <h4 className="font-bold text-sm text-slate-900">
                Okuma Seansları ve Sayfa Dağılımı Sütun Grafiği
              </h4>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-stone-200">
              Son {Math.min(10, logs.length)} Seans
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2 items-end min-h-[140px] pt-6 pb-2 px-2 bg-white rounded-lg border border-stone-200">
            {logs.slice(0, 10).reverse().map((log, idx) => {
              const heightPercent = Math.min(100, Math.max(15, ((log.pageCount || 0) / maxPageInLogs) * 100));
              return (
                <div key={idx} className="flex flex-col items-center gap-1 group">
                  <span className="text-[10px] font-mono font-bold text-emerald-800 opacity-0 group-hover:opacity-100 transition-opacity">
                    {log.pageCount} sf
                  </span>
                  <div className="w-full max-w-[32px] bg-stone-100 h-24 rounded-t-md flex items-end overflow-hidden p-0.5">
                    <div 
                      className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-sm transition-all duration-500 group-hover:from-emerald-500 group-hover:to-teal-300"
                      style={{ height: `${heightPercent}%` }}
                      title={`${log.bookTitle} - ${log.pageCount} sayfa (${log.durationMinutes} dk)`}
                    />
                  </div>
                  <span className="text-[8px] font-bold text-slate-600 truncate max-w-[50px] text-center" title={log.bookTitle}>
                    {log.bookTitle}
                  </span>
                  <span className="text-[8px] text-slate-400 font-mono">
                    {log.date.split('.')[0]}.{log.date.split('.')[1]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LOGS TABLE / LIST */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
          
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Kitap adı, yazar veya not ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-stone-300 text-slate-800 text-xs sm:text-sm pl-8 pr-3 py-1.5 rounded-lg focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Sırala:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-stone-300 text-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
            >
              <option value="date">En Yeni Tarih</option>
              <option value="pages">En Çok Sayfa</option>
              <option value="duration">En Uzun Süre</option>
            </select>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-10 bg-stone-50 rounded-xl border border-dashed border-stone-200 text-slate-500 text-xs sm:text-sm">
            Henüz kayıtlı kitap okuma girişi bulunmuyor.
          </div>
        ) : (
          <div className="overflow-x-auto border border-stone-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-100 text-slate-700 uppercase font-bold tracking-wider text-[10px] border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Tarih</th>
                  <th className="py-3 px-4">Kitap Adı & Yazar</th>
                  <th className="py-3 px-3 text-center">Okunan Sayfa</th>
                  <th className="py-3 px-3 text-center">Okuma Süresi</th>
                  <th className="py-3 px-4">Özet & Not</th>
                  {!readOnly && <th className="py-3 px-3 text-right">İşlem</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-slate-800">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600 font-semibold whitespace-nowrap">
                      {log.date}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">{log.bookTitle}</div>
                      {log.author && <div className="text-[10px] text-slate-500 font-medium">{log.author}</div>}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-mono font-black text-xs sm:text-sm text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-md">
                        {log.pageCount} sf
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-amber-900">
                      {log.durationMinutes > 0 ? `${log.durationMinutes} dk` : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate text-[11px]" title={log.notes}>
                      {log.notes || '-'}
                    </td>
                    {!readOnly && (
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onDeleteLog && onDeleteLog(log.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Kaydı Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
