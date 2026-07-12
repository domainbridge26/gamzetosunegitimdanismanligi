import React, { useState, useEffect } from 'react';
import { Menu, X, Settings, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import logoImg from '../assets/images/gamze_tosun_logo_1783782272260.jpg';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onOpenAdmin: () => void;
  notifCount?: number;
}

export default function Navbar({ activeSection, setActiveSection, onOpenAdmin, notifCount = 0 }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'hero', label: 'Ana Sayfa' },
    { id: 'services', label: 'Hizmetlerimiz' },
    { id: 'tools', label: 'İnteraktif Araçlar' },
    { id: 'about', label: 'Hakkımda' },
    { id: 'testimonials', label: 'Başarı Hikayeleri' },
    { id: 'contact', label: 'İletişim' },
  ];

  const handleNavClick = (id: string) => {
    setIsOpen(false);
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
    <header 
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#2D2D2D]/10 py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            id="nav-logo"
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleNavClick('hero')}
          >
            <div className="flex items-center justify-center w-11 h-11 bg-white border border-[#2D2D2D]/10 rounded shadow-sm overflow-hidden group-hover:border-[#C5A059] transition-colors duration-300">
              <img 
                src={logoImg} 
                alt="Gamze Tosun Logo" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="font-serif text-xl sm:text-2xl font-normal italic uppercase tracking-tight text-[#2D2D2D] leading-none">
                Gamze Tosun
              </h1>
              <span className="text-[9px] font-bold text-[#C5A059] tracking-[0.2em] uppercase mt-1">
                Eğitim Danışmanlığı & Öğrenci Koçluğu
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav id="desktop-nav" className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-2 text-[11px] font-semibold tracking-widest uppercase transition-all duration-300 relative ${
                  activeSection === item.id 
                    ? 'text-[#C5A059]' 
                    : 'text-[#2D2D2D]/70 hover:text-[#2D2D2D]'
                }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#C5A059]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Right actions (Admin Portal + CTA) */}
          <div id="nav-actions" className="hidden lg:flex items-center gap-4">
            <button
              id="btn-admin-portal"
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-2 border border-[#2D2D2D]/20 text-[10px] font-bold uppercase tracking-widest text-[#2D2D2D]/60 hover:text-[#2D2D2D] hover:bg-[#2D2D2D]/5 transition-colors cursor-pointer relative"
              title="Yönetici Paneli"
            >
              <User className="w-3.5 h-3.5" />
              <span>Yönetici Girişi</span>
              {notifCount > 0 && (
                <span className="flex items-center gap-1 ml-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  <span className="bg-rose-600 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-full leading-none">
                    {notifCount}
                  </span>
                </span>
              )}
            </button>
            <button
              id="btn-quick-consult"
              onClick={() => handleNavClick('contact')}
              className="bg-[#2D2D2D] hover:bg-[#C5A059] text-[#FAF9F6] px-6 py-3 text-[11px] font-bold uppercase tracking-widest transition-all duration-300"
            >
              Ücretsiz Ön Görüşme
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onOpenAdmin}
              className="p-1.5 text-[#2D2D2D]/60 hover:text-[#C5A059] hover:bg-[#2D2D2D]/5 border border-[#2D2D2D]/20 relative"
              title="Yönetici Paneli"
            >
              <User className="w-4 h-4" />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-[#2D2D2D] hover:bg-[#2D2D2D]/5 focus:outline-none transition-colors border border-[#2D2D2D]/20"
              aria-label="Menüyü Aç/Kapat"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden bg-[#FAF9F6] border-b border-[#2D2D2D]/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  id={`mobile-nav-item-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`block w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                    activeSection === item.id
                      ? 'text-[#C5A059] border-l-2 border-[#C5A059]'
                      : 'text-[#2D2D2D]/70 hover:bg-[#2D2D2D]/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-4 border-t border-[#2D2D2D]/10 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenAdmin();
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#2D2D2D]/70 bg-[#2D2D2D]/5 hover:bg-[#2D2D2D]/10 transition-colors relative"
                >
                  <Settings className="w-4 h-4 text-[#C5A059]" />
                  <span>Yönetici Girişi</span>
                  {notifCount > 0 && (
                    <span className="flex items-center gap-1.5 ml-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                      <span className="bg-rose-600 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-full leading-none">
                        {notifCount}
                      </span>
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleNavClick('contact')}
                  className="w-full text-center px-4 py-3.5 bg-[#2D2D2D] text-[#FAF9F6] text-xs font-bold uppercase tracking-widest hover:bg-[#C5A059] transition-all"
                >
                  Ücretsiz Ön Görüşme Yap
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
