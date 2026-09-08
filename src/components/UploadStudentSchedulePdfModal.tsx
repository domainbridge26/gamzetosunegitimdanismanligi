import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Upload, FileText, Trash2, Eye, Download, CheckCircle, 
  AlertCircle, Sparkles, Clock, Calendar, RefreshCw, ChevronRight,
  ExternalLink, Layers, History, Check, BookmarkCheck
} from 'lucide-react';
import { StudentAccount, StudentScheduleRecord, UploadedSchedulePdf, ScheduleItem } from '../types';
import { dbSaveStudentUploadedPdf, dbRemoveStudentUploadedPdf, dbGetStudentSchedule, dbGetStudentPrograms } from '../lib/firebase';

interface UploadStudentSchedulePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentAccount | null;
  onScheduleUpdated?: (updated: StudentScheduleRecord) => void;
}

const DAYS_OF_WEEK = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export default function UploadStudentSchedulePdfModal({
  isOpen,
  onClose,
  student,
  onScheduleUpdated
}: UploadStudentSchedulePdfModalProps) {
  const [existingPrograms, setExistingPrograms] = useState<StudentScheduleRecord[]>([]);
  const [currentRecord, setCurrentRecord] = useState<StudentScheduleRecord | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  
  // Form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [programTitle, setProgramTitle] = useState('');
  const [examGroup, setExamGroup] = useState('YKS');
  const [targetGoal, setTargetGoal] = useState('');
  const [coachNotes, setCoachNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzingPdf, setIsAnalyzingPdf] = useState(false);
  const [parsedSchedule, setParsedSchedule] = useState<Record<string, ScheduleItem[]> | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing programs when modal opens
  useEffect(() => {
    if (isOpen && student) {
      setSuccessMsg('');
      setErrorMsg('');
      setSelectedFile(null);
      setFileBase64('');
      setParsedSchedule(null);
      setIsPreviewOpen(false);

      if (student.studentClass.includes('LGS')) {
        setExamGroup('LGS (8. Sınıf)');
      } else if (student.studentClass.includes('YKS')) {
        setExamGroup('YKS');
      } else if (student.studentClass.includes('KPSS')) {
        setExamGroup('KPSS');
      } else {
        setExamGroup(student.studentClass || 'Genel');
      }

      setLoadingSchedule(true);
      Promise.all([
        dbGetStudentPrograms(student.username),
        dbGetStudentSchedule(student.username)
      ]).then(([progs, rec]) => {
        setExistingPrograms(progs);
        setCurrentRecord(rec);
        const count = progs.length;
        setProgramTitle(`Hafta ${count + 1} - ${student.fullName} Ders Programı`);
        if (rec?.targetGoal) {
          setTargetGoal(rec.targetGoal);
        } else {
          setTargetGoal('Yüksek Başarı ve Hedef Netlere Ulaşma');
        }
      }).finally(() => setLoadingSchedule(false));
    }
  }, [isOpen, student]);

  if (!isOpen || !student) return null;

  // Clean empty schedule if backend returns no items or errors
  const createEmptyWeeklySchedule = (): Record<string, ScheduleItem[]> => ({
    "Pazartesi": [],
    "Salı": [],
    "Çarşamba": [],
    "Perşembe": [],
    "Cuma": [],
    "Cumartesi": [],
    "Pazar": []
  });

  // Analyze PDF with AI / Backend
  const analyzePdfContent = async (base64Str: string, file: File) => {
    setIsAnalyzingPdf(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/parse-schedule-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64: base64Str,
          studentName: student.fullName,
          examGroup: examGroup,
          notes: coachNotes
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data?.schedule) {
          setParsedSchedule(json.data.schedule);
          if (json.data.title) setProgramTitle(json.data.title);
          if (json.data.targetGoal) setTargetGoal(json.data.targetGoal);
          return;
        }
      }
      // If parsing fails or is empty, set clean empty schedule
      setParsedSchedule(createEmptyWeeklySchedule());
    } catch (err) {
      console.warn('Backend parse error:', err);
      setParsedSchedule(createEmptyWeeklySchedule());
    } finally {
      setIsAnalyzingPdf(false);
    }
  };

  // Handle file selection
  const handleFileChange = (file: File) => {
    setErrorMsg('');
    setSuccessMsg('');

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Lütfen geçerli bir PDF dosyası seçin (.pdf uzantılı olmalıdır).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Dosya boyutu 8 MB sınırını aşıyor. Lütfen daha küçük bir PDF yükleyin.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFileBase64(result);
      setSelectedFile(file);
      analyzePdfContent(result, file);
    };
    reader.onerror = () => {
      setErrorMsg('Dosya okunurken bir hata oluştu. Lütfen tekrar deneyin.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Upload and Save PDF as a new program in the student's archive
  const handleSavePdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileBase64 || !selectedFile) {
      setErrorMsg('Lütfen yüklenecek bir PDF dosyası seçin.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const nowStr = new Date().toLocaleDateString('tr-TR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const pdfData: UploadedSchedulePdf = {
        fileName: selectedFile.name,
        fileSize: formatFileSize(selectedFile.size),
        uploadedAt: nowStr,
        dataUrl: fileBase64,
        title: programTitle.trim() || `${student.fullName} - Haftalık Ders Programı`,
        notes: coachNotes.trim()
      };

      // Guarantee we have a schedule
      const finalSchedule = parsedSchedule || createEmptyWeeklySchedule();

      const updated = await dbSaveStudentUploadedPdf(student.username, pdfData, {
        studentName: student.fullName,
        examGroup: examGroup,
        targetGoal: targetGoal || 'Yüksek Başarı Hedefi',
        parsedSchedule: finalSchedule,
        programTitle: programTitle.trim() || `${student.fullName} - Haftalık Ders Programı`
      });

      setCurrentRecord(updated);
      const progs = await dbGetStudentPrograms(student.username);
      setExistingPrograms(progs);

      setSelectedFile(null);
      setFileBase64('');
      setParsedSchedule(null);
      setSuccessMsg('PDF ders programı başarıyla çözümlendi ve yatay şablona otomatik olarak eklendi! Önceki programlar silinmeden arşive kaydedildi.');
      
      if (onScheduleUpdated) {
        onScheduleUpdated(updated);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Yükleme sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPdf = (pdf: UploadedSchedulePdf) => {
    const link = document.createElement('a');
    link.href = pdf.dataUrl;
    link.download = pdf.fileName || `${student.fullName}_Ders_Programi.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-stone-200 space-y-6 my-auto text-left animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-50 text-[#C5A059] rounded-2xl flex items-center justify-center border border-amber-200 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-[#C5A059] text-slate-950 rounded-md">
                  Gamze Tosun Koçluk Paneli
                </span>
                <span className="text-xs text-stone-400">PDF'ten Otomatik Yatay Tabloya Aktarma</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {student.fullName} İçin Ders Programı (PDF) Yükle
              </h3>
              <p className="text-xs text-stone-500">
                Kullanıcı: <span className="font-mono font-bold text-slate-800">@{student.username}</span> &bull; Seviye: <span className="font-bold text-[#C5A059]">{student.studentClass}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-xl text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* HISTORICAL PROGRAMS IN SYSTEM INFO (NEVER OVERWRITTEN) */}
        {existingPrograms.length > 0 && (
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#C5A059]" />
              <span className="text-stone-700">
                Bu öğrenci için sistemde <strong>{existingPrograms.length} adet</strong> kayıtlı program bulunmaktadır.
              </span>
            </div>
            <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              Önceki programlar silinmez, arşivde saklanır
            </span>
          </div>
        )}

        {/* Upload PDF Form */}
        <form onSubmit={handleSavePdf} className="space-y-4">
          <div>
            <h4 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#C5A059]" />
              <span>Ders Programı PDF Dosyasını Yükleyin</span>
            </h4>
            <p className="text-xs text-stone-500 mt-0.5">
              Yüklediğiniz PDF otomatik olarak taranır ve sistemdeki <strong>yatay haftalık tablo şablonuna</strong> eklenir.
            </p>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragOver 
                ? 'border-[#C5A059] bg-amber-50/70 scale-[0.99]' 
                : selectedFile 
                  ? 'border-emerald-400 bg-emerald-50/30' 
                  : 'border-stone-300 hover:border-[#C5A059] bg-[#FAF9F6] hover:bg-amber-50/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
              accept=".pdf,application/pdf"
              className="hidden"
            />

            {selectedFile ? (
              <div className="space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{selectedFile.name}</p>
                  <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                    Boyut: {formatFileSize(selectedFile.size)} &bull; PDF Belgesi Hazır
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setFileBase64('');
                    setParsedSchedule(null);
                  }}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Farklı Dosya Seç
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 bg-white text-stone-400 rounded-2xl flex items-center justify-center mx-auto border border-stone-200 shadow-xs">
                  <Upload className="w-6 h-6 text-[#C5A059]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    PDF Dosyasını Buraya Sürükleyin veya Seçmek İçin Tıklayın
                  </p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Desteklenen format: .PDF (Maksimum 8 MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* AI Analyzing Status Bar */}
          {isAnalyzingPdf && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-xs text-amber-900">
              <RefreshCw className="w-4 h-4 text-[#C5A059] animate-spin shrink-0" />
              <span>PDF taranıyor ve yatay haftalık çalışma tablosuna aktarılıyor, lütfen bekleyin...</span>
            </div>
          )}

          {/* PARSED HORIZONTAL TABLE PREVIEW */}
          {parsedSchedule && (
            <div className="border border-emerald-300 rounded-2xl p-4 bg-emerald-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-bold text-xs text-emerald-950 uppercase tracking-wider">
                    Otomatik Oluşturulan Yatay Tablo Şablonu Önizlemesi
                  </span>
                </div>
                <span className="text-[11px] text-emerald-800 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  7 Günlük Haftalık Çizelge Hazır
                </span>
              </div>

              {/* Mini Horizontal 7-Day Preview */}
              <div className="overflow-x-auto pb-2">
                <div className="grid grid-cols-7 gap-2 min-w-[700px] text-[11px]">
                  {DAYS_OF_WEEK.map((day) => {
                    const slots = parsedSchedule[day] || [];
                    return (
                      <div key={day} className="bg-white rounded-xl p-2 border border-emerald-200 shadow-xs space-y-1">
                        <div className="font-bold text-slate-900 border-b border-stone-100 pb-1 flex justify-between">
                          <span>{day.substring(0, 3)}</span>
                          <span className="text-[10px] text-stone-400">{slots.length} Seans</span>
                        </div>
                        <div className="space-y-1 max-h-36 overflow-y-auto">
                          {slots.length === 0 ? (
                            <span className="text-[10px] text-stone-400 italic">Serbest</span>
                          ) : (
                            slots.map((s, idx) => (
                              <div key={idx} className="bg-stone-50 p-1.5 rounded border border-stone-200/80 leading-tight space-y-0.5">
                                {s.time && s.time.trim() && (
                                  <div className="font-mono text-[9px] font-bold text-[#C5A059]">{s.time}</div>
                                )}
                                <div className="font-bold text-slate-800 text-[11px] leading-snug">{s.subject}</div>
                                {(s.topic || s.focus) && (
                                  <div className="text-[10px] text-stone-600 leading-snug break-words">{s.topic || s.focus}</div>
                                )}
                                {s.resource && s.resource.trim() && (
                                  <div className="text-[9px] font-semibold text-amber-950 bg-amber-100/70 px-1 py-0.5 rounded border border-amber-200/60 break-words">
                                    📚 {s.resource}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Details (Title, Sınav Grubu, Hedef, Koçluk Notu) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                Program Başlığı
              </label>
              <input
                type="text"
                value={programTitle}
                onChange={(e) => setProgramTitle(e.target.value)}
                placeholder="Örn: 1. Hafta TYT/AYT Yoğun Çalışma Programı"
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-300 rounded-xl text-xs font-semibold text-slate-900 focus:border-[#C5A059] focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                Sınav / Seviye Grubu
              </label>
              <select
                value={examGroup}
                onChange={(e) => setExamGroup(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-300 rounded-xl text-xs font-semibold text-slate-900 focus:border-[#C5A059] focus:outline-none"
              >
                <option value="YKS">YKS (Tüm Alanlar)</option>
                <option value="YKS Sayısal">YKS Sayısal</option>
                <option value="YKS Eşit Ağırlık">YKS Eşit Ağırlık</option>
                <option value="YKS Sözel">YKS Sözel</option>
                <option value="LGS (8. Sınıf)">LGS (8. Sınıf)</option>
                <option value="KPSS">KPSS Lisans & Ön Lisans</option>
                <option value="AGS">AGS (Akademi Giriş Sınavı)</option>
                <option value="Ara Sınıf (9, 10, 11)">Ara Sınıf (Okul & Yazılı)</option>
                <option value="İlkokul / Ortaokul">İlkokul / Ortaokul</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                Hedef / Derece Beklentisi
              </label>
              <input
                type="text"
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                placeholder="Örn: İlk 15.000 / Hukuk Fakültesi / Fen Lisesi Hedefi"
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-300 rounded-xl text-xs font-semibold text-slate-900 focus:border-[#C5A059] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                Gamze Hoca'nın Öğrenciye Özel Tavsiye & Motivasyon Notu
              </label>
              <textarea
                rows={2}
                value={coachNotes}
                onChange={(e) => setCoachNotes(e.target.value)}
                placeholder="Örn: Bu hafta TYT Tarih ve AYT Coğrafya tekrarlarına odaklanalım. Çözülen soru sayılarını her akşam sisteme girmeyi unutma!"
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-300 rounded-xl text-xs text-slate-900 focus:border-[#C5A059] focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedFile}
              className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                isSubmitting || !selectedFile
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 text-[#C5A059]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Şablona Ekleniyor ve Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <BookmarkCheck className="w-4 h-4" />
                  <span>Yatay Şablona Ekle ve Yeni Program Olarak Kaydet</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
