import React, { useState, useMemo } from 'react';
import { 
  BarChart2, BookOpen, Clock, CheckCircle2, HelpCircle, AlertTriangle, 
  TrendingUp, Filter, Search, Award, Flame, Layers 
} from 'lucide-react';
import { DailyStudyLog, TopicCumulativeStat } from '../types';

interface TopicAnalyticsBarChartProps {
  logs: DailyStudyLog[];
  studentName?: string;
  studentClass?: string;
  title?: string;
}

export default function TopicAnalyticsBarChart({ 
  logs, 
  studentName, 
  studentClass, 
  title = "Konu Bazlı Kümülatif Çalışma & Soru Analizi" 
}: TopicAnalyticsBarChartProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'duration' | 'questions' | 'sessions' | 'accuracy' | 'recent'>('duration');
  const [activeViewMode, setActiveViewMode] = useState<'charts' | 'table'>('charts');

  // Compute cumulative statistics by topic from daily logs
  const topicStats: TopicCumulativeStat[] = useMemo(() => {
    const map = new Map<string, {
      subject: string;
      topic: string;
      sessionCount: number;
      totalDurationMinutes: number;
      totalQuestions: number;
      totalCorrect: number;
      totalWrong: number;
      totalEmpty: number;
      lastDate: string;
      lastTimestamp: number;
    }>();

    logs.forEach(log => {
      const subj = (log.subject || 'Genel').trim();
      const top = (log.topic || 'Genel Çalışma').trim();
      const key = `${subj}:::${top}`.toLowerCase();

      const duration = Number(log.studyDurationMinutes || 0);
      const questions = Number(log.solvedQuestions || 0);
      const correct = Number(log.correctCount || 0);
      const wrong = Number(log.wrongCount || 0);
      const empty = Number(log.emptyCount || 0);
      const logDate = log.date || '';

      const existing = map.get(key);
      if (existing) {
        existing.sessionCount += 1;
        existing.totalDurationMinutes += duration;
        existing.totalQuestions += questions;
        existing.totalCorrect += correct;
        existing.totalWrong += wrong;
        existing.totalEmpty += empty;
        // Check recent date
        existing.lastDate = logDate || existing.lastDate;
      } else {
        map.set(key, {
          subject: subj,
          topic: top,
          sessionCount: 1,
          totalDurationMinutes: duration,
          totalQuestions: questions,
          totalCorrect: correct,
          totalWrong: wrong,
          totalEmpty: empty,
          lastDate: logDate,
          lastTimestamp: Date.now()
        });
      }
    });

    const result: TopicCumulativeStat[] = [];
    map.forEach((val) => {
      const answered = val.totalCorrect + val.totalWrong;
      const accuracy = answered > 0 ? Math.round((val.totalCorrect / answered) * 100) : (val.totalQuestions > 0 ? 85 : 0);
      
      result.push({
        subject: val.subject,
        topic: val.topic,
        sessionCount: val.sessionCount,
        totalDurationMinutes: val.totalDurationMinutes,
        totalQuestions: val.totalQuestions,
        totalCorrect: val.totalCorrect,
        totalWrong: val.totalWrong,
        totalEmpty: val.totalEmpty,
        accuracyRate: accuracy,
        lastStudiedDate: val.lastDate
      });
    });

    return result;
  }, [logs]);

  // Extract distinct subjects for filter dropdown
  const subjectOptions = useMemo(() => {
    const set = new Set<string>();
    topicStats.forEach(t => set.add(t.subject));
    return Array.from(set).sort();
  }, [topicStats]);

  // Filter and sort stats
  const filteredStats = useMemo(() => {
    return topicStats
      .filter(stat => {
        if (selectedSubject !== 'all' && stat.subject !== selectedSubject) return false;
        if (searchTerm.trim() !== '') {
          const q = searchTerm.toLowerCase();
          return stat.topic.toLowerCase().includes(q) || stat.subject.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'duration') return b.totalDurationMinutes - a.totalDurationMinutes;
        if (sortBy === 'questions') return b.totalQuestions - a.totalQuestions;
        if (sortBy === 'sessions') return b.sessionCount - a.sessionCount;
        if (sortBy === 'accuracy') return b.accuracyRate - a.accuracyRate;
        return 0;
      });
  }, [topicStats, selectedSubject, searchTerm, sortBy]);

  // Max values for relative bar chart scaling
  const maxDuration = useMemo(() => {
    return Math.max(...filteredStats.map(s => s.totalDurationMinutes), 60);
  }, [filteredStats]);

  const maxQuestions = useMemo(() => {
    return Math.max(...filteredStats.map(s => s.totalQuestions), 50);
  }, [filteredStats]);

  // Overall summary metrics
  const totalStudyMinutes = useMemo(() => logs.reduce((acc, l) => acc + (Number(l.studyDurationMinutes) || 0), 0), [logs]);
  const totalSolvedQuestions = useMemo(() => logs.reduce((acc, l) => acc + (Number(l.solvedQuestions) || 0), 0), [logs]);
  const distinctTopicsCount = topicStats.length;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-sm space-y-6">
      
      {/* HEADER WITH TITLE & OVERVIEW CHIPS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 text-[#C5A059] rounded-lg">
              <BarChart2 className="w-5 h-5" />
            </span>
            <h3 className="font-serif font-black text-lg sm:text-xl text-slate-900">
              {title}
            </h3>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            {studentName ? `${studentName} için` : 'Öğrencinin'} bugüne kadar hangi konuyu kaç kez çalıştığı, toplam çalışma süresi ve çözülen soru dağılımı.
          </p>
        </div>

        {/* Global summary chips */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-slate-600">İşlenen Konu:</span>
            <span className="font-bold text-slate-900 font-mono">{distinctTopicsCount}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50/70 border border-amber-200/60 rounded-lg text-xs">
            <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="text-slate-600">Toplam Süre:</span>
            <span className="font-bold text-slate-900 font-mono">
              {Math.floor(totalStudyMinutes / 60)}s {totalStudyMinutes % 60}dk
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/70 border border-emerald-200/60 rounded-lg text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-600">Toplam Soru:</span>
            <span className="font-bold text-emerald-700 font-mono">
              {totalSolvedQuestions.toLocaleString('tr-TR')}
            </span>
          </div>
        </div>
      </div>

      {/* FILTERS & SEARCH TOOLBAR */}
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
        
        {/* Subject Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-white border border-stone-300 text-slate-800 text-xs sm:text-sm font-semibold rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
          >
            <option value="all">Tüm Dersler ({subjectOptions.length})</option>
            {subjectOptions.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Konu veya ders ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-stone-300 text-slate-800 text-xs sm:text-sm pl-8 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
          />
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden md:inline">Sırala:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-stone-300 text-slate-800 text-xs sm:text-sm font-semibold rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
          >
            <option value="duration">En Çok Süre (Saat/Dk)</option>
            <option value="questions">En Çok Soru Çözülen</option>
            <option value="sessions">En Çok Çalışılan (Seans)</option>
            <option value="accuracy">En Yüksek Doğruluk (%)</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex bg-stone-200/80 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveViewMode('charts')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              activeViewMode === 'charts'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sütun Grafiği
          </button>
          <button
            type="button"
            onClick={() => setActiveViewMode('table')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              activeViewMode === 'table'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tablo Görünümü
          </button>
        </div>
      </div>

      {/* NO DATA STATE */}
      {filteredStats.length === 0 && (
        <div className="text-center py-12 bg-stone-50 rounded-xl border border-dashed border-stone-300">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-60" />
          <p className="text-slate-600 text-sm font-medium">
            Seçilen kriterlere uygun konu çalışma kaydı bulunamadı.
          </p>
          <p className="text-slate-400 text-xs mt-1">
            Günlük çalışma eklendikçe burada konu bazlı süre ve soru sütun grafikleri otomatik oluşacaktır.
          </p>
        </div>
      )}

      {/* 1. SÜTUN GRAFİK GÖRÜNÜMÜ */}
      {filteredStats.length > 0 && activeViewMode === 'charts' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* COLUMN CHART 1: KONULARA GÖRE TOPLAM ÇALIŞMA SÜRESİ */}
            <div className="bg-stone-50/80 p-4 sm:p-5 rounded-xl border border-stone-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#C5A059]" />
                  <h4 className="font-bold text-sm text-slate-900">
                    Konulara Göre Çalışma Süresi (Dakika & Saat)
                  </h4>
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-500 bg-white px-2 py-0.5 rounded border border-stone-200">
                  {filteredStats.length} Konu
                </span>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {filteredStats.map((item, idx) => {
                  const durationPercent = Math.min(100, Math.max(6, (item.totalDurationMinutes / maxDuration) * 100));
                  const hours = Math.floor(item.totalDurationMinutes / 60);
                  const mins = item.totalDurationMinutes % 60;
                  
                  return (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-stone-200/80 shadow-2xs hover:border-[#C5A059] transition-all">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-bold text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded shrink-0">
                            {item.subject}
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-slate-800 truncate" title={item.topic}>
                            {item.topic}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                            {item.sessionCount} Kez Çalışıldı
                          </span>
                          <span className="font-mono font-bold text-xs text-slate-900">
                            {hours > 0 ? `${hours}s ` : ''}{mins} dk
                          </span>
                        </div>
                      </div>

                      {/* Bar Visualization */}
                      <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden flex">
                        <div 
                          className="h-full bg-gradient-to-r from-[#C5A059] to-amber-600 rounded-full transition-all duration-500"
                          style={{ width: `${durationPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLUMN CHART 2: KONULARA GÖRE ÇÖZÜLEN TOPLAM SORU & BAŞARI ORANI */}
            <div className="bg-stone-50/80 p-4 sm:p-5 rounded-xl border border-stone-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-sm text-slate-900">
                    Konulara Göre Çözülen Soru & Başarı
                  </h4>
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-500 bg-white px-2 py-0.5 rounded border border-stone-200">
                  {filteredStats.reduce((acc, c) => acc + c.totalQuestions, 0)} Toplam Soru
                </span>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {filteredStats.map((item, idx) => {
                  const questionsPercent = Math.min(100, Math.max(6, (item.totalQuestions / maxQuestions) * 100));
                  
                  return (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-stone-200/80 shadow-2xs hover:border-emerald-500 transition-all">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                            {item.subject}
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-slate-800 truncate" title={item.topic}>
                            {item.topic}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {item.totalCorrect > 0 && (
                            <span className="text-[10px] text-emerald-600 font-bold hidden sm:inline">
                              {item.totalCorrect}D {item.totalWrong}Y
                            </span>
                          )}
                          <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {item.totalQuestions} Soru
                          </span>
                        </div>
                      </div>

                      {/* Bar Visualization */}
                      <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden flex">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                          style={{ width: `${questionsPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 2. TABLO GÖRÜNÜMÜ */}
      {filteredStats.length > 0 && activeViewMode === 'table' && (
        <div className="overflow-x-auto border border-stone-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-stone-100 text-slate-700 uppercase font-bold tracking-wider text-[10px] border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Ders</th>
                <th className="py-3 px-4">Konu Adı</th>
                <th className="py-3 px-3 text-center">Çalışma Sayısı</th>
                <th className="py-3 px-3 text-center">Toplam Süre</th>
                <th className="py-3 px-3 text-center">Toplam Soru</th>
                <th className="py-3 px-3 text-center">Doğru / Yanlış</th>
                <th className="py-3 px-3 text-center">Başarı Oranı</th>
                <th className="py-3 px-4 text-right">Son Çalışma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-slate-800">
              {filteredStats.map((stat, idx) => {
                const hours = Math.floor(stat.totalDurationMinutes / 60);
                const mins = stat.totalDurationMinutes % 60;

                return (
                  <tr key={idx} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-600">
                      <span className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                        {stat.subject}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {stat.topic}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-full text-[11px]">
                        {stat.sessionCount} kez
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                      {hours > 0 ? `${hours}s ` : ''}{mins} dk
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                      {stat.totalQuestions}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-[11px]">
                      <span className="text-emerald-600 font-bold">{stat.totalCorrect} D</span>
                      {' / '}
                      <span className="text-rose-600 font-bold">{stat.totalWrong} Y</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        stat.accuracyRate >= 80 ? 'bg-emerald-100 text-emerald-800' :
                        stat.accuracyRate >= 60 ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        %{stat.accuracyRate}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 font-mono text-[11px]">
                      {stat.lastStudiedDate || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
