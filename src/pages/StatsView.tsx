import React, { useMemo } from 'react';
import {
  Clock,
  TrendingUp,
  AlertTriangle,
  Award,
  Flame,
  CalendarCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useStudyStore } from '../store/useStudyStore';
import { generateLocalWeeklyReport } from '../lib/ai/weeklyReportEngine';
import { getCourseColor } from '../lib/storage';

export function StatsView() {
  const { tasks, settings, sessions, getStreak } = useStudyStore();

  const report = useMemo(() => {
    return generateLocalWeeklyReport(tasks, settings, sessions, new Date());
  }, [tasks, settings, sessions]);

  const streak = useMemo(() => {
    return getStreak();
  }, [sessions, getStreak]);

  // Son 7 günün günlük gerçekleşen vs hedef çalışma süresi
  const dailyChartData = useMemo(() => {
    return report.dailyComparison.map((d) => ({
      name: d.dayName,
      date: d.date,
      gerceklesen: d.actual,
      hedef: d.planned,
    }));
  }, [report]);

  // Ders dağılımı pasta grafik verisi
  const coursePieData = useMemo(() => {
    return report.courseBreakdown.map((item) => ({
      name: item.course,
      value: item.minutes,
      color: getCourseColor(item.course),
    }));
  }, [report]);

  // 8 Haftalık Trend Çizgisi
  const trendData = useMemo(() => {
    return report.eightWeekTrend.map((item) => ({
      hafta: item.weekLabel,
      saat: Number((item.minutes / 60).toFixed(1)),
      dakika: item.minutes,
    }));
  }, [report]);

  const totalHours = (report.actualMinutes / 60).toFixed(1);
  const plannedHours = (report.plannedMinutes / 60).toFixed(1);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-theme)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Akademik Performans & Analiz Paneli
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Ders dağılımlarınız, 8 haftalık çalışma trendiniz, seri takibiniz ve erken bitirme metrikleriniz.
          </p>
        </div>
      </div>

      {/* 6 Temel Metrik Kartı */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* 1. Bu Hafta Toplam Çalışma */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Bu Hafta Toplam</span>
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-[var(--text-primary)]">
            {totalHours} saat
          </div>
          <p className="text-[11px] text-[var(--text-muted)] font-mono tabular-nums">
            Hedef: {plannedHours} saat
          </p>
        </div>

        {/* 2. Çalışma Serisi (Streak) */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <Flame className="w-3.5 h-3.5 text-[var(--accent)] fill-[var(--accent)]" />
            <span>Çalışma Serisi</span>
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-[var(--accent)]">
            {streak.currentStreak} Gün
          </div>
          <p className="text-[11px] text-[var(--text-muted)] font-mono tabular-nums">
            En Uzun: {streak.longestStreak} Gün
          </p>
        </div>

        {/* 3. Erken Bitirme Ortalaması */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Erken Bitirme</span>
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-600">
            {report.avgEarlyCompletionDays} Gün
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">Teslimden önce</p>
        </div>

        {/* 4. Plan Başarı Yüzdesi */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <TrendingUp className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Plan Başarı Oranı</span>
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-[var(--accent)]">
            %{report.completionRatePercent}
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">Haftalık hedefe göre</p>
        </div>

        {/* 5. En Çok Çalışılan Ders */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <Award className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>En Çok Odaklanılan</span>
          </div>
          <div className="text-sm font-bold text-[var(--text-primary)] truncate">
            {report.mostStudiedCourse ? report.mostStudiedCourse.name : '—'}
          </div>
          <p className="text-[11px] text-[var(--text-muted)] font-mono tabular-nums">
            {report.mostStudiedCourse ? `${report.mostStudiedCourse.minutes} dk` : 'Kayıt yok'}
          </p>
        </div>

        {/* 6. En Riskli Ders */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>En Riskli Ders</span>
          </div>
          <div className="text-sm font-bold text-rose-500 truncate">
            {report.mostDelayedCourse ? report.mostDelayedCourse.name : 'Dengeli'}
          </div>
          <p className="text-[11px] text-[var(--text-muted)] font-mono tabular-nums">
            {report.mostDelayedCourse ? `Risk: ${report.mostDelayedCourse.riskScore}/100` : 'Tüm teslimler rahat'}
          </p>
        </div>
      </div>

      {/* Grafikler 1. Satır: Günlük Süre ve Ders Dağılımı Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Günlük Çalışma Grafiği (Bar Chart) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Son 7 Günlük Çalışma Süresi (Dakika)
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <span className="w-2.5 h-2.5 rounded-xs bg-[var(--accent)] inline-block" />
                Gerçekleşen
              </span>
              <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                <span className="w-2.5 h-2.5 rounded-xs bg-[var(--border-theme)] inline-block" />
                Hedef Kapasite
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#849694" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#849694" fontSize={11} tickLine={false} axisLine={false} unit=" dk" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-card)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                  }}
                  cursor={{ fill: 'rgba(241, 180, 92, 0.08)' }}
                />
                <Bar dataKey="hedef" fill="var(--border-theme)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="gerceklesen" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ders Dağılımı Donut / Pie Chart */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            Ders Bazlı Süre Dağılımı
          </h3>

          {coursePieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-[var(--text-muted)]">
              Henüz tamamlanan çalışma kaydı yok.
            </div>
          ) : (
            <>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={coursePieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {coursePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [`${val} dk`, 'Süre']}
                      contentStyle={{
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border-card)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[var(--border-theme)] text-xs max-h-32 overflow-y-auto">
                {report.courseBreakdown.map((item) => (
                  <div key={item.course} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: getCourseColor(item.course) }}
                      />
                      <span className="font-semibold text-[var(--text-primary)] truncate max-w-[130px]">
                        {item.course}
                      </span>
                    </div>
                    <span className="font-mono tabular-nums text-[var(--text-muted)]">
                      %{item.percentage} ({item.minutes} dk)
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Grafikler 2. Satır: Son 8 Haftalık Trend Çizgisi */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-3">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            Son 8 Haftalık Çalışma Trendi (Saat)
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Dönem boyunca çalışma ritminizin ve haftalık toplam saatlerinizin seyri.
          </p>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <XAxis dataKey="hafta" stroke="#849694" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#849694" fontSize={11} tickLine={false} axisLine={false} unit=" s" />
              <Tooltip
                formatter={(val) => [`${val} saat`, 'Çalışma']}
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-card)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                }}
              />
              <Line
                type="monotone"
                dataKey="saat"
                stroke="var(--accent)"
                strokeWidth={3}
                dot={{ fill: 'var(--accent)', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
