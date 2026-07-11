import React, { useState, useEffect } from 'react';
import { 
  X, Check, Trash2, Archive, Shield, Phone, 
  Mail, Calendar, Users, FileSpreadsheet, PlusCircle, UserCheck,
  ListFilter, Sparkles, MessageSquare, ThumbsUp, LogOut, Clock, Info
} from 'lucide-react';
import { ContactSubmission, Testimonial } from '../types';
import { TESTIMONIALS_DATA } from '../data';
import SchedulePlanner from './SchedulePlanner';

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

  const [liveNotifications, setLiveNotifications] = useState<{
    id: string;
    type: 'inquiry' | 'testimonial';
    title: string;
    message: string;
    time: string;
    data: any;
  }[]>([]);

  const loadInquiries = () => {
    const raw = localStorage.getItem('gamze_inquiries');
    if (raw) {
      setInquiries(JSON.parse(raw));
    } else {
      setInquiries([]);
    }
  };

  const loadTestimonials = () => {
    const raw = localStorage.getItem('gamze_testimonials');
    if (raw) {
      setTestimonials(JSON.parse(raw));
    } else {
      setTestimonials(TESTIMONIALS_DATA);
    }
  };

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

  // DÜZELTİLMİŞ BÖLÜM: Yeni gelen verileri kalıcı hafızaya (localStorage) kaydeder
  useEffect(() => {
    const handleNewInquiry = (e: Event) => {
      const customEvent = e as CustomEvent<ContactSubmission>;
      const newInq = customEvent.detail;
      
      setInquiries(prev => {
        if (prev.some(x => x.id === newInq.id)) return prev;
        const updated = [newInq, ...prev];
        // Kaybolmaması için hafızaya yazıyoruz
        localStorage.setItem('gamze_inquiries', JSON.stringify(updated));
        return updated;
      });

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

      setTestimonials(prev => {
        if (prev.some(x => x.id === newTest.id)) return prev;
        const updated = [newTest, ...prev];
        // Kaybolmaması için hafızaya yazıyoruz
        localStorage.setItem('gamze_testimonials', JSON.stringify(updated));
        return updated;
      });

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

  const handleApproveComment = (id: string) => {
    const updated = testimonials.map(test => {
      if (test.id === id) {
        return { ...test, approved: true };
      }
      return test;
    });
    localStorage.setItem('gamze_testimonials', JSON.stringify(updated));
    setTestimonials(updated);
    window.dispatchEvent(new Event('gamze-testimonials-updated'));
  };

  const handleDeleteComment = (id: string) => {
    if (confirm('Bu yorumu silmek istediğinize emin misiniz?')) {
      const updated = testimonials.filter(test => test.id !== id);
      localStorage.setItem('gamze_testimonials', JSON.stringify(updated));
      setTestimonials(updated);
      window.dispatchEvent(new Event('gamze-testimonials-updated'));
    }
  };

  const handleSeedSamples = () => {
    const samples: ContactSubmission[] = [
      {
        id: 'sample-1',
        fullName: 'Ahmet Hamdi Tanpınar',
        phone: '0 (543) 987 65 43',
        email: 'ahmet.tanpinar@veli.com',
        studentClass: '12. Sınıf (YKS)',
        selectedService: 'Öğrenci Koçluğu',
        message: 'Oğlum deneme sınavlarında matematik netlerini bir türlü artıramıyor. Sürekli sürenin yetmediğinden şikayetçi.',
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
        message: 'LGS sınavına hazırlanıyorum. Okuma hızımı artırmak istiyorum.',
        createdAt: '10.07.2026 15:45:12',
        status: 'Görüşüldü'
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
    if (confirm('TÜM başvuruları temizlemek istediğinize emin misiniz?')) {
      localStorage.removeItem('gamze_inquiries');
      setInquiries([]);
    }
  };

  const filteredInquiries = inquiries.filter(inq => {
    const matchesStatus = filterStatus === 'Tümü' || inq.status === filterStatus;
    const matchesSearch = 
      inq.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      inq.phone.includes(searchQuery) ||
      inq.selectedService.toLowerCase().includes(searchQuery.toLowerCase());
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
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-[#2D2D2D]/60 hover:text-[#2D2D2D] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center mx-auto border border-[#C5A059]/20">
            <Shield className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-xl font-bold text-[#2D2D2D]">Yönetici Girişi</h3>
            <p className="text-stone-500 text-xs">Sadece Gamze Tosun erişebilir.</p>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (usernameInput === 'Gamze' && passwordInput === 'Gamze1283') {
              setIsAuthenticated(true);
              setLoginError('');
              if (rememberMe) localStorage.setItem('gamze_admin_remember', 'true');
              else localStorage.removeItem('gamze_admin_remember');
            } else {
              setLoginError('Hatalı giriş!');
            }
          }} className="space-y-4">
            <input type="text" required value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} placeholder="Kullanıcı Adı" className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#2D2D2D]/15 text-sm outline-none" />
            <input type="password" required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Şifre" className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#2D2D2D]/15 text-sm outline-none" />
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4" />
              <span>Beni Hatırla</span>
            </label>
            {loginError && <p className="text-rose-600 text-[11px] font-bold">{loginError}</p>}
            <button type="submit" className="w-full py-3.5 bg-[#2D2D2D] hover:bg-[#C5A059] text-white text-[10px] font-bold uppercase tracking-widest cursor-pointer">Giriş Yap</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-55 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-6xl h-[85vh] shadow-2xl flex flex-col overflow-hidden border border-stone-200">
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-xl"><Shield className="w-5 h-5 text-white" /></div>
            <div className="text-left">
              <h2 className="font-display font-bold text-lg leading-none">Gamze Hanım Yönetici Paneli</h2>
              <span className="text-xs text-slate-400">Başvuru ve Yorum Takip Sistemi</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <div className="bg-slate-900/95 border-t border-slate-800 px-6 py-2 flex items-center gap-2">
          <button onClick={() => setActiveTab('requests')} className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer ${activeTab === 'requests' ? 'bg-emerald-600 text-white' : 'text-slate-300'}`}>
            <Users className="w-4 h-4" /> <span>Başvurular</span>
            {stats.new > 0 && <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">{stats.new}</span>}
          </button>
          <button onClick={() => setActiveTab('comments')} className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer ${activeTab === 'comments' ? 'bg-amber-600 text-white' : 'text-slate-300'}`}>
            <MessageSquare className="w-4 h-4" /> <span>Yorumlar</span>
            {testimonials.filter(t => t.approved === false).length > 0 && <span className="bg-amber-500 text-slate-950 text-[10px] px-1.5 py-0.5 rounded-full">{testimonials.filter(t => t.approved === false).length}</span>}
          </button>
          <button onClick={() => setActiveTab('planner')} className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer ${activeTab === 'planner' ? 'bg-[#C5A059] text-slate-950' : 'text-slate-300'}`}>
            <Sparkles className="w-4 h-4" /> <span>Ders Programı</span>
          </button>
          <button onClick={() => { setIsAuthenticated(false); localStorage.removeItem('gamze_admin_remember'); onClose(); }} className="ml-auto px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-950/40 rounded-lg flex items-center gap-1.5 border border-rose-900/40 cursor-pointer">
            <LogOut className="w-4 h-4" /> Çıkış
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-stone-50 flex flex-col space-y-6">
          {liveNotifications.map((notif) => (
            <div key={notif.id} className={`p-4 rounded-2xl border flex items-start justify-between shadow-md text-left transition-all ${notif.type === 'inquiry' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className="flex gap-3">
                <div className={`p-2 rounded-xl ${notif.type === 'inquiry' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950'}`}>
                  {notif.type === 'inquiry' ? <Mail className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase">{notif.title}</span>
                    <span className="text-[9px] opacity-60 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{notif.time}</span>
                  </div>
                  <p className="text-xs font-medium">{notif.message}</p>
                </div>
              </div>
              <button onClick={() => setLiveNotifications(prev => prev.filter(x => x.id !== notif.id))} className="p-1 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
          ))}

          {activeTab === 'requests' ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3 text-left">
                  <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl"><Users className="w-5 h-5" /></div>
                  <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400">Toplam</span><span className="text-xl font-extrabold text-slate-800">{stats.total}</span></div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3 text-left">
                  <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl animate-pulse"><PlusCircle className="w-5 h-5" /></div>
                  <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400">Yeni</span><span className="text-xl font-extrabold text-slate-800">{stats.new}</span></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                {filteredInquiries.length > 0 ? (
                  <table className="w-full text-left">
                    <thead className="bg-stone-50 border-b border-stone-200 text-slate-500 font-bold text-[10px] uppercase">
                      <tr><th className="px-5 py-4">Aday Detayı</th><th className="px-5 py-4">Sınav & Hizmet</th><th className="px-5 py-4 text-center">Durum</th><th className="px-5 py-4 text-right">İşlemler</th></tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredInquiries.map((inq) => (
                        <tr key={inq.id} className="hover:bg-stone-50/50">
                          <td className="px-5 py-4">
                            <div className="flex flex-col text-left"><span className="font-bold text-slate-900 text-sm">{inq.fullName}</span><span className="text-[11px] text-slate-500">{inq.phone}</span></div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col items-start gap-1"><span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded">{inq.studentClass}</span><span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full">{inq.selectedService}</span></div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-[9px] font-bold ${inq.status === 'Yeni' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>{inq.status}</span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button onClick={() => updateStatus(inq.id, 'Görüşüldü')} className="p-1 text-emerald-700 cursor-pointer"><Check className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(inq.id)} className="p-1 text-red-600 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-20 text-center text-slate-400 text-xs">Başvuru bulunmuyor.</div>
                )}
              </div>
            </>
          ) : activeTab === 'comments' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((test) => (
                <div key={test.id} className={`bg-white border p-6 rounded-2xl text-left relative ${!test.approved ? 'border-amber-300 bg-amber-50/10' : 'border-stone-200'}`}>
                  <div className="absolute right-4 top-4"><span className={`px-2 py-1 rounded-full text-[9px] font-bold ${test.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'}`}>{test.approved ? 'Yayında' : 'Onay Bekliyor'}</span></div>
                  <p className="text-slate-700 text-sm italic mt-4">"{test.comment}"</p>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-stone-100">
                    <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-bold text-xs">{test.name.charAt(0)}</div><div className="text-xs font-bold">{test.name}</div></div>
                    <div className="flex gap-2">
                      {!test.approved && <button onClick={() => handleApproveComment(test.id)} className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg cursor-pointer">Onayla</button>}
                      <button onClick={() => handleDeleteComment(test.id)} className="px-3 py-1.5 bg-stone-100 text-slate-600 text-[10px] font-bold rounded-lg border border-stone-200 cursor-pointer">Sil</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <SchedulePlanner />
          )}
        </div>
        <div className="bg-stone-100 px-6 py-4 flex justify-between border-t border-stone-200 text-[10px] text-slate-500 font-medium">
          <span>* Veriler tarayıcı hafızasında saklanır.</span>
          <span>Gamze Tosun Danışmanlık v1.1 - Fixed Persistence</span>
        </div>
      </div>
    </div>
  );
}
