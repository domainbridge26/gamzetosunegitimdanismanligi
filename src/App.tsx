/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import InfoPosters from './components/InfoPosters';
import InteractiveTools from './components/InteractiveTools';
import About from './components/About';
import Testimonials from './components/Testimonials';
import ContactForm from './components/ContactForm';
import AdminPanel from './components/AdminPanel';
import LogoIcon from './components/LogoIcon';
import logoImg from './assets/images/gamze_tosun_logo_1783782272260.jpg';
import { 
  GraduationCap, Mail, Phone, ArrowUp, Instagram, 
  Linkedin, Calendar, Sparkles, BookOpen, Clock, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  const updateNotifCount = () => {
    let count = 0;
    try {
      const inqs = localStorage.getItem('gamze_inquiries');
      if (inqs) {
        const parsed = JSON.parse(inqs);
        count += parsed.filter((i: any) => i.status === 'Yeni').length;
      }
      const tests = localStorage.getItem('gamze_testimonials');
      if (tests) {
        const parsed = JSON.parse(tests);
        count += parsed.filter((t: any) => t.approved === false).length;
      }
    } catch (e) {
      console.error(e);
    }
    setNotifCount(count);
  };

  useEffect(() => {
    updateNotifCount();
    
    // Listen to custom events
    window.addEventListener('gamze-new-inquiry', updateNotifCount);
    window.addEventListener('gamze-new-testimonial', updateNotifCount);
    window.addEventListener('gamze-testimonials-updated', updateNotifCount);
    
    // Also listen to storage events
    window.addEventListener('storage', updateNotifCount);

    return () => {
      window.removeEventListener('gamze-new-inquiry', updateNotifCount);
      window.removeEventListener('gamze-new-testimonial', updateNotifCount);
      window.removeEventListener('gamze-testimonials-updated', updateNotifCount);
      window.removeEventListener('storage', updateNotifCount);
    };
  }, []);

  // Monitor scrolling to highlight Navbar items and show "back to top" button
  useEffect(() => {
    const handleScroll = () => {
      // Back to top visibility
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }

      // Detect active section on scroll
      const sections = ['hero', 'services', 'tools', 'about', 'testimonials', 'contact'];
      const scrollPosition = window.scrollY + 160; // offset

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden flex flex-col justify-between">
      
      {/* Navigation Bar */}
      <Navbar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        onOpenAdmin={() => setIsAdminOpen(true)}
        notifCount={notifCount}
      />

      {/* Main Content Sections */}
      <main className="flex-grow">
        
        {/* HERO SECTION */}
        <Hero 
          onExploreServices={() => scrollToSection('services')}
          onTryTools={() => scrollToSection('tools')}
        />

        {/* SERVICES SECTION */}
        <Services />

        {/* PROGRAM DETAILS & GUIDES (INFO POSTERS) */}
        <InfoPosters />

        {/* INTERACTIVE TOOLS */}
        <InteractiveTools />

        {/* ABOUT BIOGRAPHY */}
        <About />

        {/* SUCCESS STORIES */}
        <Testimonials />

        {/* CONTACT & BOOKING FORM */}
        <ContactForm />

      </main>

      {/* HIGH-END FOOTER */}
      <footer className="bg-slate-900 text-stone-200 pt-16 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 border-b border-slate-800 pb-12 text-left">
            
            {/* Branding Column (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-12 h-12 bg-white border border-[#2D2D2D]/10 rounded shadow-sm overflow-hidden p-0.5">
                  <img 
                    src={logoImg} 
                    alt="Gamze Tosun Logo" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif font-normal italic text-xl text-white tracking-tight leading-none uppercase">
                    Gamze Tosun
                  </span>
                  <span className="text-[10px] font-bold text-[#C5A059] tracking-widest uppercase mt-0.5">
                    Eğitim Danışmanlığı & Öğrenci Koçluğu
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Öğrenci koçluğu, YKS-LGS tercih danışmanlığı, hızlı okuma teknikleri ve bütünsel eğitim danışmanlığı ile öğrencilerin hayallerini geleceğe dönüştüren profesyonel rehberlik platformu.
              </p>
              
              {/* Contact mini links */}
              <div className="space-y-2 pt-2">
                <a href="https://www.instagram.com/gamzetosundanismanlikvekocluk" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-slate-300 hover:text-[#C5A059] transition-colors">
                  <Instagram className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>gamzetosundanışmanlıkvekoçluk</span>
                </a>
                <a href="mailto:gamzetosunegitimdanismanligi@gmail.com" className="flex items-center gap-2 text-xs text-slate-300 hover:text-[#C5A059] transition-colors">
                  <Mail className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>gamzetosunegitimdanismanligi@gmail.com</span>
                </a>
              </div>
            </div>

            {/* Quick Links Column (3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">Hızlı Bağlantılar</h4>
              <ul className="space-y-2 text-xs">
                {['Ana Sayfa', 'Hizmetlerimiz', 'İnteraktif Araçlar', 'Hakkımda', 'Başarı Hikayeleri', 'İletişim'].map((lbl, idx) => {
                  const ids = ['hero', 'services', 'tools', 'about', 'testimonials', 'contact'];
                  return (
                    <li key={idx}>
                      <button
                        onClick={() => scrollToSection(ids[idx])}
                        className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {lbl}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Services Bullet list Column (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">Çalışma Konularımız</h4>
              <ul className="space-y-2 text-xs">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                  <span className="text-slate-400">YKS Sınav Koçluğu & Haftalık Planlama</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                  <span className="text-slate-400">LGS Sınav Kampı & Motivasyon Çalışmaları</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                  <span className="text-slate-400">Okuduğunu Anlama Odaklı Hızlı Okuma</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                  <span className="text-slate-400">Bütünsel Veli-Öğrenci İletişim Koçluğu</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                  <span className="text-slate-400">Stratejik Lise ve Üniversite Tercihi</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Copyright and Legal row */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <span>
              &copy; {new Date().getFullYear()} Gamze Tosun Eğitim Danışmanlığı. Tüm Hakları Saklıdır.
            </span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-slate-300">Kullanım Koşulları</a>
              <a href="#" className="hover:text-slate-300">Gizlilik Politikası</a>
              <button 
                onClick={() => setIsAdminOpen(true)}
                className="hover:text-emerald-400 font-semibold cursor-pointer flex items-center gap-1.5 transition-colors group"
              >
                <span>Yönetici Paneli Girişi</span>
                {notifCount > 0 && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
                {notifCount > 0 && (
                  <span className="bg-rose-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-full leading-none group-hover:bg-rose-500 transition-colors">
                    {notifCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ADMIN PANEL DIALOG CONTAINER */}
      <AdminPanel 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
      />

      {/* FLOATING ACTION & BACK TO TOP BUTTONS */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-40 flex flex-col gap-2"
          >
            {/* Quick Whatsapp CTA */}
            <a
              href="https://wa.me/905051234567"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
              title="WhatsApp Destek Hattı"
            >
              <Phone className="w-5 h-5" />
            </a>

            {/* Back to top scroll button */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-slate-800"
              title="Yukarı Git"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
