import React, { useState, useEffect } from 'react';
import { TESTIMONIALS_DATA } from '../data';
import { Star, GraduationCap, Quote, MessageSquare, Send, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Testimonial } from '../types';

export default function Testimonials() {
  const [filter, setFilter] = useState<'Tümü' | 'Öğrenci' | 'Veli'>('Tümü');

  // Load dynamically, fallback to static initial list
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    const saved = localStorage.getItem('gamze_testimonials');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Yorumlar yüklenirken hata oluştu:", e);
      }
    }
    return TESTIMONIALS_DATA;
  });

  // Keep state updated in real-time when comments are approved or deleted by Admin
  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('gamze_testimonials');
      if (saved) {
        try {
          setTestimonials(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener('gamze-testimonials-updated', handleUpdate);
    return () => window.removeEventListener('gamze-testimonials-updated', handleUpdate);
  }, []);

  // Review Form States
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Öğrenci' | 'Veli'>('Öğrenci');
  const [examType, setExamType] = useState<'YKS' | 'LGS' | 'Hızlı Okuma' | 'Genel'>('Genel');
  const [achievement, setAchievement] = useState('');
  const [comment, setComment] = useState('');
  
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const filteredData = testimonials.filter((item) => {
    if (item.approved === false) return false;
    if (filter === 'Tümü') return true;
    return item.role === filter;
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim() || !achievement.trim()) {
      setErrorMsg('Lütfen Ad Soyad, Başarı/Kazanılan Okul ve Yorum alanlarını doldurun.');
      return;
    }

    const newTestimonial: Testimonial = {
      id: String(Date.now()),
      name: name.trim(),
      role: role,
      examType: examType,
      achievement: achievement.trim(),
      comment: comment.trim(),
      approved: false // Requires admin moderation
    };

    // Retrieve full list, merge, and save
    const saved = localStorage.getItem('gamze_testimonials');
    const existingList: Testimonial[] = saved ? JSON.parse(saved) : [...TESTIMONIALS_DATA];
    const updated = [newTestimonial, ...existingList];
    setTestimonials(updated);
    localStorage.setItem('gamze_testimonials', JSON.stringify(updated));

    // Dispatch event to notify the Admin Panel in real time
    window.dispatchEvent(new CustomEvent('gamze-new-testimonial', { detail: newTestimonial }));

    // Reset Form
    setName('');
    setAchievement('');
    setComment('');
    setErrorMsg('');
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 8000);
  };

  return (
    <section id="testimonials" className="py-24 bg-stone-50 border-t border-[#2D2D2D]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-[12px] font-bold tracking-[0.3em] uppercase text-[#C5A059] block">
            Sizden Gelenler
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#2D2D2D] tracking-tight">
            Başarı Hikayeleri ve Veli Yorumları
          </h2>
          <p className="text-[#2D2D2D]/80 text-sm sm:text-base leading-relaxed">
            Gamze Tosun Eğitim Danışmanlığı ve Öğrenci Koçluğu süreci ile hayallerine ulaşan öğrencilerimizin ve kıymetli velilerimizin paylaştığı deneyimler.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-2 mb-12">
          {(['Tümü', 'Öğrenci', 'Veli'] as const).map((roleVal) => (
            <button
              key={roleVal}
              onClick={() => setFilter(roleVal)}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer rounded-none ${
                filter === roleVal
                  ? 'bg-[#2D2D2D] text-white border-[#2D2D2D] shadow-sm'
                  : 'bg-white text-[#2D2D2D]/70 border-stone-200 hover:border-[#2D2D2D]/40'
              }`}
            >
              {roleVal === 'Tümü' ? 'Tüm Yorumlar' : `${roleVal} Yorumları`}
            </button>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-20">
          <AnimatePresence mode="popLayout">
            {filteredData.map((test) => (
              <motion.div
                key={test.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                className="bg-white border border-[#2D2D2D]/10 p-6 sm:p-8 shadow-sm flex flex-col justify-between text-left relative overflow-hidden group hover:border-[#C5A059]/30 transition-all rounded-none"
              >
                {/* Visual quote accent */}
                <Quote className="absolute right-6 top-6 w-14 h-14 text-stone-100 opacity-60 group-hover:scale-110 transition-transform" />

                <div className="space-y-4 relative">
                  {/* Stars */}
                  <div className="flex gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-[#2D2D2D]/90 text-xs sm:text-sm leading-relaxed italic">
                    "{test.comment}"
                  </p>
                </div>

                {/* Profile detail (WITHOUT PHOTO / FOTOĞRAFSIZ) */}
                <div className="flex items-center gap-4 mt-6 border-t border-[#2D2D2D]/5 pt-4 relative">
                  <div className="w-10 h-10 rounded-none bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center font-serif font-bold text-sm shrink-0 border border-[#C5A059]/20 uppercase">
                    {test.name ? test.name.charAt(0) : 'Y'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-bold text-[#2D2D2D] text-sm truncate">
                      {test.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] font-bold tracking-wider text-[#C5A059] uppercase">
                        {test.role}
                      </span>
                      {test.examType && (
                        <span className="text-[9px] font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5">
                          {test.examType}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Achievement badge */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-[#2D2D2D] bg-[#FAF9F6] px-2.5 py-1 border border-[#2D2D2D]/10">
                      <GraduationCap className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>{test.achievement}</span>
                    </div>
                  </div>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Comment Writing Section (YORUM YAZMA BÖLÜMÜ) */}
        <div id="write-testimonial" className="max-w-3xl mx-auto bg-white border border-[#2D2D2D]/10 p-6 sm:p-10 shadow-sm rounded-none text-left">
          <div className="flex items-center gap-3 border-b border-[#2D2D2D]/10 pb-4 mb-6">
            <div className="p-2.5 bg-[#C5A059]/10 text-[#C5A059]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2D2D2D]">Deneyiminizi Paylaşın</h3>
              <p className="text-stone-500 text-xs">Gamze Hocam ile yürüttüğünüz süreci yorumlayarak yeni öğrencilere ilham verin.</p>
            </div>
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Ad Soyad */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#2D2D2D]/60 uppercase tracking-widest block">Ad Soyad *</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: Ahmet Yılmaz"
                  required
                  className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#2D2D2D]/15 text-sm focus:border-[#C5A059] focus:outline-none transition-colors"
                />
              </div>

              {/* Başarı / Kazanılan Okul */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#2D2D2D]/60 uppercase tracking-widest block">Başarı / Kazanılan Okul *</label>
                <input 
                  type="text" 
                  value={achievement}
                  onChange={(e) => setAchievement(e.target.value)}
                  placeholder="Örn: Kabataş Lisesi veya Net Artışı"
                  required
                  className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#2D2D2D]/15 text-sm focus:border-[#C5A059] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Rol */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#2D2D2D]/60 uppercase tracking-widest block">Rolünüz</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'Öğrenci' | 'Veli')}
                  className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#2D2D2D]/15 text-sm focus:border-[#C5A059] focus:outline-none transition-colors appearance-none cursor-pointer"
                >
                  <option value="Öğrenci">Öğrenci</option>
                  <option value="Veli">Veli</option>
                </select>
              </div>

              {/* Sınav Tipi */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#2D2D2D]/60 uppercase tracking-widest block">Program / Sınav Tipi</label>
                <select 
                  value={examType}
                  onChange={(e) => setExamType(e.target.value as 'YKS' | 'LGS' | 'Hızlı Okuma' | 'Genel')}
                  className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#2D2D2D]/15 text-sm focus:border-[#C5A059] focus:outline-none transition-colors appearance-none cursor-pointer"
                >
                  <option value="Genel">Genel Koçluk / Danışmanlık</option>
                  <option value="YKS">YKS Hazırlık</option>
                  <option value="LGS">LGS Hazırlık</option>
                  <option value="Hızlı Okuma">Hızlı Okuma Teknikleri</option>
                </select>
              </div>
            </div>

            {/* Yorum */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#2D2D2D]/60 uppercase tracking-widest block">Yorumunuz *</label>
              <textarea 
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Eğitim, takip ve motivasyon süreci hakkındaki değerli fikirleriniz..."
                required
                className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#2D2D2D]/15 text-sm focus:border-[#C5A059] focus:outline-none transition-colors"
              />
            </div>

            {/* Geri Bildirim Mesajları */}
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Yorumunuz başarıyla alındı ve yönetici onayına gönderildi! Gamze Hanım'ın onayının ardından sitemizde yayınlanacaktır. Teşekkür ederiz.</span>
              </div>
            )}

            {/* Gönder Butonu */}
            <button
              type="submit"
              className="px-6 py-3.5 bg-[#2D2D2D] hover:bg-[#C5A059] text-white text-[10px] font-bold uppercase tracking-widest transition-all rounded-none flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Yorumu Yayınla</span>
            </button>
          </form>
        </div>

      </div>
    </section>
  );
}
