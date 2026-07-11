import React, { useState } from 'react';
import { TESTIMONIALS_DATA } from '../data';
import { Star, GraduationCap, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Testimonials() {
  const [filter, setFilter] = useState<'Tümü' | 'Öğrenci' | 'Veli'>('Tümü');

  const filteredData = TESTIMONIALS_DATA.filter((item) => {
    if (filter === 'Tümü') return true;
    return item.role === filter;
  });

  return (
    <section id="testimonials" className="py-20 bg-stone-50 border-t border-stone-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="text-xs font-bold text-emerald-700 tracking-widest uppercase bg-emerald-100/60 px-3 py-1 rounded-full">
            Gurur Tablomuz
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
            Veli ve Öğrencilerimizin Başarı Hikayeleri
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Gamze Tosun koçluğunda hayallerini gerçeğe dönüştüren, sınav kaygısını aşarak başarı basamaklarını tırmanan bazı öğrencilerimizin ve velilerimizin içten yorumları.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-2 mb-10">
          {(['Tümü', 'Öğrenci', 'Veli'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
                filter === role
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-md'
                  : 'bg-white text-slate-600 border-stone-200 hover:border-stone-300'
              }`}
            >
              {role === 'Tümü' ? 'Tüm Yorumlar' : `${role} Yorumları`}
            </button>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredData.map((test, idx) => (
              <motion.div
                key={test.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35 }}
                className="bg-white border border-stone-200/80 p-6 sm:p-8 rounded-3xl shadow-md flex flex-col justify-between text-left relative overflow-hidden group hover:shadow-lg transition-shadow"
              >
                {/* Visual quote accent */}
                <Quote className="absolute right-6 top-6 w-16 h-16 text-emerald-50 opacity-40 group-hover:scale-110 transition-transform" />

                <div className="space-y-4 relative">
                  {/* Stars */}
                  <div className="flex gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed italic">
                    "{test.comment}"
                  </p>
                </div>

                {/* Profile detail */}
                <div className="flex items-center gap-4 mt-6 border-t border-stone-100 pt-4 relative">
                  <img
                    src={test.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={test.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover border border-stone-200 bg-stone-50 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-bold text-slate-900 text-sm truncate">
                      {test.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {test.role}
                      </span>
                      {test.examType && (
                        <span className="text-[10px] font-semibold text-slate-500 bg-stone-100 px-2 py-0.5 rounded-md">
                          {test.examType}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Achievement badge */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{test.achievement}</span>
                    </div>
                  </div>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
