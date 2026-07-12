import React, { useState, useEffect } from 'react';
import { 
  X, Check, Trash2, Archive, Shield, Phone, 
  Mail, Calendar, Users, FileSpreadsheet, PlusCircle, UserCheck,
  ListFilter, Sparkles, MessageSquare, ThumbsUp, LogOut, Clock, Info
} from 'lucide-react';
import { ContactSubmission, Testimonial } from '../types';
import { TESTIMONIALS_DATA } from '../data';
import SchedulePlanner from './SchedulePlanner';
import { 
  dbGetInquiries, 
  dbUpdateInquiryStatus, 
  dbDeleteInquiry, 
  dbClearAllInquiries, 
  dbGetTestimonials, 
  dbApproveTestimonial, 
  dbDeleteTestimonial,
  dbAddInquiry
} from '../lib/firebase';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('gamze_admin_remember') === 'true');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'requests' | 'planner' | 'comments'>('requests');

  const [inquiries, setInquiries] = useState<ContactSubmission[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filterStatus, setFilterStatus] = useState<'Tümü' | 'Yeni' | 'Görüşüldü' | 'Arşivlendi'>('Tümü');
  const [searchQuery, setSearchQuery] = useState('');

  // Real-time live notifications state
  const [liveNotifications, setLiveNotifications] = useState<{
    id: string;
    type: 'inquiry' | 'testimonial';
    title: string;
    message: string;
    time: string;
    data: any;
  }[]>([]);

  // Load inquiries from Firestore
  const loadInquiries = async () => {
    const data = await dbGetInquiries();
    setInquiries(data);
  };

  // Load testimonials from Firestore
  const loadTestimonials = async () => {
    const data = await dbGetTestimonials();
    setTestimonials(data);
  };

  // Check auto-login and load data on open
  useEffect(() => {
    if (isOpen) {
      const isRemembered = localStorage.getItem('gamze_admin_remember') === 'true';
      if (isRemembered) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      loadInquiries();
      loadTestimonials();
    } else {
      const isRemembered = localStorage.getItem('gamze_admin_remember') === 'true';
      if (!isRemembered) {
        setIsAuthenticated(false);
      }
      setUsernameInput('');
      setPasswordInput('');
      setLoginError('');
    }
  }, [isOpen]);

  // Real-time Event Listeners for new inquiries and testimonials
  useEffect(() => {
    const handleNewInquiry = (e: Event) => {
      const customEvent = e as CustomEvent<ContactSubmission>;
      const newInq = customEvent.detail;
      
      // Update inquiries state immediately so the list receives it!
      setInquiries(prev => {
        if (prev.some(x => x.id === newInq.id)) return prev;
        return [newInq, ...prev];
      });

      // Show real-time notification banner
      const newNotif = {
        id: Math.random().toString(36).substring(2, 9),
        type: 'inquiry' as const,
        title: 'Yeni Başvuru Alındı! 📩',
        message: `${newInq.fullName} (${newInq.studentClass}) adlı öğrencimiz ön görüşme başvurusu yaptı.`,
        data: newInq,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      };
      setLiveNotifications(prev => [newNotif, ...prev]);
    };

    const handleNewTestimonial = (e: Event) => {
      const customEvent = e as CustomEvent<Testimonial>;
      const newTest = customEvent.detail;

      // Update testimonials state immediately
      setTestimonials(prev => {
        if (prev.some(x => x.id === newTest.id)) return prev;
        return [newTest, ...prev];
      });

      // Show real-time notification banner
      const newNotif = {
        id: Math.random().toString(36).substring(2, 9),
        type: 'testimonial' as const,
        title: 'Yeni Yorum Onayı Bekliyor! 💬',
        message: `${newTest.name} (${newTest.role}) yeni bir başarı hikayesi paylaştı.`,
        data: newTest,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      };
      setLiveNotifications(prev => [newNotif, ...prev]);
    };

    window.addEventListener('gamze-new-inquiry', handleNewInquiry);
    window.addEventListener('gamze-new-testimonial', handleNewTestimonial);

    return () => {
      window.removeEventListener('gamze-new-inquiry', handleNewInquiry);
      window.removeEventListener('gamze-new-testimonial', handleNewTestimonial);
    };
  }, []);

  const handleApproveComment = async (id: string) => {
    await dbApproveTestimonial(id);
    const updated = testimonials.map(test => {
      if (test.id === id) {
        return { ...test, approved: true };
      }
      return test;
    });
    setTestimonials(updated);
    
    // Notify public view to refresh in real-time
    window.dispatchEvent(new Event('gamze-testimonials-updated'));
  };

  const handleDeleteComment = async (id: string) => {
    if (confirm('Bu yorumu silmek istediğinize emin misiniz?')) {
      await dbDeleteTestimonial(id);
      const updated = testimonials.filter(test => test.id !== id);
      setTestimonials(updated);
      
      // Notify public view to refresh in real-time
      window.dispatchEvent(new Event('gamze-testimonials-updated'));
    }
  };

  // Seed sample data for preview
  const handleSeedSamples = async () => {
    const samples: Omit<ContactSubmission, 'id'>[] = [
      {
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

    for (const sample of samples) {
      await dbAddInquiry(sample);
    }
    await loadInquiries();
  };

  const updateStatus = async (id: string, newStatus: 'Yeni' | 'Görüşüldü' | 'Arşivlendi') => {
    await dbUpdateInquiryStatus(id, newStatus);
    const updated = inquiries.map(inq => {
      if (inq.id === id) {
        return { ...inq, status: newStatus };
      }
      return inq;
    });
    setInquiries(updated);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu başvuruyu kalıcı olarak silmek istediğinize emin misiniz?')) {
      await dbDeleteInquiry(id);
      const updated = inquiries.filter(inq => inq.id !== id);
      setInquiries(updated);
    }
  };

  const handleClearAll = async () => {
    if (confirm('TÜM başvuruları temizlemek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      await dbClearAllInquiries();
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

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-55 flex items-center justify-center p-4">
        <div className="bg-white p-8 max-w-sm w-full border border-[#2D2D2D]/10 shadow-2xl space-y-6 text-center relative rounded-none">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-[#2D2D2D]/60 hover:text-[#2D2D2D] hover:bg-[#2D2D2D]/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center mx-auto border border-[#C5A059]/20">
            <Shield className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="font-serif text-xl font-bold text-[#2D2D2D]">Yönetici Girişi</h3>
            <p className="text-stone-500 text-xs leading-relaxed">
              Bu bölüme sadece eğitim danışmanı Gamze Tosun erişebilir. Lütfen kullanıcı adı ve şifrenizi girin.
            </p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (usernameInput === 'Gamze' && passwordInput === 'Gamze1283') {
              setIsAuthenticated(true);
              setLoginError('');
              if (rememberMe) {
                localStorage.setItem('gamze_admin_remember', 'true');
              } else {
                localStorage.removeItem('gamze_admin_remember');
              }
            } else {
              setLoginError('Kullanıcı adı veya şifre hatalı! Lütfen tekrar deneyin.');
            }
          }} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Kullanıcı Adı</label>
              <input 
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Kullanıcı adı girin"
                autoFocus
                className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#2D2D2D]/15 text-sm focus:border-[#C5A059] focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Yönetici Şifresi</label>
              <input 
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#2D2D2D]/15 text-sm focus:border-[#C5A059] focus:outline-none transition-colors"
              />
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1 text-left">
              <label className="flex items-center gap-2 text-xs text-slate-600 font-medium cursor-pointer">
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>Beni Hatırla</span>
              </label>
            </div>

            {loginError && (
              <p className="text-rose-600 text-[11px] font-semibold text-center bg-rose-50 border border-rose-100 p-2 leading-relaxed">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#2D2D2D] hover:bg-[#C5A059] text-white text-[10px] font-bold uppercase tracking-widest transition-all rounded-none cursor-pointer"
            >
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
    );
  }

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

        {/* Tab Switcher */}
        <div className="bg-slate-900/95 border-t border-slate-800 px-6 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 text-xs font-bold transition-all rounded-lg flex items-center gap-2 cursor-pointer ${
                activeTab === 'requests'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Gelen Başvurular</span>
              {stats.new > 0 && (
                <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                  {stats.new}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-4 py-2 text-xs font-bold transition-all rounded-lg flex items-center gap-2 cursor-pointer ${
                activeTab === 'comments'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Yorum Onayları</span>
              {testimonials.filter(t => t.approved === false).length > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {testimonials.filter(t => t.approved === false).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('planner')}
              className={`px-4 py-2 text-xs font-bold transition-all rounded-lg flex items-center gap-2 cursor-pointer ${
                activeTab === 'planner'
                  ? 'bg-[#C5A059] text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Ders Programı Robotu</span>
            </button>
          </div>

          <button
            onClick={() => {
              setIsAuthenticated(false);
              localStorage.removeItem('gamze_admin_remember');
              setUsernameInput('');
              setPasswordInput('');
              onClose();
            }}
            className="px-3 py-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-900/40"
            title="Oturumu Kapat ve Çıkış Yap"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Güvenli Çıkış</span>
          </button>
        </div>

        {/* Inner Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50 flex flex-col space-y-6">

          {/* Real-time Notifications Alert Box */}
          {liveNotifications.length > 0 && (
            <div className="space-y-3">
              {liveNotifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`p-4 rounded-2xl border flex items-start justify-between shadow-md text-left transition-all relative overflow-hidden ${
                    notif.type === 'inquiry' 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    <div className={`p-2 rounded-xl shrink-0 ${
                      notif.type === 'inquiry' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950'
                    }`}>
                      {notif.type === 'inquiry' ? <Mail className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-black text-xs uppercase tracking-wider">{notif.title}</span>
                        <span className="text-[9px] opacity-60 font-mono flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-xs font-medium leading-relaxed max-w-2xl">{notif.message}</p>
                      {notif.type === 'inquiry' && notif.data && (
                        <div className="text-[11px] bg-emerald-100/50 p-2.5 rounded-lg border border-emerald-200/40 font-mono mt-1 space-y-0.5">
                          <div><strong>Aday Adı:</strong> {notif.data.fullName}</div>
                          <div><strong>Telefon:</strong> {notif.data.phone}</div>
                          <div><strong>Seçilen Hizmet:</strong> {notif.data.selectedService}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => setLiveNotifications(prev => prev.filter(x => x.id !== notif.id))}
                    className="p-1 hover:bg-stone-900/10 rounded-lg transition-colors cursor-pointer shrink-0 ml-4 animate-pulse"
                    title="Bildirimi Kapat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'requests' ? (
            <>
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
          </>
          ) : activeTab === 'comments' ? (
            <div className="flex flex-col space-y-6">
              {/* Comment Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3 text-left">
                  <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Toplam Yorum</span>
                    <span className="text-xl font-extrabold text-slate-800">{testimonials.length}</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3 text-left">
                  <div className={`p-2.5 rounded-xl ${testimonials.some(t => t.approved === false) ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-stone-50 text-stone-400'}`}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Onay Bekleyenler</span>
                    <span className="text-xl font-extrabold text-slate-800">
                      {testimonials.filter(t => t.approved === false).length}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3 text-left">
                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                    <ThumbsUp className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Yayınlananlar</span>
                    <span className="text-xl font-extrabold text-slate-800">
                      {testimonials.filter(t => t.approved !== false).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Title & Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm text-left">
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-sm">Yorum & Başarı Hikayeleri Denetimi</h3>
                  <p className="text-xs text-slate-400">Yeni gönderilen yorumları inceleyerek sitede yayınlanmasına onay verebilir veya kaldırabilirsiniz.</p>
                </div>
                {testimonials.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Tüm yorum onay geçmişini sıfırlayıp varsayılan yorumları yüklemek istediğinize emin misiniz?')) {
                        localStorage.removeItem('gamze_testimonials');
                        setTestimonials(TESTIMONIALS_DATA);
                        window.dispatchEvent(new Event('gamze-testimonials-updated'));
                      }
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200 rounded-lg text-xs font-bold transition-all cursor-pointer self-start sm:self-center"
                    title="Yorum listesini sıfırlar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yorumları Sıfırla</span>
                  </button>
                )}
              </div>

              {/* Comments Grid */}
              {testimonials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {testimonials.map((test) => {
                    const isApproved = test.approved !== false;
                    return (
                      <div 
                        key={test.id} 
                        className={`bg-white border p-6 shadow-sm flex flex-col justify-between text-left relative overflow-hidden rounded-2xl transition-all ${
                          !isApproved ? 'border-amber-300 bg-amber-50/15' : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        {/* Approved Indicator Badge */}
                        <div className="absolute right-6 top-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isApproved 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                          }`}>
                            {isApproved ? 'Sitede Yayında' : 'Onay Bekliyor'}
                          </span>
                        </div>

                        <div className="space-y-3 mt-4 sm:mt-0">
                          <div className="flex gap-1 text-amber-500">
                            <MessageSquare className="w-4 h-4 text-slate-400" />
                          </div>
                          <p className="text-slate-700 text-xs sm:text-sm leading-relaxed italic">
                            "{test.comment}"
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 border-t border-stone-100 pt-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center font-serif font-bold text-xs uppercase">
                              {test.name ? test.name.charAt(0) : 'Y'}
                            </div>
                            <div>
                              <h4 className="font-serif font-bold text-slate-900 text-xs">
                                {test.name}
                              </h4>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[9px] font-bold tracking-wider text-[#C5A059] uppercase">
                                  {test.role}
                                </span>
                                {test.examType && (
                                  <span className="text-[9px] font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                                    {test.examType}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {!isApproved && (
                              <button
                                onClick={() => handleApproveComment(test.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Onayla</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteComment(test.id)}
                              className="px-3 py-1.5 bg-stone-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 hover:border-rose-200 border border-stone-200 text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{isApproved ? 'Sil' : 'Reddet / Sil'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-24 space-y-4 bg-white rounded-2xl border border-stone-200">
                  <MessageSquare className="w-16 h-16 text-stone-300 stroke-1" />
                  <div className="space-y-1.5 px-6 max-w-sm">
                    <h4 className="font-display font-bold text-slate-900 text-sm">Hiç Yorum Bulunmuyor</h4>
                    <p className="text-xs text-slate-400">
                      Sistemde onay bekleyen veya yayınlanmış yorum bulunmuyor.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <SchedulePlanner />
          )}

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
