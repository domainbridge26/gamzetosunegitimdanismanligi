import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, BookOpen, GraduationCap, Compass, Trophy, Eye, Users } from 'lucide-react';
import { motion } from 'motion/react';
import logoImg from '../assets/images/gamze_tosun_main_logo_1783784317486.jpg';
import { dbSubscribeToPageViews, PageViews } from '../lib/firebase';

interface HeroProps {
  onExploreServices: () => void;
  onTryTools: () => void;
}

export default function Hero({ onExploreServices, onTryTools }: HeroProps) {
  const [pageViews, setPageViews] = useState<PageViews>({ todayViews: 0, totalViews: 0 });

  useEffect(() => {
    const unsubscribe = dbSubscribeToPageViews((views) => {
      setPageViews(views);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const stats = [
    { value: '8+', label: 'Yıl Deneyim', icon: Trophy, color: 'text-amber-600 bg-amber-50' },
    { value: '1.500+', label: 'Başarılı Öğrenci', icon: GraduationCap, color: 'text-emerald-600 bg-emerald-50' },
    { value: '3 Kat', label: 'Ort. Okuma Hızı', icon: BookOpen, color: 'text-teal-600 bg-teal-50' },
    { value: '%98', label: 'Memnuniyet', icon: Compass, color: 'text-sky-600 bg-sky-50' },
  ];

  return (
    <section 
      id="hero" 
      className="relative pt-24 pb-14 sm:pt-28 sm:pb-16 md:pt-36 md:pb-24 overflow-hidden bg-[#FAF9F6]"
    >
      {/* Decorative Editorial Background Accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[#2D2D2D]/5" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[#2D2D2D]/5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Hero Text and Description */}
          <div id="hero-text-container" className="lg:col-span-7 flex flex-col items-start">
            
            {/* Top Bar with Category & Live Mobile-Friendly Visit Counter */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap items-center justify-between gap-3 w-full mb-4 text-left"
            >
              <span className="text-[11px] sm:text-[12px] font-bold tracking-[0.25em] sm:tracking-[0.3em] uppercase text-[#C5A059]">
                Akademik Başarı Stratejileri
              </span>

              {/* Home Page Live Site Visitor Counter (Mobile & Desktop) */}
              <div 
                id="hero-live-visitor-badge"
                className="flex items-center gap-2 px-3 py-1 bg-white border border-[#2D2D2D]/15 rounded shadow-xs"
                title="Sitedeki Canlı Toplam Ziyaret Sayısı"
              >
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-[#2D2D2D]/60 uppercase tracking-wider">
                  Site Ziyaret Sayısı:
                </span>
                <span className="text-xs sm:text-sm font-black text-[#2D2D2D] font-mono leading-none">
                  {pageViews.totalViews > 0 ? pageViews.totalViews.toLocaleString('tr-TR') : '...'}
                </span>
              </div>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-7xl lg:text-8xl font-serif font-black leading-[0.95] tracking-tighter mb-6 sm:mb-8 text-[#2D2D2D] text-left"
            >
              Potansiyelini <br />
              <span className="italic font-normal">Geleceğe</span> Dönüştür.
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg leading-relaxed opacity-80 max-w-lg mb-4 text-left"
            >
              YKS ve LGS süreçlerinde profesyonel rehberlik, bireysel öğrenci koçluğu, hızlı okuma teknikleri ve bütünsel eğitim danışmanlığı ile akademik yolculuğunuzda yanınızdayız.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="border-l-2 border-[#C5A059] pl-4 py-1 mb-6 sm:mb-8 text-left"
            >
              <p className="font-serif italic text-sm sm:text-base text-[#2D2D2D]/90 font-medium">
                "Potansiyelini keşfet, hedeflerine emin adımlarla ilerle."
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto pb-6 sm:pb-8"
            >
              <button
                id="hero-cta-primary"
                onClick={onTryTools}
                className="bg-[#2D2D2D] text-[#FAF9F6] px-8 sm:px-10 py-3.5 sm:py-4 text-[11px] sm:text-[12px] font-bold uppercase tracking-widest hover:bg-[#C5A059] transition-all duration-300 cursor-pointer text-center"
              >
                Ücretsiz Ön Görüşme
              </button>
              
              <button
                id="hero-cta-secondary"
                onClick={onExploreServices}
                className="border border-[#2D2D2D] text-[#2D2D2D] px-8 sm:px-10 py-3.5 sm:py-4 text-[11px] sm:text-[12px] font-bold uppercase tracking-widest hover:bg-[#2D2D2D]/5 transition-all duration-300 text-center cursor-pointer"
              >
                Programları Keşfet
              </button>
            </motion.div>
            
            {/* Quick Trust badges */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2 pt-5 sm:pt-6 border-t border-[#2D2D2D]/10 w-full"
            >
              <span className="text-[10px] font-bold text-[#2D2D2D]/50 uppercase tracking-widest">Hizmet Alanları:</span>
              <span className="text-[10px] font-bold text-[#2D2D2D]/70 tracking-wider uppercase border border-[#2D2D2D]/10 px-2.5 py-1 bg-white/50">Bireysel Koçluk</span>
              <span className="text-[10px] font-bold text-[#2D2D2D]/70 tracking-wider uppercase border border-[#2D2D2D]/10 px-2.5 py-1 bg-white/50">YKS & LGS</span>
              <span className="text-[10px] font-bold text-[#2D2D2D]/70 tracking-wider uppercase border border-[#2D2D2D]/10 px-2.5 py-1 bg-white/50">Hızlı Okuma</span>
              <span className="text-[10px] font-bold text-[#2D2D2D]/70 tracking-wider uppercase border border-[#2D2D2D]/10 px-2.5 py-1 bg-white/50">Tercih Analizi</span>
            </motion.div>
          </div>

          {/* Interactive Stat Grid / Visual Side */}
          <div id="hero-stats-container" className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative bg-[#FAF9F6]/30 border border-[#2D2D2D]/10 p-5 sm:p-8 grid grid-cols-2 gap-3 sm:gap-4">
              
              {/* Profile Card */}
              <div className="col-span-2 flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 border-l-2 border-[#C5A059] bg-white/90 hover:bg-white text-[#2D2D2D] shadow-xs text-left transition-colors duration-300">
                <img 
                  src={logoImg} 
                  alt="GAMZE TOSUN" 
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 sm:w-16 sm:h-16 object-contain bg-white border-2 border-[#C5A059] p-0.5 shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <h4 className="font-serif text-base sm:text-lg font-black uppercase text-[#2D2D2D] leading-none truncate">
                    GAMZE TOSUN
                  </h4>
                  <p className="text-[8px] sm:text-[9px] tracking-wider uppercase text-[#C5A059] font-extrabold mt-1 sm:mt-1.5 truncate">
                    EĞİTİM DANIŞMANLIĞI & ÖĞRENCİ KOÇLUĞU
                  </p>
                  
                  {/* Active Status & Live Visitor Counter */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
                    <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded-xs shrink-0">
                      <span className="w-1.5 h-1.5 bg-[#C5A059] rounded-full animate-ping" />
                      Aktif Danışmanlık
                    </div>
                    <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-xs shrink-0">
                      <span className="flex h-1.5 w-1.5 relative shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                      <span>{pageViews.totalViews > 0 ? pageViews.totalViews.toLocaleString('tr-TR') : '...'} Ziyaret</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Repeat */}
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
                  className="flex flex-col items-center justify-center text-center p-3.5 sm:p-4 bg-white/60 hover:bg-white border border-[#2D2D2D]/10 transition-colors duration-300 shadow-xs"
                >
                  <div className="p-2 bg-[#C5A059]/10 text-[#C5A059] mb-1.5 sm:mb-2">
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <span className="font-serif text-2xl sm:text-3xl text-[#2D2D2D] font-bold">
                    {stat.value}
                  </span>
                  <span className="text-[9px] sm:text-[10px] tracking-wider uppercase font-bold text-[#2D2D2D]/55 mt-1">
                    {stat.label}
                  </span>
                </motion.div>
              ))}

              <div className="col-span-2 text-center text-[8px] sm:text-[9px] tracking-wider uppercase text-[#2D2D2D]/45 font-bold pt-2 border-t border-[#2D2D2D]/5">
                * Son 8 yılın danışmanlık ve başarı istatistiklerinden derlenmiştir.
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
