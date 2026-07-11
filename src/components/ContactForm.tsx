import React, { useState } from 'react';
import { Phone, Mail, Clock, Send, CheckCircle2, AlertCircle, Calendar, Instagram } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ContactSubmission } from '../types';

export default function ContactForm() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [studentClass, setStudentClass] = useState('12. Sınıf (YKS)');
  const [selectedService, setSelectedService] = useState('Öğrenci Koçluğu');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName || !phone || !message) {
      setErrorMsg('Lütfen gerekli tüm alanları (Ad Soyad, Telefon ve Mesaj) doldurun.');
      return;
    }

    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      try {
        const newInquiry: ContactSubmission = {
          id: Math.random().toString(36).substring(2, 9),
          fullName,
          phone,
          email,
          studentClass,
          selectedService,
          message,
          createdAt: new Date().toLocaleString('tr-TR'),
          status: 'Yeni'
        };

        // Get existing or create new list
        const existingRaw = localStorage.getItem('gamze_inquiries');
        const inquiries: ContactSubmission[] = existingRaw ? JSON.parse(existingRaw) : [];
        inquiries.unshift(newInquiry);
        localStorage.setItem('gamze_inquiries', JSON.stringify(inquiries));

        setSuccess(true);
        // Clear Form
        setFullName('');
        setPhone('');
        setEmail('');
        setMessage('');
      } catch (err) {
        setErrorMsg('Bir hata oluştu. Lütfen bilgilerinizi kontrol edip tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    }, 1200);
  };

  return (
    <section id="contact" className="py-20 bg-stone-100/30 border-t border-stone-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Contact Details & Info (Left 5 cols) */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <div className="space-y-4">
              <span className="text-xs font-bold text-emerald-700 tracking-widest uppercase bg-emerald-100/60 px-3 py-1 rounded-full">
                Bize Ulaşın
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
                Ücretsiz Ön Görüşme ve Analiz İçin Formu Doldurun
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Çocuğunuzun geleceğine birlikte yön verelim. Formu doldurduğunuzda, talebiniz Gamze Hanım'a anında iletilir ve en geç 24 saat içinde durum değerlendirmesi için sizinle irtibat kurulur.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4 p-4 bg-white border border-stone-200/60 rounded-2xl shadow-sm">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                  <Instagram className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Instagram</span>
                  <a href="https://www.instagram.com/gamzetosundanismanlikvekocluk" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-800 hover:text-rose-600 transition-colors">
                    gamzetosundanışmanlıkvekoçluk
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white border border-stone-200/60 rounded-2xl shadow-sm">
                <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">E-Posta Adresi</span>
                  <a href="mailto:gamzetosunegitimdanismanligi@gmail.com" className="text-sm font-bold text-slate-800 hover:text-emerald-700 transition-colors">
                    gamzetosunegitimdanismanligi@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white border border-stone-200/60 rounded-2xl shadow-sm">
                <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Çalışma Saatleri</span>
                  <span className="text-sm font-bold text-slate-800">
                    Pazartesi - Cumartesi: 09:00 - 19:30
                  </span>
                </div>
              </div>
            </div>

            {/* Map/Location Mock */}
            <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 p-6 rounded-3xl text-stone-100 space-y-3 relative overflow-hidden">
              <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-white/5 rounded-full filter blur-2xl" />
              <h4 className="font-display font-bold text-sm">Hizmet Bölgesi</h4>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Eğitim danışmanlığı, koçluk ve hızlı okuma seanslarımız yüz yüze veya online (zoom üzerinden kesintisiz interaktif katılım ile) Türkiye geneli uygulanmaktadır.
              </p>
            </div>
          </div>

          {/* Form Side (Right 7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-stone-200 p-6 sm:p-10 rounded-3xl shadow-xl">
              
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-10 space-y-6"
                  >
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 className="w-10 h-10 stroke-2" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-display font-black text-2xl text-slate-900">
                        Başvurunuz Alındı!
                      </h3>
                      <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                        Sayın velimiz/öğrencimiz, talebiniz Gamze Tosun'un kontrol paneline başarıyla ulaştı. En kısa sürede telefon üzerinden arayarak randevunuzu kesinleştireceğiz.
                      </p>
                    </div>

                    <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl text-left flex gap-3 max-w-md mx-auto items-start">
                      <Calendar className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-800">Sıradaki Adım Ne?</span>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Öğrencinin durumunu ve hedeflerini anlamak için 15 dakikalık ücretsiz bir tanışma seansı gerçekleştireceğiz. Telefonunuzu açık tutmayı unutmayın!
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSuccess(false)}
                      className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
                    >
                      Yeni Bir Talep Gönder
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="contact-form"
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    <div className="border-b border-stone-100 pb-3 text-left">
                      <h3 className="font-display font-extrabold text-lg text-slate-900">Başvuru Bilgileri</h3>
                      <p className="text-xs text-slate-400">Ücretsiz değerlendirme için bilgilerinizi eksiksiz yazın.</p>
                    </div>

                    {errorMsg && (
                      <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs flex items-center gap-2 text-left">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="flex flex-col text-left space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ad Soyad *</label>
                        <input
                          type="text" required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Örn: Gamze Yılmaz"
                          className="px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
                        />
                      </div>

                      {/* Phone */}
                      <div className="flex flex-col text-left space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Telefon Numarası *</label>
                        <input
                          type="tel" required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Örn: 0 (555) 123 45 67"
                          className="px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Class/Category */}
                      <div className="flex flex-col text-left space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Öğrenci Sınıfı / Grubu</label>
                        <select
                          value={studentClass}
                          onChange={(e) => setStudentClass(e.target.value)}
                          className="px-4 py-3 border border-stone-200 rounded-xl text-sm bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors cursor-pointer"
                        >
                          <option value="12. Sınıf (YKS)">12. Sınıf (YKS Sınav Grubu)</option>
                          <option value="8. Sınıf (LGS)">8. Sınıf (LGS Sınav Grubu)</option>
                          <option value="Mezun (YKS)">Mezun (YKS Sınav Grubu)</option>
                          <option value="Ara Sınıf (9, 10, 11)">Ara Sınıf (9, 10, 11)</option>
                          <option value="Ortaokul Ara Sınıf">Ortaokul Ara Sınıf (5, 6, 7)</option>
                          <option value="Sadece Hızlı Okuma">Sadece Hızlı Okuma Teknikleri</option>
                          <option value="Veli Görüşmesi">Sadece Veli / Aile Koçluğu</option>
                        </select>
                      </div>

                      {/* Service Interest */}
                      <div className="flex flex-col text-left space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">İstediğiniz Ana Hizmet</label>
                        <select
                          value={selectedService}
                          onChange={(e) => setSelectedService(e.target.value)}
                          className="px-4 py-3 border border-stone-200 rounded-xl text-sm bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors cursor-pointer"
                        >
                          <option value="Öğrenci Koçluğu">Öğrenci Koçluğu</option>
                          <option value="Eğitim Danışmanlığı">Eğitim Danışmanlığı</option>
                          <option value="Tercih Danışmanlığı">YKS & LGS Tercih Danışmanlığı</option>
                          <option value="Hızlı Okuma">Hızlı Okuma Teknikleri</option>
                          <option value="Genel Analiz / Paket">Tümünü Kapsayan Bütünsel Paket</option>
                        </select>
                      </div>
                    </div>

                    {/* Email (Optional) */}
                    <div className="flex flex-col text-left space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">E-Posta Adresi (İsteğe Bağlı)</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Örn: veli@eposta.com"
                        className="px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
                      />
                    </div>

                    {/* Message */}
                    <div className="flex flex-col text-left space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hedefleriniz & Mesajınız *</label>
                      <textarea
                        required rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Öğrencinizin hedefleri, deneme netleri ya da odaklanma zorlukları hakkında kısa bir özet yazın..."
                        className="px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-gradient-to-r from-emerald-700 to-teal-700 text-stone-50 font-bold text-sm rounded-xl shadow-lg hover:shadow-emerald-900/15 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-stone-300"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Ücretsiz Ön Değerlendirme Talebi Gönder</span>
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
