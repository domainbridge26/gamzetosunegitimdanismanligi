import React, { useState, useMemo } from 'react';
import { 
  Calendar, Clock, CheckCircle2, AlertCircle, Sparkles, Filter, 
  ChevronLeft, ChevronRight, FileText, Download, Eye, Award, 
  Check, X, Edit3, MessageSquare, History, BookmarkCheck, ArrowRight,
  BookOpen
} from 'lucide-react';
import { StudentAccount, StudentScheduleRecord, ScheduleItem, DailyStudyLog } from '../types';
import { dbUpdateScheduleItemStatus, dbSetActiveProgram, dbDeleteStudentProgram, dbSaveStudentProgram } from '../lib/firebase';

interface HorizontalWeeklyScheduleTableProps {
  student: StudentAccount;
  allPrograms: StudentScheduleRecord[];
  currentProgram: StudentScheduleRecord | null;
  dailyLogs?: DailyStudyLog[];
  isCoachView?: boolean;
  onProgramChange?: (programId: string) => void;
  onStatusChange?: (updatedProgram: StudentScheduleRecord) => void;
  onOpenUploadPdf?: () => void;
}

const DAYS_OF_WEEK = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export default function HorizontalWeeklyScheduleTable({
  student,
  allPrograms,
  currentProgram,
  dailyLogs = [],
  isCoachView = false,
  onProgramChange,
  onStatusChange,
  onOpenUploadPdf
}: HorizontalWeeklyScheduleTableProps) {
  const [selectedProgramId, setSelectedProgramId] = useState<string>(
    currentProgram?.id || allPrograms[0]?.id || ''
  );
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress' | 'pending' | 'missed'>('all');
  const [editingSlot, setEditingSlot] = useState<{
    day: string;
    index: number;
    item: ScheduleItem;
  } | null>(null);

  // Form states for editing slot status
  const [editStatus, setEditStatus] = useState<'completed' | 'in_progress' | 'pending' | 'missed'>('completed');
  const [editSolvedQuestions, setEditSolvedQuestions] = useState<number>(0);
  const [editCorrect, setEditCorrect] = useState<number>(0);
  const [editWrong, setEditWrong] = useState<number>(0);
  const [editStudentNote, setEditStudentNote] = useState<string>('');
  const [isSavingSlot, setIsSavingSlot] = useState(false);
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [parsingMsg, setParsingMsg] = useState('');

  // Active program being viewed
  const activeProgram = useMemo(() => {
    return allPrograms.find(p => p.id === selectedProgramId) || currentProgram || allPrograms[0] || null;
  }, [allPrograms, selectedProgramId, currentProgram]);

  const handleAutoParseToTable = async (prog: StudentScheduleRecord) => {
    if (!prog.uploadedPdf?.dataUrl || isParsingPdf) return;
    setIsParsingPdf(true);
    setParsingMsg('PDF ders programı analiz ediliyor ve yatay tablo şablonuna otomatik aktarılıyor...');

    try {
      let finalSchedule: Record<string, any> | null = null;
      try {
        const res = await fetch('/api/parse-schedule-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pdfBase64: prog.uploadedPdf.dataUrl,
            studentName: prog.studentName || student.fullName,
            examGroup: prog.examGroup || student.studentClass,
            notes: prog.uploadedPdf.notes || ''
          })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data?.schedule && Object.keys(json.data.schedule).length > 0) {
            finalSchedule = json.data.schedule;
          }
        }
      } catch (err) {
        console.warn('Backend parse attempt error:', err);
      }

      if (!finalSchedule) {
        finalSchedule = {
          "Pazartesi": [],
          "Salı": [],
          "Çarşamba": [],
          "Perşembe": [],
          "Cuma": [],
          "Cumartesi": [],
          "Pazar": []
        };
      }

      const updated = await dbSaveStudentProgram(student.username, {
        ...prog,
        schedule: finalSchedule,
        title: prog.uploadedPdf.title || prog.title || `${student.fullName} - Haftalık Ders Programı`
      });

      if (onStatusChange) onStatusChange(updated);
      setParsingMsg('PDF ders programı başarıyla çözümlendi ve tabloya aktarıldı!');
      setTimeout(() => setParsingMsg(''), 5000);
    } catch (e) {
      console.error('Error parsing PDF to table:', e);
      setParsingMsg('PDF çözümlenirken bir hata oluştu.');
      setTimeout(() => setParsingMsg(''), 4000);
    } finally {
      setIsParsingPdf(false);
    }
  };

  // Synchronize when currentProgram or allPrograms changes
  React.useEffect(() => {
    if (currentProgram?.id && !selectedProgramId) {
      setSelectedProgramId(currentProgram.id);
    } else if (allPrograms.length > 0 && !allPrograms.some(p => p.id === selectedProgramId)) {
      const active = allPrograms.find(p => p.isActive) || allPrograms[0];
      if (active) setSelectedProgramId(active.id || '');
    }
  }, [currentProgram, allPrograms, selectedProgramId]);

  // Calculate overall completion statistics for activeProgram
  const stats = useMemo(() => {
    if (!activeProgram || !activeProgram.schedule) {
      return { total: 0, completed: 0, inProgress: 0, pending: 0, missed: 0, percent: 0, totalQuestions: 0 };
    }

    let total = 0;
    let completed = 0;
    let inProgress = 0;
    let pending = 0;
    let missed = 0;
    let totalQuestions = 0;

    DAYS_OF_WEEK.forEach(day => {
      const items = activeProgram.schedule[day] || [];
      items.forEach((item: ScheduleItem) => {
        total++;
        if (item.solvedQuestions) totalQuestions += Number(item.solvedQuestions);
        
        if (item.status === 'completed' || item.completed) {
          completed++;
        } else if (item.status === 'in_progress') {
          inProgress++;
        } else if (item.status === 'missed') {
          missed++;
        } else {
          pending++;
        }
      });
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, pending, missed, percent, totalQuestions };
  }, [activeProgram]);

  // Open slot editor
  const handleOpenEditSlot = (day: string, index: number, item: ScheduleItem) => {
    setEditingSlot({ day, index, item });
    setEditStatus(item.status || (item.completed ? 'completed' : 'pending'));
    setEditSolvedQuestions(item.solvedQuestions || item.targetQuestions || 0);
    setEditCorrect(item.correctCount || 0);
    setEditWrong(item.wrongCount || 0);
    setEditStudentNote(item.studentNote || '');
  };

  // Save slot status
  const handleSaveSlotStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot || !activeProgram?.id) return;

    setIsSavingSlot(true);
    try {
      const isCompleted = editStatus === 'completed';
      const updatedProg = await dbUpdateScheduleItemStatus(
        student.username,
        activeProgram.id,
        editingSlot.day,
        editingSlot.index,
        {
          status: editStatus,
          completed: isCompleted,
          solvedQuestions: editSolvedQuestions,
          correctCount: editCorrect,
          wrongCount: editWrong,
          studentNote: editStudentNote.trim()
        }
      );
      if (updatedProg && onStatusChange) {
        onStatusChange(updatedProg);
      }
      setEditingSlot(null);
    } catch (err) {
      console.error('Error saving slot status:', err);
    } finally {
      setIsSavingSlot(false);
    }
  };

  // Switch active program in Firestore
  const handleMakeActive = async (progId: string) => {
    try {
      await dbSetActiveProgram(student.username, progId);
      if (onProgramChange) onProgramChange(progId);
    } catch (err) {
      console.error('Error setting active program:', err);
    }
  };

  if (!activeProgram) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 shadow-sm space-y-4">
        <div className="w-16 h-16 bg-amber-50 text-[#C5A059] rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
          <Calendar className="w-8 h-8" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h4 className="font-serif text-lg font-bold text-slate-900">Henüz Ders Programı Eklenmedi</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Gamze Tosun tarafından hazırlanan haftalık çalışma programları veya PDF dosyaları yüklendiğinde burada yatay tablo olarak görüntülenecektir.
          </p>
          {isCoachView && onOpenUploadPdf && (
            <button
              onClick={onOpenUploadPdf}
              className="mt-3 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-[#C5A059] text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
            >
              Ders Programı PDF Yükle
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 1. TOP CONTROL BAR: PROGRAM ARŞİVİ & PROGRAM SEÇİCİ */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#C5A059] text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {activeProgram.isActive ? '⭐ Aktif Haftalık Program' : '📁 Arşiv Program'}
            </span>
            <span className="text-xs font-mono text-stone-500">
              Oluşturulma: {activeProgram.createdAt}
            </span>
            <span className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-bold">
              {activeProgram.examGroup}
            </span>
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#C5A059]" />
            {activeProgram.title || `${activeProgram.studentName} - Haftalık Ders Programı`}
          </h3>
          <p className="text-xs text-stone-500">
            Hedef: <span className="font-bold text-slate-800">{activeProgram.targetGoal}</span>
          </p>
        </div>

        {/* Program History Selector Dropdown & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {allPrograms.length > 1 && (
            <div className="flex items-center gap-1.5 bg-stone-50 p-1.5 rounded-xl border border-stone-200">
              <History className="w-3.5 h-3.5 text-stone-500 ml-1" />
              <span className="text-[11px] font-bold text-stone-600 hidden sm:inline">Program:</span>
              <select
                value={selectedProgramId}
                onChange={(e) => {
                  setSelectedProgramId(e.target.value);
                  if (onProgramChange) onProgramChange(e.target.value);
                }}
                className="bg-white border border-stone-200 text-xs font-bold text-slate-800 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
              >
                {allPrograms.map((prog, idx) => (
                  <option key={prog.id || idx} value={prog.id}>
                    {prog.isActive ? '⭐ ' : ''}{prog.title || `Program #${idx + 1}`} ({prog.createdAt})
                  </option>
                ))}
              </select>
            </div>
          )}

          {isCoachView && !activeProgram.isActive && (
            <button
              onClick={() => handleMakeActive(activeProgram.id || '')}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              title="Bu programı öğrencinin güncel aktif programı yap"
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Aktif Program Yap</span>
            </button>
          )}

          {isCoachView && onOpenUploadPdf && (
            <button
              onClick={onOpenUploadPdf}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-[#C5A059] text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              title="Yeni bir haftalık PDF ders programı yükleyin (önceki silinmez)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Yeni PDF Ekle</span>
            </button>
          )}

          {activeProgram.uploadedPdf && (
            <div className="flex items-center gap-1.5">
              <a
                href={activeProgram.uploadedPdf.dataUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-stone-100 hover:bg-stone-200 text-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Yüklü Orijinal PDF'i Görüntüle"
              >
                <Eye className="w-4 h-4 text-[#C5A059]" />
              </a>
              <a
                href={activeProgram.uploadedPdf.dataUrl}
                download={activeProgram.uploadedPdf.fileName}
                className="p-2 bg-[#C5A059] hover:bg-[#b08d4b] text-white rounded-xl transition-colors cursor-pointer"
                title="Yüklü Orijinal PDF'i İndir"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 2. ATTACHED PDF NOTICE (IF CURRENT PROGRAM HAS UPLOADED PDF) */}
      {activeProgram.uploadedPdf && (
        <div className="bg-gradient-to-r from-amber-500/10 via-stone-50 to-amber-500/10 border-2 border-[#C5A059]/70 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A059] text-slate-950 flex items-center justify-center shrink-0 shadow mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-700 text-white">
                  Özel PDF Programı
                </span>
                <span className="text-xs font-mono text-stone-500">{activeProgram.uploadedPdf.uploadedAt}</span>
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 mt-0.5">
                {activeProgram.uploadedPdf.title || activeProgram.uploadedPdf.fileName}
              </h4>
              <p className="text-[11px] text-stone-600">
                Dosya: <span className="font-mono font-bold text-slate-800">{activeProgram.uploadedPdf.fileName}</span> ({activeProgram.uploadedPdf.fileSize})
              </p>
              {activeProgram.uploadedPdf.notes && (
                <p className="text-xs text-amber-950 bg-amber-100/80 rounded p-1.5 mt-1 border-l-2 border-[#C5A059]">
                  💡 Koç Notu: {activeProgram.uploadedPdf.notes}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {activeProgram.uploadedPdf?.dataUrl && (
              <button
                onClick={() => handleAutoParseToTable(activeProgram)}
                disabled={isParsingPdf}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="PDF ders programını otomatik çözümle ve yatay tablo şablonuna aktar"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>{isParsingPdf ? 'Tabloya Aktarılıyor...' : 'Tablo Şablonuna Aktar'}</span>
              </button>
            )}
            <a
              href={activeProgram.uploadedPdf.dataUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-[#C5A059] rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Görüntüle</span>
            </a>
            <a
              href={activeProgram.uploadedPdf.dataUrl}
              download={activeProgram.uploadedPdf.fileName}
              className="px-3 py-1.5 bg-[#C5A059] hover:bg-[#b08d4b] text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>İndir (PDF)</span>
            </a>
          </div>
        </div>
      )}

      {/* Parsing progress alert */}
      {parsingMsg && (
        <div className="p-3.5 bg-amber-500/10 border-2 border-amber-400/50 rounded-2xl flex items-center gap-2.5 text-xs text-amber-950 shadow-xs">
          <Sparkles className="w-4 h-4 text-[#C5A059] shrink-0 animate-pulse" />
          <span className="font-bold">{parsingMsg}</span>
        </div>
      )}

      {/* 3. COLOR-CODED PROGRESS & STATS BANNER */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#C5A059]" />
            <h4 className="font-bold text-sm text-slate-900">
              Haftalık Çalışma İlerlemesi ve Durum Göstergeleri
            </h4>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span>Tamamlanma Oranı:</span>
            <span className={`px-2 py-0.5 rounded-full font-black ${
              stats.percent >= 80 ? 'bg-emerald-100 text-emerald-800' :
              stats.percent >= 50 ? 'bg-amber-100 text-amber-900' : 'bg-stone-200 text-slate-700'
            }`}>
              %{stats.percent}
            </span>
          </div>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden flex border border-stone-200">
          <div 
            style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }} 
            className="bg-emerald-500 h-full transition-all duration-500"
            title={`Tamamlanan: ${stats.completed} Blok`}
          />
          <div 
            style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }} 
            className="bg-amber-400 h-full transition-all duration-500"
            title={`Devam Eden: ${stats.inProgress} Blok`}
          />
          <div 
            style={{ width: `${stats.total > 0 ? (stats.missed / stats.total) * 100 : 0}%` }} 
            className="bg-rose-500 h-full transition-all duration-500"
            title={`Eksik: ${stats.missed} Blok`}
          />
        </div>

        {/* Color Legend & Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'completed' ? 'bg-emerald-700 text-white ring-2 ring-emerald-500' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Tamamlandı: {stats.completed}</span>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === 'in_progress' ? 'all' : 'in_progress')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'in_progress' ? 'bg-amber-600 text-white ring-2 ring-amber-400' : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Devam Ediyor: {stats.inProgress}</span>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'pending' ? 'bg-blue-600 text-white ring-2 ring-blue-400' : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <span>Planlandı: {stats.pending}</span>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === 'missed' ? 'all' : 'missed')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'missed' ? 'bg-rose-700 text-white ring-2 ring-rose-400' : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Telafi Edilecek: {stats.missed}</span>
            </button>

            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="text-stone-500 hover:text-stone-800 underline text-xs cursor-pointer font-medium"
              >
                Filtreyi Temizle
              </button>
            )}
          </div>

          <div className="text-stone-500 text-[11px] italic">
            💡 Çalışma durumunu ve soru sayısını güncellemek için aşağıdaki bloklara tıklayabilirsiniz.
          </div>
        </div>
      </div>

      {/* 4. YATAY TABLO ŞABLONU (HORIZONTAL 7-DAY SCHEDULE MATRIX) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden">
        {/* Table Header Controls */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#C5A059]" />
            <span className="font-bold text-sm tracking-wider uppercase">Yatay Haftalık Ders Programı Çizelgesi</span>
          </div>
          <span className="text-xs text-stone-400 hidden sm:inline">
            Tüm haftalık etüt akışını yatay olarak inceleyin
          </span>
        </div>

        {/* If no slots yet and PDF is attached */}
        {stats.total === 0 && activeProgram.uploadedPdf?.dataUrl && (
          <div className="p-6 bg-gradient-to-br from-amber-50 to-stone-50 border-b border-stone-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto border border-amber-300">
              <Sparkles className="w-6 h-6 text-[#C5A059]" />
            </div>
            <div className="space-y-1 max-w-lg mx-auto">
              <h5 className="font-bold text-sm text-slate-900">
                PDF Ders Programı Yüklü — Tabloya Aktarın
              </h5>
              <p className="text-xs text-stone-600">
                Öğrencinin "{activeProgram.uploadedPdf.fileName}" isimli PDF ders programı sistemde kayıtlı. Yatay haftalık tabloda renkli çalışma takibi yapabilmek için aşağıdaki butona tıklayarak ders programını şablona aktarabilirsiniz.
              </p>
            </div>
            <button
              onClick={() => handleAutoParseToTable(activeProgram)}
              disabled={isParsingPdf}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-[#C5A059] rounded-xl text-xs font-bold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isParsingPdf ? 'PDF Analiz Ediliyor ve Tabloya Aktarılıyor...' : '⚡ PDF\'i Otomatik Çözümle ve Tabloya Aktar'}</span>
            </button>
          </div>
        )}

        {/* Scrollable Horizontal 7-Day Columns */}
        <div className="overflow-x-auto p-4 sm:p-5 bg-stone-50/50">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3 min-w-[1050px]">
            {DAYS_OF_WEEK.map((day) => {
              const allDaySlots = activeProgram.schedule[day] || [];
              const daySlots = allDaySlots.filter((item: ScheduleItem) => {
                if (statusFilter === 'all') return true;
                if (statusFilter === 'completed') return item.status === 'completed' || item.completed;
                if (statusFilter === 'in_progress') return item.status === 'in_progress';
                if (statusFilter === 'missed') return item.status === 'missed';
                if (statusFilter === 'pending') return (!item.status || item.status === 'pending') && !item.completed;
                return true;
              });

              // Day stats
              const dayCompletedCount = allDaySlots.filter((i: ScheduleItem) => i.status === 'completed' || i.completed).length;

              return (
                <div 
                  key={day} 
                  className="bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col h-full overflow-hidden transition-shadow hover:shadow-md"
                >
                  {/* Day Column Header */}
                  <div className="bg-slate-900 text-white p-2.5 text-center border-b border-stone-200">
                    <div className="font-bold text-xs tracking-wider uppercase flex items-center justify-between">
                      <span className="text-white">{day}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        allDaySlots.length > 0 && dayCompletedCount === allDaySlots.length 
                          ? 'bg-emerald-500 text-white' 
                          : dayCompletedCount > 0 
                          ? 'bg-[#C5A059] text-slate-950' 
                          : 'bg-stone-700 text-stone-300'
                      }`}>
                        {dayCompletedCount}/{allDaySlots.length}
                      </span>
                    </div>
                  </div>

                  {/* Day Slots List */}
                  <div className="p-2 space-y-2 flex-1 flex flex-col justify-start">
                    {daySlots.length === 0 ? (
                      <div className="p-6 text-center text-stone-400 italic text-[11px] my-auto">
                        {statusFilter !== 'all' ? 'Filtreye uygun çalışma yok' : 'Serbest / Dinlenme'}
                      </div>
                    ) : (
                      daySlots.map((item: ScheduleItem, idx: number) => {
                        const originalIndex = allDaySlots.indexOf(item);
                        const isCompleted = item.status === 'completed' || item.completed;
                        const isInProgress = item.status === 'in_progress';
                        const isMissed = item.status === 'missed';

                        // Match with student dailyLogs if any
                        const matchingDailyLog = dailyLogs.find(
                          dl => dl.subject.toLowerCase() === item.subject.toLowerCase()
                        );

                        return (
                          <div
                            key={idx}
                            onClick={() => handleOpenEditSlot(day, originalIndex, item)}
                            className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer relative group flex flex-col justify-between gap-1.5 ${
                              isCompleted 
                                ? 'bg-emerald-50/90 border-emerald-400 shadow-xs hover:border-emerald-600 hover:shadow-md' 
                                : isInProgress
                                ? 'bg-amber-50/90 border-amber-400 shadow-xs hover:border-amber-500 hover:shadow-md'
                                : isMissed
                                ? 'bg-rose-50/90 border-rose-400 shadow-xs hover:border-rose-500 hover:shadow-md'
                                : 'bg-white border-stone-200 hover:border-[#C5A059] hover:shadow-md'
                            }`}
                          >
                            {/* Card Top: Time & Status Badge */}
                            <div className="flex items-center justify-between gap-1">
                              {item.time && item.time.trim() ? (
                                <span className="font-mono text-[10px] font-extrabold text-stone-600 flex items-center gap-1 bg-stone-100 px-1.5 py-0.5 rounded">
                                  <Clock className="w-3 h-3 text-[#C5A059]" />
                                  <span>{item.time}</span>
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold font-mono text-stone-400 bg-stone-100/80 px-1.5 py-0.5 rounded">
                                  #{idx + 1}. Görev
                                </span>
                              )}

                              {isCompleted ? (
                                <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-600 text-white flex items-center gap-0.5">
                                  <Check className="w-2.5 h-2.5" />
                                  <span>Bitti</span>
                                </span>
                              ) : isInProgress ? (
                                <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 flex items-center gap-0.5">
                                  <span>Devam</span>
                                </span>
                              ) : isMissed ? (
                                <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-rose-600 text-white flex items-center gap-0.5">
                                  <span>Eksik</span>
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-stone-100 text-stone-600">
                                  Plan
                                </span>
                              )}
                            </div>

                            {/* Subject, Topic / Focus & Resource */}
                            <div className="space-y-1">
                              <div className="font-bold text-xs text-slate-900 leading-snug">
                                {item.subject}
                              </div>
                              {(item.topic || item.focus) && (
                                <div className="text-[11px] text-stone-700 font-medium leading-snug whitespace-pre-wrap break-words">
                                  {item.topic || item.focus}
                                </div>
                              )}
                              {item.resource && item.resource.trim() && (
                                <div className="text-[10px] font-semibold text-amber-950 bg-amber-50/90 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1.5 mt-0.5">
                                  <BookOpen className="w-3 h-3 text-[#C5A059] shrink-0" />
                                  <span className="break-words">Kaynak: {item.resource}</span>
                                </div>
                              )}
                            </div>

                            {/* Coach Advice */}
                            {item.advice && (
                              <div className="text-[10px] italic text-amber-900 bg-amber-100/60 rounded p-1 leading-snug border-l-2 border-[#C5A059]">
                                💡 {item.advice}
                              </div>
                            )}

                            {/* Performance / Solved Questions Display */}
                            {(isCompleted || isInProgress) && (item.solvedQuestions || 0) > 0 && (
                              <div className="flex items-center justify-between text-[10px] font-bold bg-white/80 rounded px-1.5 py-0.5 border border-emerald-200 text-emerald-900">
                                <span>Çözülen Soru:</span>
                                <span className="font-mono font-black">{item.solvedQuestions} Soru</span>
                              </div>
                            )}

                            {/* Student Note */}
                            {item.studentNote && (
                              <div className="text-[9px] bg-white/90 p-1 rounded border border-stone-200 text-stone-700 italic flex items-center gap-1">
                                <MessageSquare className="w-2.5 h-2.5 text-stone-400 shrink-0" />
                                <span className="truncate">{item.studentNote}</span>
                              </div>
                            )}

                            {/* Auto Sync with Daily Study Log */}
                            {matchingDailyLog && (
                              <div className="text-[9px] font-bold bg-indigo-50 text-indigo-800 rounded px-1 py-0.5 flex items-center justify-between border border-indigo-200">
                                <span>Günlük Kayıt:</span>
                                <span>{matchingDailyLog.solvedQuestions} Soru</span>
                              </div>
                            )}

                            {/* Click to Edit Prompt on Hover */}
                            <div className="text-[9px] text-stone-400 group-hover:text-stone-700 text-right flex items-center justify-end gap-0.5 pt-0.5">
                              <Edit3 className="w-2.5 h-2.5" />
                              <span>Güncelle</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. INTERACTIVE SLOT STATUS MODAL */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#C5A059] text-slate-950 flex items-center justify-center font-bold text-xs">
                  {editingSlot.day.substring(0, 3)}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-slate-900">
                    Çalışma Durumunu Güncelle
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    {editingSlot.item.time ? `${editingSlot.item.time} • ` : ''}{editingSlot.item.subject}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingSlot(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlotStatus} className="space-y-3.5 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <div className="font-bold text-slate-900 text-sm">{editingSlot.item.subject}</div>
                {(editingSlot.item.topic || editingSlot.item.focus) && (
                  <div className="text-stone-700 font-medium whitespace-pre-wrap leading-relaxed">
                    {editingSlot.item.topic || editingSlot.item.focus}
                  </div>
                )}
                {editingSlot.item.resource && (
                  <div className="text-[11px] font-semibold text-amber-950 bg-amber-50 px-2 py-1 rounded border border-amber-200 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                    <span><strong>Kaynak:</strong> {editingSlot.item.resource}</span>
                  </div>
                )}
                {editingSlot.item.advice && (
                  <div className="text-[11px] text-amber-900 italic mt-1">
                    💡 Koç Notu: {editingSlot.item.advice}
                  </div>
                )}
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5 uppercase text-[10px] tracking-wider">
                  Çalışma Durumu (Renkli Gösterim)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditStatus('completed')}
                    className={`p-2 rounded-xl border-2 font-bold text-center transition-all cursor-pointer ${
                      editStatus === 'completed'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    🟢 Tamamlandı
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditStatus('in_progress')}
                    className={`p-2 rounded-xl border-2 font-bold text-center transition-all cursor-pointer ${
                      editStatus === 'in_progress'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                        : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    🟡 Devam Ediyor
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditStatus('pending')}
                    className={`p-2 rounded-xl border-2 font-bold text-center transition-all cursor-pointer ${
                      editStatus === 'pending'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    🔵 Planlandı
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditStatus('missed')}
                    className={`p-2 rounded-xl border-2 font-bold text-center transition-all cursor-pointer ${
                      editStatus === 'missed'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                        : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    🔴 Telafi / Eksik
                  </button>
                </div>
              </div>

              {/* Questions Count */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Çözülen Soru Sayısı
                </label>
                <input
                  type="number"
                  min="0"
                  value={editSolvedQuestions}
                  onChange={(e) => setEditSolvedQuestions(Number(e.target.value))}
                  placeholder="Örn: 40"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold text-slate-900"
                />
              </div>

              {/* Student Note */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Öğrenci / Koç Notu (İsteğe Bağlı)
                </label>
                <textarea
                  rows={2}
                  value={editStudentNote}
                  onChange={(e) => setEditStudentNote(e.target.value)}
                  placeholder="Örn: Testleri bitirdim, yanlışlarımı videodan izledim."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSavingSlot}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-[#C5A059] font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingSlot ? 'Kaydediliyor...' : 'Kaydet ve Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
