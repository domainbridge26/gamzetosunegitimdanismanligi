import React, { useState, useEffect } from 'react';
import { 
  X, Check, Trash2, Archive, Shield, Phone, 
  Mail, Calendar, Users, FileSpreadsheet, PlusCircle, UserCheck
} from 'lucide-react';
import { ContactSubmission } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [inquiries, setInquiries] = useState<ContactSubmission[]>([]);
  const [filterStatus, setFilterStatus] = useState<'Tümü' | 'Yeni' | 'Görüşüldü' | 'Arşivlendi'>('Tümü');
  const [searchQuery, setSearchQuery] = useState('');

  // Load inquiries from localStorage
  const loadInquiries = () => {
    const raw = localStorage.getItem('gamze_inquiries');
    if (raw) {
      setInquiries(JSON.parse(raw));
    } else {
      setInquiries([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadInquiries();
    }
  }, [isOpen]);

  // Seed sample data for preview
  const handleSeedSamples = () => {
    const samples: ContactSubmission[] = [
      {
        id: 'sample-1',
        fullName: 'Ahmet Hamdi Tanpınar',
        phone: '0 (543) 987 65 43',
        email: 'ahmet.tanpinar@veli.com',
        studentClass: '12. Sınıf (YKS)',
        selectedService: 'Öğrenci Koçluğu',
        message: 'Oğlum deneme sınavlarında matematik netlerini bir türlü artıramıyor. Sürekli sürenin yetmediğinden şikayetçi. Sınav kaygısı da eşlik ediyor. Haftalık koçluk ve takip desteği istiyoruz.',
        createdAt: '11.07.2026 09:12:00',
        status: 'Yeni'
      },
      {
        id: 'sample-2',
        fullName: 'Ayşe Begüm Koç',
        phone: '0 (505) 555 44 33',
        email: 'ayse.begum@ogrenci.com',
        studentClass: 'Sadece Hızlı Okuma',
        selectedService: 'Hızlı Okuma',
        message: 'LGS sınavına hazırlanıyorum. Okuma hızım dakikada 160 kelime civarı. Sözel bölümdeki paragrafları yetiştirmekte çok zorlanıyorum. Hızlı okuma tekniklerini öğrenmek istiyorum.',
        createdAt: '10.07.2026 15:45:12',
        status: 'Görüşüldü'
      },
      {
        id: 'sample-3',
        fullName: 'Kemal Sunal (Veli)',
        phone: '0 (532) 111 22 33',
        email: 'kemalsunal@veli.com',
        studentClass: '8. Sınıf (LGS)',
        selectedService: 'Tercih Danışmanlığı',
        message: 'Kızımın LGS yüzdelik dilimi tahmini %1.2 civarında gelecek. İstanbulda doğru bir anadolu lisesi veya proje okulu seçmek istiyoruz. Gamze Hanım ile profesyonel lise tercih danışmanlığı randevusu talep ediyoruz.',
        createdAt: '09.07.2026 18:20:00',
        status: 'Arşivlendi'
      }
    ];

    localStorage.setItem('gamze_inquiries', JSON.stringify(samples));
    setInquiries(samples);
  };

  const updateStatus = (id: string, newStatus: 'Yeni' | 'Görüşüldü' | 'Arşivlendi') => {
    const updated = inquiries.map(inq => {
      if (inq.id === id) {
        return { ...inq, status: newStatus };
      }
      return inq;
    });
    localStorage.setItem('gamze_inquiries', JSON.stringify(updated));
    setInquiries(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu başvuruyu kalıcı olarak silmek istediğinize emin misiniz?')) {
      const updated = inquiries.filter(inq => inq.id !== id);
      localStorage.setItem('gamze_inquiries', JSON.stringify(updated));
      setInquiries(updated);
    }
  };

  const handleClearAll = () => {
    if (confirm('TÜM başvuruları temizlemek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      localStorage.removeItem('gamze_inquiries');
      setInquiries([]);
    }
  };

  // Filter & Search
  const filteredInquiries = inquiries.filter(inq => {
    const matchesStatus = filterStatus === 'Tümü' || inq.status === filterStatus;
    const matchesSearch = 
      inq.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      inq.phone.includes(searchQuery) ||
      inq.selectedService.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: inquiries.length,
    new: inquiries.filter(i => i.status === 'Yeni').length,
    contacted: inquiries.filter(i => i.status === 'Görüşüldü').length,
    archived: inquiries.filter(i => i.status === 'Arşivlendi').length,
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-55 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-6xl h-[85vh] shadow-2xl flex flex-col overflow-hidden border border-stone-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-xl">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h2 className="font-display font-bold text-lg leading-none">Gamze Hanım Yönetici Paneli</h2>
              <span className="text-xs text-slate-400 font-medium">Gelen Danışmanlık ve Koçluk Talepleri Takip Sistemi</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inner Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50 flex flex-col space-y-6">
          
          {/* Dashboard Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3 text-left">
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Toplam Başvuru</span>
                <span className="text-xl font-extrabold text-slate-800">{stats.total}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3 text-left">
              <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl animate-pulse">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bekleyen Yeni</span>
                <span className="text-xl font-extrabold text-slate-800">{stats.new}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3 text-left">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Görüşülenler</span>
                <span className="text-xl font-extrabold text-slate-800">{stats.contacted}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3 text-left">
              <div className="p-2.5 bg-stone-100 text-stone-600 rounded-xl">
                <Archive className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Arşivlenen</span>
                <span className="text-xl font-extrabold text-slate-800">{stats.archived}</span>
              </div>
            </div>
          </div>

          {/* Filtering and Actions Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            
            {/* Status Filter buttons */}
            <div className="flex flex-wrap gap-1">
              {(['Tümü', 'Yeni', 'Görüşüldü', 'Arşivlendi'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterStatus === status
                      ? 'bg-emerald-700 text-white'
                      : 'bg-stone-50 text-slate-600 hover:bg-stone-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="flex-1 md:max-w-xs">
              <input
                type="text"
                placeholder="Aday ismi veya telefon ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Quick Utility controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSeedSamples}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/50 rounded-lg text-xs font-bold transition-all cursor-pointer"
                title="Sistemi test etmek için 3 adet örnek başvuru ekler"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Örnek Veri Ekle</span>
              </button>

              {inquiries.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Tümünü Temizle</span>
                </button>
              )}
            </div>
          </div>

          {/* Leads Table or List */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex-1 flex flex-col">
            {filteredInquiries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50/80 border-b border-stone-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                      <th className="px-5 py-4">Aday Detayı / Tarih</th>
                      <th className="px-5 py-4">Sınav Grubu & Hizmet</th>
                      <th className="px-5 py-4">Mesaj ve Hedefler</th>
                      <th className="px-5 py-4 text-center">Durum</th>
                      <th className="px-5 py-4 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredInquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-stone-50/50 transition-colors">
                        
                        {/* Candidate info */}
                        <td className="px-5 py-4 shrink-0">
                          <div className="flex flex-col space-y-1">
                            <span className="font-display font-black text-slate-900 text-sm leading-none">
                              {inq.fullName}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500">
                              ID: #{inq.id}
                            </span>
                            <div className="flex flex-col gap-1 pt-1">
                              <a href={`tel:${inq.phone}`} className="flex items-center gap-1 text-xs text-emerald-800 font-semibold hover:underline">
                                <Phone className="w-3 h-3" />
                                <span>{inq.phone}</span>
                              </a>
                              {inq.email && (
                                <a href={`mailto:${inq.email}`} className="flex items-center gap-1 text-[11px] text-slate-400 hover:underline">
                                  <Mail className="w-3 h-3" />
                                  <span>{inq.email}</span>
                                </a>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-1.5">
                              <Calendar className="w-3 h-3" />
                              {inq.createdAt}
                            </span>
                          </div>
                        </td>

                        {/* Education Details */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="text-xs font-bold text-slate-700 bg-stone-100 px-2 py-0.5 rounded">
                              {inq.studentClass}
                            </span>
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                              {inq.selectedService}
                            </span>
                          </div>
                        </td>

                        {/* Message */}
                        <td className="px-5 py-4 max-w-sm">
                          <p className="text-xs text-slate-600 leading-relaxed max-h-[85px] overflow-y-auto scrollbar-thin">
                            {inq.message}
                          </p>
                        </td>

                        {/* Status badge */}
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            inq.status === 'Yeni'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                              : inq.status === 'Görüşüldü'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-stone-200 text-stone-700 border border-stone-300'
                          }`}>
                            {inq.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {inq.status !== 'Görüşüldü' && (
                              <button
                                onClick={() => updateStatus(inq.id, 'Görüşüldü')}
                                className="p-1 text-emerald-700 hover:bg-emerald-50 rounded-md border border-emerald-200/50"
                                title="Görüşüldü olarak işaretle"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            {inq.status !== 'Arşivlendi' && (
                              <button
                                onClick={() => updateStatus(inq.id, 'Arşivlendi')}
                                className="p-1 text-slate-500 hover:bg-stone-100 rounded-md border border-stone-200"
                                title="Arşive Gönder"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            )}
                            {inq.status === 'Arşivlendi' && (
                              <button
                                onClick={() => updateStatus(inq.id, 'Yeni')}
                                className="p-1 text-amber-700 hover:bg-amber-50 rounded-md border border-amber-200"
                                title="Yeni statüsüne geri taşı"
                              >
                                <PlusCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(inq.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-md border border-red-200/60"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-24 space-y-4">
                <FileSpreadsheet className="w-16 h-16 text-stone-300 stroke-1" />
                <div className="space-y-1.5 px-6 max-w-sm">
                  <h4 className="font-display font-bold text-slate-900 text-sm">Hiç Başvuru Bulunmuyor</h4>
                  <p className="text-xs text-slate-400">
                    Sistemde henüz kayıtlı başvuru yok veya seçtiğiniz filtreye uygun kayıt bulunmuyor. Test etmek için "Örnek Veri Ekle" butonuna basabilirsiniz!
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-stone-100 px-6 py-4 flex items-center justify-between border-t border-stone-200 text-xs text-slate-500 font-medium">
          <span>* Veriler tarayıcınızın yerel depolama alanında (localStorage) güvenle saklanır.</span>
          <span>Gamze Tosun Danışmanlık v1.0</span>
        </div>

      </div>
    </div>
  );
}
