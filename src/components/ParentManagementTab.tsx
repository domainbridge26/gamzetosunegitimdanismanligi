import React, { useState, useMemo } from 'react';
import { 
  Users, Plus, Trash2, Edit, Key, Shield, Eye, EyeOff, 
  Search, Check, AlertCircle, Phone, Mail, GraduationCap, UserCheck 
} from 'lucide-react';
import { ParentAccount, StudentAccount } from '../types';

interface ParentManagementTabProps {
  parents: ParentAccount[];
  students: StudentAccount[];
  onAddParent: (parent: Omit<ParentAccount, 'id'>) => Promise<void>;
  onUpdateParent: (id: string, updates: Partial<ParentAccount>) => Promise<void>;
  onDeleteParent: (id: string, name: string) => Promise<void>;
}

export default function ParentManagementTab({
  parents,
  students,
  onAddParent,
  onUpdateParent,
  onDeleteParent
}: ParentManagementTabProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<ParentAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [linkedStudentUsername, setLinkedStudentUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filtered Parents
  const filteredParents = useMemo(() => {
    return parents.filter(p => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return p.fullName.toLowerCase().includes(q) ||
             p.username.toLowerCase().includes(q) ||
             (p.phone && p.phone.includes(q)) ||
             (p.linkedStudentFullName && p.linkedStudentFullName.toLowerCase().includes(q)) ||
             p.linkedStudentUsername.toLowerCase().includes(q);
    });
  }, [parents, searchTerm]);

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenCreate = () => {
    setFullName('');
    setUsername('');
    setPassword('');
    setPhone('');
    setEmail('');
    setLinkedStudentUsername(students[0]?.username || '');
    setIsCreateOpen(true);
    setEditingParent(null);
  };

  const handleOpenEdit = (p: ParentAccount) => {
    setEditingParent(p);
    setFullName(p.fullName);
    setUsername(p.username);
    setPassword(p.password);
    setPhone(p.phone || '');
    setEmail(p.email || '');
    setLinkedStudentUsername(p.linkedStudentUsername);
    setIsCreateOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim() || !password.trim()) {
      alert('Lütfen veli ad soyad, kullanıcı adı ve şifre alanlarını eksiksiz doldurunuz.');
      return;
    }
    if (!linkedStudentUsername) {
      alert('Lütfen bu veli ile ilişkilendirilecek bir öğrenci seçiniz.');
      return;
    }

    const linkedStudent = students.find(s => s.username.toLowerCase() === linkedStudentUsername.toLowerCase());

    setSubmitting(true);
    try {
      if (editingParent) {
        await onUpdateParent(editingParent.id, {
          fullName: fullName.trim(),
          username: username.trim().toLowerCase(),
          password: password.trim(),
          phone: phone.trim(),
          email: email.trim(),
          linkedStudentUsername: linkedStudentUsername.toLowerCase(),
          linkedStudentFullName: linkedStudent?.fullName || '',
          linkedStudentClass: linkedStudent?.studentClass || ''
        });
        setFeedbackMsg(`✅ ${fullName} veli hesabı başarıyla güncellendi!`);
      } else {
        // Check if username already exists
        const exists = parents.some(p => p.username.toLowerCase() === username.trim().toLowerCase());
        if (exists) {
          alert('Bu kullanıcı adı başka bir veli tarafından kullanılıyor. Lütfen farklı bir kullanıcı adı belirleyiniz.');
          setSubmitting(false);
          return;
        }

        await onAddParent({
          fullName: fullName.trim(),
          username: username.trim().toLowerCase(),
          password: password.trim(),
          phone: phone.trim(),
          email: email.trim(),
          linkedStudentUsername: linkedStudentUsername.toLowerCase(),
          linkedStudentFullName: linkedStudent?.fullName || '',
          linkedStudentClass: linkedStudent?.studentClass || '',
          createdAt: new Date().toLocaleDateString('tr-TR')
        });
        setFeedbackMsg(`🎉 ${fullName} veli hesabı oluşturuldu ve ${linkedStudent?.fullName || linkedStudentUsername} ile eşleştirildi!`);
      }

      setTimeout(() => setFeedbackMsg(''), 4000);
      setIsCreateOpen(false);
      setEditingParent(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* TOP HEADER & ACTIONS */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                <Users className="w-5 h-5" />
              </span>
              <h3 className="font-serif font-black text-lg sm:text-xl text-slate-900">
                Veli Hesap Yönetimi & Öğrenci Eşleştirme
              </h3>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Velilerin öğrenci çalışma raporlarını, kümülatif konu analizlerini ve deneme sınavlarını görebilmeleri için hesap oluşturun ve öğrenci atayın.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-[#C5A059] hover:bg-[#b08d47] text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Veli Tanımla</span>
          </button>
        </div>

        {feedbackMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{feedbackMsg}</span>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <h4 className="font-serif font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#C5A059]" />
                {editingParent ? 'Veli Hesabını Düzenle' : 'Yeni Veli Hesabı Oluştur'}
              </h4>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold"
              >
                Kapat
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Veli Adı Soyadı *</label>
                <input
                  type="text"
                  placeholder="Örn: Mehmet Yılmaz (Veli)"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
                />
              </div>

              {/* İLİŞKİLİ ÖĞRENCİ SEÇİMİ (ÖNEMLİ!) */}
              <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80">
                <label className="block text-xs font-black text-amber-950 mb-1 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#C5A059]" />
                  İlişkili Öğrenci (Hangi Öğrencinin Raporlarını Görecek?) *
                </label>
                <select
                  value={linkedStudentUsername}
                  onChange={(e) => setLinkedStudentUsername(e.target.value)}
                  required
                  className="w-full bg-white border border-amber-300 text-slate-900 text-xs sm:text-sm font-bold rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
                >
                  <option value="">-- Bir Öğrenci Seçiniz --</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.username}>
                      {st.fullName} ({st.studentClass}) - [Kullanıcı Adı: {st.username}]
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-amber-800 mt-1">
                  * Bu veli sisteme giriş yaptığında yalnızca burada seçtiğiniz öğrencinin çalışma ve deneme raporlarını görüntüleyebilecektir.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kullanıcı Adı *</label>
                  <input
                    type="text"
                    placeholder="Örn: veli_mehmet"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giriş Şifresi *</label>
                  <input
                    type="text"
                    placeholder="Örn: 123456"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telefon Numarası</label>
                  <input
                    type="text"
                    placeholder="05XX XXX XX XX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">E-Posta Adresi</label>
                  <input
                    type="email"
                    placeholder="veli@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold text-xs rounded-lg cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#C5A059] hover:bg-[#b08d47] text-slate-950 font-bold text-xs rounded-lg shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Kaydediliyor...' : editingParent ? 'Güncelle' : 'Veli Hesabını Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEARCH AND LIST OF PARENTS */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Veli adı, öğrenci adı veya kullanıcı adı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 text-slate-800 text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
            />
          </div>
          <span className="text-xs font-bold text-slate-500">
            Toplam {filteredParents.length} Kayıtlı Veli
          </span>
        </div>

        {filteredParents.length === 0 ? (
          <div className="text-center py-10 bg-stone-50 rounded-xl border border-dashed border-stone-200 text-slate-500 text-xs sm:text-sm">
            Kayıtlı veli bulunamadı. "Yeni Veli Tanımla" butonu ile veli hesabı ekleyebilirsiniz.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredParents.map((parent) => {
              const isPwVisible = visiblePasswords[parent.id];
              const linkedStudent = students.find(s => s.username.toLowerCase() === parent.linkedStudentUsername.toLowerCase());

              return (
                <div key={parent.id} className="bg-stone-50/80 p-4 rounded-xl border border-stone-200 shadow-2xs hover:border-[#C5A059] transition-all flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                          {parent.fullName}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Kayıt: {parent.createdAt}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(parent)}
                          className="p-1.5 text-slate-600 hover:bg-stone-200 rounded transition-colors cursor-pointer"
                          title="Düzenle"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteParent(parent.id, parent.fullName)}
                          className="p-1.5 text-rose-600 hover:bg-rose-100 rounded transition-colors cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Linked Student Badge */}
                    <div className="bg-white p-2.5 rounded-lg border border-amber-200/80 mb-3 flex items-center gap-2">
                      <div className="w-7 h-7 bg-amber-100 text-[#C5A059] rounded-full flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 text-left">
                        <div className="text-[9px] font-bold uppercase text-[#C5A059] tracking-wider">
                          Bağlı Öğrenci
                        </div>
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {linkedStudent?.fullName || parent.linkedStudentFullName || parent.linkedStudentUsername}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {linkedStudent?.studentClass || parent.linkedStudentClass || 'Koçluk Grubu'}
                        </div>
                      </div>
                    </div>

                    {/* Credentials & Contact */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between bg-stone-100 px-2.5 py-1 rounded">
                        <span className="text-slate-500 font-medium">Kullanıcı Adı:</span>
                        <span className="font-mono font-bold text-slate-900">{parent.username}</span>
                      </div>
                      <div className="flex items-center justify-between bg-stone-100 px-2.5 py-1 rounded">
                        <span className="text-slate-500 font-medium">Şifre:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900">
                            {isPwVisible ? parent.password : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(parent.id)}
                            className="text-slate-400 hover:text-slate-700"
                          >
                            {isPwVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      {parent.phone && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-600 pt-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{parent.phone}</span>
                        </div>
                      )}
                      {parent.email && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-600">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{parent.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
