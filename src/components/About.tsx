import React from 'react';
import { CheckCircle2, Award, Heart, ShieldCheck, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import logoImg from '../assets/images/gamze_tosun_main_logo_1783784317486.jpg';

export default function About() {
  const values = [
    {
      title: 'Bireysel Farklılıklara Saygı',
      desc: 'Her öğrenci benzersiz bir zihinsel yapıya sahiptir. Şablon programlar yerine, tamamen kişiye özel çalışma modeli kurguluyoruz.',
      icon: UserCheck,
      color: 'text-emerald-700 bg-emerald-50'
    },
    {
      title: 'Bilimsel ve Takip Odaklı Yaklaşım',
      desc: 'Başarıyı tesadüflere bırakmıyoruz. Haftalık veri takipleri, deneme grafik analizleri ve net sayılar üzerinden strateji geliştiriyoruz.',
      icon: Award,
      color: 'text-amber-700 bg-amber-50'
    },
    {
      title: 'Kesintisiz Veli Güven Köprüsü',
      desc: 'Eğitim sürecinde ailenin rolü çok büyüktür. Velilerimizle sürekli iletişim kurarak evdeki huzur ve çalışma disiplini dengesini sağlıyoruz.',
      icon: ShieldCheck,
      color: 'text-teal-700 bg-teal-50'
    },
    {
      title: 'Empati ve Duygusal Destek',
      desc: 'Öğrencilerimizle sadece ders başarısına odaklanmıyor; kaygı, sınav stresi ve erteleme alışkanlıkları gibi psikolojik süreçleri de koçlukla yönetiyoruz.',
      icon: Heart,
      color: 'text-sky-700 bg-sky-50'
    }
  ];

  return (
    <section id="about" className="py-20 bg-stone-100/30 border-t border-stone-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Profile Picture & Highlights (Left) */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/10 to-amber-600/10 rounded-3xl filter blur-xl transform rotate-3" />
            
            <div className="relative border border-[#2D2D2D]/10 bg-white p-6 shadow-xl space-y-6">
              <img 
                src={logoImg} 
                alt="Gamze Tosun Eğitim Danışmanı" 
                referrerPolicy="no-referrer"
                className="w-full aspect-square object-contain bg-white border border-stone-100 p-2"
              />
              
              <div className="space-y-3 text-left">
                <h4 className="font-serif font-bold text-[#2D2D2D] text-lg">Gamze Tosun kimdir?</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Uzun yıllardır eğitim danışmanlığı, profesyonel öğrenci koçluğu, YKS-LGS tercih uzmanlığı ve hızlı okuma teknikleri eğitmenliği yapmaktadır. Temel vizyonu, sınav maratonunda kaybolan gençleri en doğru rotaya sokmaktır.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[10px] font-bold bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 px-2.5 py-1">Profesyonel Koç</span>
                  <span className="text-[10px] font-bold bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 px-2.5 py-1">Hızlı Okuma Eğitmeni</span>
                  <span className="text-[10px] font-bold bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 px-2.5 py-1">Tercih Danışmanı</span>
                </div>
              </div>
            </div>
          </div>

          {/* Biography and Philosophy (Right) */}
          <div className="lg:col-span-7 space-y-8 flex flex-col items-start text-left">
            <div className="space-y-4">
              <span className="text-xs font-bold text-emerald-700 tracking-widest uppercase bg-emerald-100/60 px-3 py-1 rounded-full">
                Hakkımda ve Değerlerim
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D2D2D] tracking-tight">
                Geleceğe Güvenle Yürüyen Nesiller Yetiştiriyoruz
              </h2>
              <div className="border-l-2 border-[#C5A059] pl-4 py-1">
                <p className="font-serif italic text-base text-[#C5A059] font-medium">
                  "Başarı tesadüf değil, doğru rehberliğin sonucudur."
                </p>
              </div>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                Her sene binlerce öğrenci YKS ve LGS maratonuna giriyor; ancak sadece çok ders çalışanlar değil, <strong>doğru ve stratejik çalışanlar</strong> hak ettikleri okulları kazanıyor. Eğitim danışmanlığı ve öğrenci koçluğu süreçlerimizde, öğrencilerimize ders planı hazırlamanın çok ötesinde, hayat boyu kullanabilecekleri <strong>öğrenmeyi öğrenme</strong> yeteneğini ve zaman yönetimini kazandırıyoruz.
              </p>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              {values.map((val, idx) => (
                <div key={idx} className="bg-white border border-stone-200/60 p-5 rounded-2xl shadow-sm space-y-3">
                  <div className={`p-2 rounded-xl w-max ${val.color}`}>
                    <val.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-display font-bold text-slate-900 text-sm">
                    {val.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {val.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
