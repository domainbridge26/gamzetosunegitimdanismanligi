import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Upload, FileText, Trash2, Eye, Download, CheckCircle, 
  AlertCircle, Sparkles, Clock, Calendar, RefreshCw, ChevronRight,
  ExternalLink
} from 'lucide-react';
import { StudentAccount, StudentScheduleRecord, UploadedSchedulePdf } from '../types';
import { dbSaveStudentUploadedPdf, dbRemoveStudentUploadedPdf, dbGetStudentSchedule } from '../lib/firebase';

interface UploadStudentSchedulePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentAccount | null;
  onScheduleUpdated?: (updated: StudentScheduleRecord) => void;
}

export default function UploadStudentSchedulePdfModal({
  isOpen,
  onClose,
  student,
  onScheduleUpdated
}: UploadStudentSchedulePdfModalProps) {
  const [currentRecord, setCurrentRecord] = useState<StudentScheduleRecord | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  
  // Form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [programTitle, setProgramTitle] = useState('Gamze Tosun Haftalık Özel Ders Programı');
  const [examGroup, setExamGroup] = useState('YKS');
  const [targetGoal, setTargetGoal] = useState('');
  const [coachNotes, setCoachNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing schedule when modal opens
  useEffect(() => {
    if (isOpen && student) {
      setSuccessMsg('');
      setErrorMsg('');
      setSelectedFile(null);
      setFileBase64('');
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
      dbGetStudentSchedule(student.username)
        .then((rec) => {
          setCurrentRecord(rec);
          if (rec?.uploadedPdf?.title) {
            setProgramTitle(rec.uploadedPdf.title);
          } else {
            setProgramTitle(`${student.fullName} - Haftalık Ders Programı`);
          }
          if (rec?.uploadedPdf?.notes) {
            setCoachNotes(rec.uploadedPdf.notes);
          }
          if (rec?.targetGoal) {
            setTargetGoal(rec.targetGoal);
          }
          if (rec?.examGroup) {
            setExamGroup(rec.examGroup);
          }
        })
        .finally(() => setLoadingSchedule(false));
    }
  }, [isOpen, student]);

  if (!isOpen || !student) return null;

  // Handle file selection
  const handleFileChange = (file: File) => {
    setErrorMsg('');
    setSuccessMsg('');

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Lütfen geçerli bir PDF dosyası seçin (.pdf uzantılı olmalıdır).');
      return;
    }

    // Check size limit: 8MB max
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Dosya boyutu 8 MB sınırını aşıyor. Lütfen daha küçük bir PDF yükleyin.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFileBase64(result);
      setSelectedFile(file);
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

  // Upload and Save PDF
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

      const updated = await dbSaveStudentUploadedPdf(student.username, pdfData, {
        studentName: student.fullName,
        examGroup: examGroup,
        targetGoal: targetGoal || 'Yüksek Başarı Hedefi'
      });

      setCurrentRecord(updated);
      setSelectedFile(null);
      setFileBase64('');
      setSuccessMsg('Ders programı PDF olarak başarıyla yüklendi! Öğrencinin ve velisinin paneline anında iletildi.');
      
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

  // Delete existing PDF
  const handleDeletePdf = async () => {
    if (!confirm('Yüklü olan PDF ders programını kaldırmak istediğinize emin misiniz?')) return;
    
    setIsSubmitting(true);
    try {
      const updated = await dbRemoveStudentUploadedPdf(student.username);
      if (updated) {
        setCurrentRecord(updated);
        if (onScheduleUpdated) {
          onScheduleUpdated(updated);
        }
      }
      setSuccessMsg('PDF ders programı başarıyla kaldırıldı.');
    } catch (err) {
      console.error(err);
      setErrorMsg('Silme sırasında bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download PDF
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
      <div className="bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-stone-200 space-y-6 my-auto text-left animate-in fade-in zoom-in-95">
        
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
                <span className="text-xs text-stone-400">PDF Program Yükleme</span>
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

        {/* Currently Active PDF Section */}
        {currentRecord?.uploadedPdf && (
          <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Öğrencinin Sayfasında Yayında Olan PDF Programı</span>
              </span>
              <span className="text-[10px] text-amber-800 font-medium">
                Yüklenme: {currentRecord.uploadedPdf.uploadedAt}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center font-bold border border-rose-200 shrink-0">
                  PDF
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                    {currentRecord.uploadedPdf.title || currentRecord.uploadedPdf.fileName}
                  </h5>
                  <p className="text-[11px] text-stone-500 font-mono">
                    {currentRecord.uploadedPdf.fileName} ({currentRecord.uploadedPdf.fileSize})
                  </p>
                  {currentRecord.uploadedPdf.notes && (
                    <p className="text-[11px] text-amber-900 mt-1 italic">
                      Gamze Hoca Notu: "{currentRecord.uploadedPdf.notes}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{isPreviewOpen ? 'Önizlemeyi Kapat' : 'Görüntüle'}</span>
                </button>
                <button
                  onClick={() => handleDownloadPdf(currentRecord.uploadedPdf!)}
                  className="px-3 py-1.5 bg-white hover:bg-stone-100 text-slate-800 text-xs font-bold rounded-lg border border-stone-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5 text-stone-600" />
                  <span>İndir</span>
                </button>
                <button
                  onClick={handleDeletePdf}
                  disabled={isSubmitting}
                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  title="PDF'i Kaldır"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* In-modal PDF Viewer Preview */}
            {isPreviewOpen && (
              <div className="mt-3 border border-stone-300 rounded-xl overflow-hidden bg-stone-100 shadow-inner">
                <div className="bg-slate-900 text-white p-2 text-xs flex items-center justify-between">
                  <span className="font-mono text-[11px] text-stone-300">Önizleme: {currentRecord.uploadedPdf.fileName}</span>
                  <a
                    href={currentRecord.uploadedPdf.dataUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#C5A059] hover:underline flex items-center gap-1"
                  >
                    <span>Yeni Sekmede Aç</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <iframe
                  src={currentRecord.uploadedPdf.dataUrl}
                  title="PDF Önizleme"
                  className="w-full h-96 border-none"
                />
              </div>
            )}
          </div>
        )}

        {/* Upload New / Replace PDF Form */}
        <form onSubmit={handleSavePdf} className="space-y-4">
          <div className="border-t border-stone-200 pt-4">
            <h4 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#C5A059]" />
              <span>{currentRecord?.uploadedPdf ? 'Yeni PDF Dosyası Yükle (Eskisiyle Değiştir)' : 'Yeni PDF Ders Programı Yükle'}</span>
            </h4>
            <p className="text-xs text-stone-500 mt-0.5">
              Hazırladığınız PDF formatındaki ders programını seçin veya bu alana sürükleyip bırakın.
            </p>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
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

          {/* Additional Details (Title, Sınav Grubu, Hedef, Koçluk Notu) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                Program Başlığı
              </label>
              <input
                type="text"
                value={programTitle}
                onChange={(e) => setProgramTitle(e.target.value)}
                placeholder="Örn: Ekim Ayı Özel YKS Çalışma Programı"
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
                placeholder="Örn: Bu hafta özellikle TYT Tarih ve AYT Tarih kronolojisine ağırlık verelim. Günlük soru sayılarını aksatmadan her gün takip ediyoruz!"
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
                  <span>Sisteme Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Ders Programı PDF'ini Yükle ve Kaydet</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
