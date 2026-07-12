import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle, BookOpen, GraduationCap, Target, Award, Calendar, 
  Sparkles, Check, Heart, HelpCircle, ArrowRight, UserCheck, 
  MapPin, Clock, MessageSquare, Flame, CheckSquare, ListTodo
} from 'lucide-react';
import tercihImg from '../assets/images/tercih_danismanligi_1783782315075.jpg';
import koclukImg from '../assets/images/ogrenci_koclugu_1783782332463.jpg';
import logoImg from '../assets/images/gamze_tosun_main_logo_1783784317486.jpg';

export default function InfoPosters() {
  const [activeTab, setActiveTab] = useState<'tercih' | 'kocluk' | 'faydalar'>('tercih');

  const tabs = [
    { id: 'tercih', label: 'Tercih Danışmanlığı', sub: 'LGS & YKS', icon: Target },
    { id: 'kocluk', label: 'Koçluk Hizmetleri', sub: '2026-2027 Dönemi', icon: ListTodo },
    { id: 'faydalar', label: 'Koçluğun Faydaları', sub: 'Başarı Rehberi', icon: Heart }
  ] as const;

  return (
    <section id="guides" className="py-24 bg-gradient-to-b from-[#FAF9F6] to-stone-100/50 border-t border-[#2D2D2D]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-[12px] font-bold tracking-[0.3em] uppercase text-[#C5A059] block">
            Eğitim ve Başarı Rehberimiz
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#2D2D2D] tracking-tight">
            Program Detayları ve Yol Haritaları
          </h2>
          <p className="text-[#2D2D2D]/80 text-sm sm:text-base leading-relaxed">
            Gamze Tosun Eğitim Danışmanlığı olarak kullandığımız resmi bilgilendirme, tercih rehberliği ve öğrenci koçluğu programlarımızın tüm detaylarını aşağıda interaktif olarak inceleyebilirsiniz.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mb-12 max-w-3xl mx-auto">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`poster-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3.5 px-6 py-4 border transition-all duration-300 text-left cursor-pointer w-full sm:w-1/3 rounded-none ${
                  isActive
                    ? 'border-[#C5A059] bg-white text-[#2D2D2D] shadow-md shadow-[#C5A059]/5 scale-[1.02]'
                    : 'border-[#2D2D2D]/10 bg-white/40 text-[#2D2D2D]/60 hover:bg-white hover:text-[#2D2D2D]'
                }`}
              >
                <div className={`p-2.5 rounded-none transition-colors ${
                  isActive ? 'bg-[#C5A059]/10 text-[#C5A059]' : 'bg-[#2D2D2D]/5 text-[#2D2D2D]/40'
                }`}>
                  <TabIcon className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-sm font-semibold tracking-tight">{tab.label}</span>
                  <span className="text-[10px] tracking-wide text-stone-500 uppercase mt-0.5">{tab.sub}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Content */}
        <div className="bg-white border border-[#2D2D2D]/10 p-6 sm:p-12 shadow-sm rounded-none">
          <AnimatePresence mode="wait">
            {activeTab === 'tercih' && (
              <motion.div
                key="tercih"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
              >
                {/* Visual / Image Side */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="relative group overflow-hidden border border-stone-200">
                    <img 
                      src={tercihImg} 
                      alt="LGS & YKS Tercih Danışmanlığı" 
                      referrerPolicy="no-referrer"
                      className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-[#C5A059] text-white text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 shadow-sm">
                      Kişiye Özel Yol Haritası
                    </div>
                  </div>
                  
                  {/* Beautiful Quote block */}
                  <div className="bg-[#FAF9F6] border-l-4 border-[#C5A059] p-5 text-left">
                    <span className="text-3xl font-serif text-[#C5A059]/40 block leading-none -mt-2">“</span>
                    <p className="font-serif text-[#2D2D2D] text-sm italic -mt-2 leading-relaxed">
                      Doğru tercih, doğru gelecek demektir. Geleceğin için en doğru adımı birlikte atalım.
                    </p>
                    <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider block mt-3">— Gamze Tosun</span>
                  </div>
                </div>

                {/* Content Side */}
                <div className="lg:col-span-7 space-y-8 text-left">
                  <div>
                    <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.2em] block mb-1">
                      Öğrenci & Veli Özel Programı
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-serif text-[#2D2D2D] tracking-tight">
                      LGS & YKS Tercih Danışmanlığı
                    </h3>
                    <p className="text-[#2D2D2D]/80 text-xs sm:text-sm mt-3 leading-relaxed">
                      Sınav puanları açıklandıktan sonra yapılan en kritik aşama tercih sürecidir. Doğru analiz edilmeyen sıralamalar ve yanlış listeler, aylarca dökülen alın terini heba edebilir. Tercih danışmanlığımızla geleceğinizi şansa bırakmayın!
                    </p>
                  </div>

                  {/* 5 columns of services represented beautifully */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest border-b border-[#2D2D2D]/10 pb-2">
                      Tercih Programı Temel Sütunları
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { title: 'Kişiye Özel Tercih Analizi', desc: 'Öğrencinin yetenek, istek ve kişilik özelliklerine uygun detaylı hedef analizi.' },
                        { title: 'Puan & Sıralama Değerlendirmesi', desc: 'En son veriler ışığında, başarı sıralamalarının ve yığılmaların bilimsel analizi.' },
                        { title: 'Lise Tercihi Danışmanlığı', desc: 'LGS öğrencileri için okul türleri, yüzdelik dilimler ve okul kültürleri rehberliği.' },
                        { title: 'Doğru Bölüm & Üniversite Seçimi', desc: 'YKS öğrencileri için istihdam imkanları, üniversite imkanları ve akademik kadro karşılaştırması.' },
                        { title: 'Güncel Veri & Uzman Rehberlik', desc: 'ÖSYM ve MEB kılavuzlarının en son güncellemeleriyle tam uyumlu profesyonel yönlendirme.' }
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 border border-[#2D2D2D]/5 bg-[#FAF9F6]/50 hover:bg-white hover:border-[#C5A059]/20 hover:shadow-sm transition-all duration-300">
                          <div className="flex items-start gap-2.5">
                            <span className="flex items-center justify-center w-5 h-5 bg-[#C5A059] text-white text-[10px] font-bold mt-0.5 shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <h5 className="font-serif text-sm font-semibold text-[#2D2D2D] leading-snug">{item.title}</h5>
                              <p className="text-[11px] text-stone-500 leading-normal mt-1">{item.desc}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer message / CTA */}
                  <div className="pt-4 border-t border-[#2D2D2D]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#C5A059] shrink-0" />
                      <span className="text-[11px] font-semibold text-[#2D2D2D]/80">
                        Yol haritanı birlikte çizelim, geleceğine en doğru adımı atalım!
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const el = document.getElementById('contact');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-5 py-3 bg-[#2D2D2D] hover:bg-[#C5A059] text-white text-[10px] font-bold uppercase tracking-widest transition-all rounded-none self-start sm:self-auto"
                    >
                      Tercih Danışmanlığı Randevusu Al
                    </button>
                  </div>
                </div>
              </motion.div>
              )}

            {activeTab === 'kocluk' && (
              <motion.div
                key="kocluk"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
              >
                {/* Visual / Image Side */}
                <div className="lg:col-span-5 space-y-6 lg:order-last">
                  <div className="relative group overflow-hidden border border-stone-200">
                    <img 
                      src={koclukImg} 
                      alt="2026-2027 Koçluk Hizmetleri" 
                      referrerPolicy="no-referrer"
                      className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 bg-[#C5A059] text-white text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 shadow-sm">
                      Kayıtlar Başladı!
                    </div>
                  </div>

                  {/* Sınıf Seviyeleri */}
                  <div className="p-5 border border-[#2D2D2D]/10 bg-[#FAF9F6] text-left">
                    <h5 className="font-serif italic text-[#2D2D2D] text-sm mb-3 font-semibold">Tüm Sınıflar İçin Profesyonel Destek:</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {['5.', '6.', '7.', '8.', '9.', '10.', '11.', '12.', 'Mezun'].map((item, idx) => (
                        <span 
                          key={idx}
                          className="w-10 h-10 flex items-center justify-center bg-white border border-[#2D2D2D]/10 text-[#2D2D2D] font-bold text-xs hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-stone-500 mt-3 font-medium uppercase tracking-wider">
                      ★ Ortaokul, Lise ve Mezun öğrenciler için kişiye özel koçluk desteği!
                    </p>
                  </div>
                </div>

                {/* Content Side */}
                <div className="lg:col-span-7 space-y-6 text-left">
                  <div>
                    <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.2em] block mb-1">
                      2026 - 2027 Eğitim Öğretim Yılı
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-serif text-[#2D2D2D] tracking-tight">
                      Koçluk Hizmetleri: Planla, Çalış, Başar!
                    </h3>
                    <p className="text-[#2D2D2D]/80 text-xs sm:text-sm mt-3 leading-relaxed">
                      Hedefine ulaşmak için yanındayım! Sıkı takip, kişiye özel planlama ve kesintisiz motivasyon desteği ile başarıya giden yolda her zaman seninleyiz.
                    </p>
                  </div>

                  {/* 12 Koçluk Hizmeti in elegant grid */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest border-b border-[#2D2D2D]/10 pb-1">
                      Kapsamlı Koçluk Hizmetlerimiz
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {[
                        { title: 'Kişiye Özel Çalışma Programı', desc: 'Hedeflerine ve ihtiyaçlarına uygun planlama.' },
                        { title: 'Haftalık Planlama ve Takip', desc: 'Haftalık plan, kontrol ve ilerleme takibi.' },
                        { title: 'Ders Çalışma Taktikleri', desc: 'Daha verimli ve etkili çalışma yöntemleri.' },
                        { title: 'Günlük Takip ve Raporlama', desc: 'Günlük disiplinli takip ve detaylı rapor.' },
                        { title: 'Deneme Sınavı Analizleri', desc: 'Detaylı analiz ve gelişim planı.' },
                        { title: 'Konu Kazanım Takibi', desc: 'Eksiklerini tespit et, güçlendir!' },
                        { title: 'Yayın Takibi ve Önerileri', desc: 'Seviyene uygun en iyi kaynaklar.' },
                        { title: 'Zaman Yönetimi Becerisi', desc: 'Sınavlarda ve günlük hayatta zamanı doğru kullan.' },
                        { title: 'Hedef Belirleme Çalışmaları', desc: 'Kısa, orta ve uzun vadeli hedeflerle ilerleme.' },
                        { title: 'Motivasyon & Özgüven Desteği', desc: 'Özgüvenini artır, heyecanını yönet, motive ol!' },
                        { title: 'Düzenli Veli Bilgilendirmeleri', desc: 'Velilerimizle sürekli iletişim ve geri bildirim.' },
                        { title: 'Canlı Destek & İletişim', desc: 'Hızlı ve kesintisiz iletişim imkanı.' }
                      ].map((service, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 py-1">
                          <Check className="w-4 h-4 text-[#C5A059] mt-0.5 shrink-0" />
                          <div>
                            <span className="font-serif text-xs font-bold text-[#2D2D2D] block leading-tight">{service.title}</span>
                            <span className="text-[10px] text-stone-500 leading-normal block mt-0.5">{service.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Motivational Text */}
                  <div className="bg-[#FAF9F6] border-l-2 border-[#2D2D2D] p-4 text-left">
                    <p className="text-[11px] font-semibold text-[#2D2D2D] italic">
                      "Unutma! Disiplinli bir plan, doğru strateji ve istikrarla hayallerine ulaşman mümkün!"
                    </p>
                  </div>

                  {/* Footer message / CTA */}
                  <div className="pt-4 border-t border-[#2D2D2D]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <span className="text-[11px] font-medium text-stone-500">
                      Yeni dönem kayıtları kontenjan sınırıyla devam etmektedir.
                    </span>
                    <button
                      onClick={() => {
                        const el = document.getElementById('contact');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-5 py-3 bg-[#2D2D2D] hover:bg-[#C5A059] text-white text-[10px] font-bold uppercase tracking-widest transition-all rounded-none self-start sm:self-auto"
                    >
                      Öğrenci Koçluğu Başvurusu Yap
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'faydalar' && (
              <motion.div
                key="faydalar"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
              >
                {/* Visual / Image Side */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="relative group overflow-hidden border border-[#2D2D2D]/10 bg-white h-[400px] flex items-center justify-center p-8">
                    <img 
                      src={logoImg} 
                      alt="Gamze Tosun Koçluk Felsefesi" 
                      referrerPolicy="no-referrer"
                      className="h-full aspect-square object-contain transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2D2D2D]/90 via-transparent to-transparent flex items-end p-6">
                      <div className="text-left text-white space-y-1">
                        <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest">
                          Rehberlik Vizyonu
                        </span>
                        <h4 className="font-serif text-sm italic font-medium leading-tight">
                          "Her öğrencinin potansiyeli vardır, önemli olan doğru rehberlikle onu ortaya çıkarmaktır."
                        </h4>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-[#FAF9F6] border-l-4 border-[#C5A059] p-5 text-left">
                    <span className="text-3xl font-serif text-[#C5A059]/40 block leading-none -mt-2">“</span>
                    <p className="font-serif text-[#2D2D2D] text-sm italic -mt-2 leading-relaxed">
                      Doğru rehberlik, net hedefler ve planlı çalışma ile başarı tesadüf değil, bir tercihtir.
                    </p>
                  </div>
                </div>

                {/* Content Side */}
                <div className="lg:col-span-7 space-y-6 text-left">
                  <div>
                    <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.2em] block mb-1">
                      Neden Öğrenci Koçluğu Alınmalı?
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-serif text-[#2D2D2D] tracking-tight">
                      Öğrenci Koçluğunun Faydaları
                    </h3>
                    <p className="text-[#2D2D2D]/80 text-xs sm:text-sm mt-3 leading-relaxed">
                      Öğrenci koçluğu sadece sınav netlerini yükseltmekle kalmaz; öğrencinin planlı, sorumluluk sahibi, özgüvenli ve hedeflerine ulaşabilen başarılı bir birey olarak yetişmesini hedefler.
                    </p>
                  </div>

                  {/* 4 Major groups of benefits for readability and impact */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest border-b border-[#2D2D2D]/10 pb-1">
                      Temel Kazanımlar ve Alanlar
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { 
                          category: 'Akademik Gelişim', 
                          desc: 'Kişiye özel çalışma programı, ders çalışma alışkanlığı, verimli çalışma taktikleri, konu kazanım takibi ve deneme analizleri.' 
                        },
                        { 
                          category: 'Kişisel Beceriler', 
                          desc: 'Zaman yönetimi becerisi, hedef belirleme ve odaklanma, sorumluluk bilinci, planlama ve süreklilik.' 
                        },
                        { 
                          category: 'Zihinsel & Psikolojik Destek', 
                          desc: 'Sınav kaygısı ve stres yönetimi, motivasyon ve özgüven desteği, teknoloji ve sosyal medya dengesi, ertelemeyi azaltma.' 
                        },
                        { 
                          category: 'Veli & Takip Yönetimi', 
                          desc: 'Düzenli veli bilgilendirmeleri, gelişim raporlamaları, öğrencinin psikolojik dengesi ve huzurlu ev-çalışma ortamı.' 
                        }
                      ].map((group, idx) => (
                        <div key={idx} className="p-4 border border-[#2D2D2D]/5 bg-[#FAF9F6]/30 hover:bg-white hover:border-[#C5A059]/20 transition-all duration-300">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="p-1 bg-[#C5A059]/10 text-[#C5A059] rounded-none">
                              <CheckCircle className="w-4 h-4" />
                            </span>
                            <h5 className="font-serif text-sm font-semibold text-[#2D2D2D]">{group.category}</h5>
                          </div>
                          <p className="text-[11px] text-stone-500 leading-relaxed">{group.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Conclusion Badge */}
                  <div className="bg-[#FAF9F6] border border-[#2D2D2D]/10 p-5 text-stone-700 text-xs leading-relaxed italic">
                    <strong>Sonuç:</strong> Öğrenci koçluğu ve eğitim danışmanlığı; öğrencinin sadece notlarını yükseltmeyi değil, aynı zamanda planlı, sorumluluk sahibi, özgüvenli ve hedeflerine ulaşabilen bir birey olarak yetişmesini amaçlar. Başarıya giden yolda birlikte ilerleyelim!
                  </div>

                  {/* Footer message / CTA */}
                  <div className="pt-4 border-t border-[#2D2D2D]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <span className="text-[11px] font-medium text-stone-500">
                      Öğrencinizin gelişim yolculuğunu bugün başlatın.
                    </span>
                    <button
                      onClick={() => {
                        const el = document.getElementById('contact');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-5 py-3 bg-[#2D2D2D] hover:bg-[#C5A059] text-white text-[10px] font-bold uppercase tracking-widest transition-all rounded-none self-start sm:self-auto"
                    >
                      Bize Ulaşın
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
