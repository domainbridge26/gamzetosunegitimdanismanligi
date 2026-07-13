import React from 'react';
import { ArrowRight, Sparkles, BookOpen, GraduationCap, Compass, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import logoImg from '../assets/images/gamze_tosun_main_logo_1783784317486.jpg';

interface HeroProps {
  onExploreServices: () => void;
  onTryTools: () => void;
}

export default function Hero({ onExploreServices, onTryTools }: HeroProps) {
  const stats = [
    { value: '8+', label: 'Yıl Deneyim', icon: Trophy, color: 'text-amber-600 bg-amber-50' },
    { value: '1.500+', label: 'Başarılı Öğrenci', icon: GraduationCap, color: 'text-emerald-600 bg-emerald-50' },
    { value: '3 Kat', label: 'Ort. Okuma Hızı', icon: BookOpen, color: 'text-teal-600 bg-teal-50' },
    { value: '%98', label: 'Memnuniyet', icon: Compass, color: 'text-sky-600 bg-sky-50' },
  ];

  return (
    <section 
      id="hero" 
      className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-[#FAF9F6]"
    >
      {/* Decorative Editorial Background Accent (subtle grid/border lines rather than heavy blobs) */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[#2D2D2D]/5" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[#2D2D2D]/5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Text and Description */}
          <div id="hero-text-container" className="lg:col-span-7 flex flex-col items-start">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[12px] font-bold tracking-[0.3em] uppercase text-[#C5A059] mb-4 text-left"
            >
              <span>Akademik Başarı Stratejileri</span>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-6xl sm:text-7xl lg:text-8xl font-serif font-black leading-[0.95] tracking-tighter mb-8 text-[#2D2D2D] text-left"
            >
              Potansiyelini <br />
              <span className="italic font-normal">Geleceğe</span> Dönüştür.
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg leading-relaxed opacity-80 max-w-lg mb-4 text-left"
            >
              YKS ve LGS süreçlerinde profesyonel rehberlik, bireysel öğrenci koçluğu, hızlı okuma teknikleri ve bütünsel eğitim danışmanlığı ile akademik yolculuğunuzda yanınızdayız.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="border-l-2 border-[#C5A059] pl-4 py-1 mb-8 text-left"
            >
              <p className="font-serif italic text-base text-[#2D2D2D]/90 font-medium">
                "Potansiyelini keşfet, hedeflerine emin adımlarla ilerle."
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pb-8"
            >
              <button
                id="hero-cta-primary"
                onClick={onTryTools}
                className="bg-[#2D2D2D] text-[#FAF9F6] px-10 py-4 text-[12px] font-bold uppercase tracking-widest hover:bg-[#C5A059] transition-all duration-300 cursor-pointer text-center"
              >
                Ücretsiz Ön Görüşme
              </button>
              
              <button
                id="hero-cta-secondary"
                onClick={onExploreServices}
                className="border border-[#2D2D2D] text-[#2D2D2D] px-10 py-4 text-[12px] font-bold uppercase tracking-widest hover:bg-[#2D2D2D]/5 transition-all duration-300 text-center cursor-pointer"
              >
                Programları Keşfet
              </button>
            </motion.div>
            
            {/* Quick Trust badges */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-6 border-t border-[#2D2D2D]/10 w-full"
            >
              <span className="text-[10px] font-bold text-[#2D2D2D]/50 uppercase tracking-widest">Hizmet Alanları:</span>
              <span className="text-[10px] font-bold text-[#2D2D2D]/70 tracking-wider uppercase border border-[#2D2D2D]/10 px-2.5 py-1">Bireysel Koçluk</span>
              <span className="text-[10px] font-bold text-[#2D2D2D]/70 tracking-wider uppercase border border-[#2D2D2D]/10 px-2.5 py-1">YKS & LGS</span>
              <span className="text-[10px] font-bold text-[#2D2D2D]/70 tracking-wider uppercase border border-[#2D2D2D]/10 px-2.5 py-1">Hızlı Okuma</span>
              <span className="text-[10px] font-bold text-[#2D2D2D]/70 tracking-wider uppercase border border-[#2D2D2D]/10 px-2.5 py-1">Tercih Analizi</span>
            </motion.div>
          </div>

          {/* Interactive Stat Grid / Visual Side */}
          <div id="hero-stats-container" className="lg:col-span-5 relative mt-6 lg:mt-0">
            <div className="relative bg-[#FAF9F6]/30 border border-[#2D2D2D]/10 p-6 sm:p-8 grid grid-cols-2 gap-4">
              
              {/* Profile Card */}
              <div className="col-span-2 flex items-center gap-4 p-4 border-l-2 border-[#C5A059] bg-white/80 hover:bg-white text-[#2D2D2D] shadow-sm text-left transition-colors duration-300">
                <img 
                  src={logoImg} 
                  alt="GAMZE TOSUN" 
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 object-contain bg-white border-2 border-[#C5A059] p-0.5"
                />
                <div className="flex flex-col">
                  <h4 className="font-serif text-lg font-black uppercase text-[#2D2D2D] leading-none">GAMZE TOSUN</h4>
                  <p className="text-[9px] tracking-wider uppercase text-[#C5A059] font-extrabold mt-1.5">EĞİTİM DANIŞMANLIĞI & ÖĞRENCİ KOÇLUĞU</p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[9px] font-bold uppercase tracking-widest text-[#C5A059] bg-[#C5A059]/10 px-2.5 py-1 w-max">
                    <span className="w-1 h-1 bg-[#C5A059] rounded-full animate-ping" />
                    Aktif Danışmanlık Açık
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
                  className="flex flex-col items-center justify-center text-center p-4 bg-white/30 hover:bg-white border border-[#2D2D2D]/10 transition-colors duration-300"
                >
                  <div className="p-2 bg-[#C5A059]/10 text-[#C5A059] mb-2">
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <span className="font-serif text-2xl sm:text-3xl text-[#2D2D2D]">
                    {stat.value}
                  </span>
                  <span className="text-[10px] tracking-wider uppercase font-bold text-[#2D2D2D]/50 mt-1">
                    {stat.label}
                  </span>
                </motion.div>
              ))}

              <div className="col-span-2 text-center text-[9px] tracking-wider uppercase text-[#2D2D2D]/40 font-bold pt-2 border-t border-[#2D2D2D]/5">
                * Son 8 yılın danışmanlık başarı istatistiklerinden derlenmiştir.
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
