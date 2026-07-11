import React, { useState } from 'react';
import { SERVICES_DATA } from '../data';
import { Compass, GraduationCap, Award, BookOpen, Check, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Map icon strings to Lucide components
const iconMap: { [key: string]: React.ComponentType<any> } = {
  Compass,
  GraduationCap,
  Award,
  BookOpen
};

export default function Services() {
  const [selectedId, setSelectedId] = useState(SERVICES_DATA[0].id);
  const activeService = SERVICES_DATA.find(s => s.id === selectedId) || SERVICES_DATA[0];
  const ActiveIcon = iconMap[activeService.iconName] || GraduationCap;

  return (
    <section id="services" className="py-20 bg-[#FAF9F6] border-y border-[#2D2D2D]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-5">
          <span className="text-[12px] font-bold tracking-[0.3em] uppercase text-[#C5A059] block">
            Neler Yapıyoruz?
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#2D2D2D] tracking-tight">
            Uzmanlık Alanlarımız ve Profesyonel Hizmetler
          </h2>
          <div className="inline-block border-y border-[#C5A059]/30 py-2.5 px-6 my-2">
            <p className="font-serif italic text-lg sm:text-xl text-[#2D2D2D] font-medium tracking-wide">
              "Hayalini hedefe, hedefini başarıya dönüştür."
            </p>
          </div>
          <p className="text-[#2D2D2D]/80 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Eğitim yolculuğunun her durağında öğrenciye güven, veliye huzur ve hedefe netlik kazandıran bilimsel, takip odaklı ve modern metotlar uyguluyoruz.
          </p>
        </div>

        {/* Dynamic Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Navigation Sidebar (Left) */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-[10px] font-bold text-[#2D2D2D]/50 uppercase tracking-widest block mb-1 px-1">Hizmet Seçimi:</span>
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 gap-2 no-scrollbar">
              {SERVICES_DATA.map((service) => {
                const IconComponent = iconMap[service.iconName] || GraduationCap;
                const isSelected = service.id === selectedId;
                return (
                  <button
                    key={service.id}
                    onClick={() => setSelectedId(service.id)}
                    className={`flex items-center gap-3.5 px-4 py-3.5 text-left border transition-all duration-300 whitespace-nowrap lg:whitespace-normal w-full shrink-0 lg:shrink cursor-pointer rounded-none ${
                      isSelected
                        ? 'border-l-2 border-l-[#C5A059] bg-white text-[#2D2D2D] border-y border-r border-[#2D2D2D]/10 scale-[1.01]'
                        : 'border-l-2 border-l-[#2D2D2D]/10 bg-white/40 text-[#2D2D2D]/80 border-y border-r border-[#2D2D2D]/10 hover:bg-white hover:text-[#2D2D2D]'
                    }`}
                  >
                    <div className={`p-2 rounded-none shrink-0 transition-colors ${
                      isSelected ? 'bg-[#C5A059]/10 text-[#C5A059]' : 'bg-[#2D2D2D]/5 text-[#2D2D2D]/60'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-serif text-sm font-normal italic text-[#2D2D2D] leading-tight">{service.title}</span>
                      <span className={`text-[10px] tracking-wide truncate max-w-[200px] mt-0.5 ${isSelected ? 'text-[#C5A059]' : 'text-[#2D2D2D]/50'}`}>
                        {service.shortDesc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* CTA under navigation */}
            <div className="hidden lg:block border border-[#2D2D2D]/10 bg-white/50 p-6 rounded-none mt-6">
              <h4 className="font-serif italic text-[#2D2D2D] text-sm flex items-center gap-1.5 mb-2">
                <Sparkles className="w-4 h-4 text-[#C5A059]" />
                Hangisi Size Uygun?
              </h4>
              <p className="text-xs text-[#2D2D2D]/70 leading-relaxed mb-4">
                Öğrencinizin hangi alanda desteğe ihtiyacı olduğunu kestiremiyor musunuz? Ücretsiz ön değerlendirme seansıyla seviye ve ihtiyaç analizi yapabiliriz.
              </p>
              <button 
                onClick={() => {
                  const el = document.getElementById('contact');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-3 bg-[#2D2D2D] hover:bg-[#C5A059] text-[#FAF9F6] font-bold text-[10px] uppercase tracking-widest rounded-none transition-all flex items-center justify-center gap-1.5"
              >
                <span>Ücretsiz Analiz Alın</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Service Details Card (Right) */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedId}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.35 }}
                className="bg-white/50 border border-[#2D2D2D]/10 p-6 sm:p-10 rounded-none flex flex-col space-y-8"
              >
                {/* Detail Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D2D2D]/10 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-[#C5A059]/10 rounded-none text-[#C5A059]">
                      <ActiveIcon className="w-7 h-7" />
                    </div>
                    <div className="flex flex-col text-left">
                      <h3 className="font-serif text-2xl text-[#2D2D2D]">
                        {activeService.title}
                      </h3>
                      <p className="text-[10px] text-[#C5A059] font-bold uppercase tracking-widest mt-1">
                        Gamze Tosun Eğitim Hizmetleri
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const el = document.getElementById('contact');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="self-start sm:self-center px-4 py-2.5 border border-[#2D2D2D] text-[#2D2D2D] hover:bg-[#2D2D2D]/5 font-bold text-[10px] uppercase tracking-widest rounded-none transition-all"
                  >
                    Bilgi & Kayıt Al
                  </button>
                </div>

                {/* Description */}
                <div className="text-left space-y-4">
                  <p className="text-[#2D2D2D]/80 text-sm sm:text-base leading-relaxed">
                    {activeService.longDesc}
                  </p>
                </div>

                {/* Split Features and Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                  
                  {/* Features List */}
                  <div className="flex flex-col text-left space-y-4">
                    <h4 className="font-serif italic text-[#2D2D2D] text-sm uppercase tracking-wider border-b border-[#2D2D2D]/10 pb-2">
                      Eğitim Kapsamı ve Detaylar
                    </h4>
                    <ul className="space-y-3">
                      {activeService.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-[#2D2D2D]/80">
                          <span className="p-0.5 bg-[#C5A059]/10 text-[#C5A059] mt-0.5 shrink-0 rounded-none">
                            <Check className="w-3 h-3" />
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Benefits List */}
                  <div className="flex flex-col text-left space-y-4">
                    <h4 className="font-serif italic text-[#2D2D2D] text-sm uppercase tracking-wider border-b border-[#2D2D2D]/10 pb-2">
                      Öğrenciye ve Aileye Kazanımları
                    </h4>
                    <ul className="space-y-3">
                      {activeService.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-[#2D2D2D]/80">
                          <span className="p-0.5 bg-[#2D2D2D]/10 text-[#2D2D2D] mt-0.5 shrink-0 rounded-none">
                            <Check className="w-3 h-3" />
                          </span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
