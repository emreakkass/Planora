import React, { useState, useMemo } from 'react';
import {
  CalendarRange,
  Clock,
  Play,
  Download,
} from 'lucide-react';
import { useStudyStore } from '../store/useStudyStore';
import { generateStudyPlan } from '../lib/planner/planEngine';
import { OvercapacityAlert } from '../components/common/OvercapacityAlert';
import { downloadICalendarFile } from '../lib/calendar/icsGenerator';

export function PlannerView() {
  const { tasks, settings, schedule, setSelectedTaskIdForPomodoro, setActiveTab } = useStudyStore();
  const [rangeDays, setRangeDays] = useState<7 | 14>(7);

  const planResult = useMemo(() => {
    return generateStudyPlan(tasks, settings, schedule, new Date(), rangeDays);
  }, [tasks, settings, schedule, rangeDays]);

  const { days, overcapacityTasks, totalBacklogMinutes } = planResult;

  const handleStartTask = (taskId: string) => {
    setSelectedTaskIdForPomodoro(taskId);
    setActiveTab('pomodoro');
  };

  const handleExportCalendar = () => {
    downloadICalendarFile(planResult.days, schedule, settings.termStartDate);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Üst Başlık & Zaman Aralığı */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-theme)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
            <CalendarRange className="w-3.5 h-3.5" />
            <span>Deterministik Planlayıcı</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
            Çalışma Takvimi & Kapasite Dağıtımı
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Kalan iş yükünüz teslim tarihlerine göre otomatik olarak ders programı boşluklarına paylaştırılır.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCalendar}
            className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Takvime Aktar (.ics)</span>
          </button>

          <div className="flex items-center p-1 bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-xl">
            <button
              onClick={() => setRangeDays(7)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                rangeDays === 7
                  ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              7 Günlük Plan
            </button>
            <button
              onClick={() => setRangeDays(14)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                rangeDays === 14
                  ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              14 Günlük Plan
            </button>
          </div>
        </div>
      </div>

      {/* Kapasite Aşımı Bildirimi */}
      {overcapacityTasks.length > 0 && (
        <OvercapacityAlert
          tasks={overcapacityTasks}
          onOpenSettings={() => setActiveTab('settings')}
        />
      )}

      {/* Plan Özet İstatistiği */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs">
          <span className="text-[11px] text-[var(--text-muted)] block font-medium">
            Toplam Kalan İş Yükü
          </span>
          <span className="text-xl font-bold font-mono tabular-nums text-[var(--text-primary)]">
            {totalBacklogMinutes} dk ({(totalBacklogMinutes / 60).toFixed(1)} saat)
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs">
          <span className="text-[11px] text-[var(--text-muted)] block font-medium">
            Haftalık Toplam Kapasite
          </span>
          <span className="text-xl font-bold font-mono tabular-nums text-[var(--accent)]">
            {settings.weekdayMinutes * 5 + settings.weekendMinutes * 2} dk (
            {((settings.weekdayMinutes * 5 + settings.weekendMinutes * 2) / 60).toFixed(1)} saat)
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs">
          <span className="text-[11px] text-[var(--text-muted)] block font-medium">
            Riskli / Acil Görevler
          </span>
          <span className="text-xl font-bold font-mono tabular-nums text-rose-500">
            {overcapacityTasks.length} Kritik Görev
          </span>
        </div>
      </div>

      {/* Gün Gün Dağıtılmış Plan Listesi */}
      <div className="space-y-4">
        {days.map((day) => {
          const occupancyRate =
            day.capacityMinutes > 0
              ? Math.min(100, Math.round((day.totalAllocatedMinutes / day.capacityMinutes) * 100))
              : 0;

          return (
            <div
              key={day.date}
              className={`p-3.5 sm:p-5 rounded-2xl bg-[var(--bg-card)] border transition-all shadow-xs ${
                day.isToday
                  ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/20'
                  : 'border-[var(--border-card)]'
              }`}
            >
              {/* Gün Başlığı ve Kapasite */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-theme)]">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize ${
                      day.isToday
                        ? 'bg-[var(--accent)] text-[#182524]'
                        : day.isWeekend
                        ? 'bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30'
                        : 'bg-[var(--bg-page)] text-[var(--text-secondary)] border border-[var(--border-theme)]'
                    }`}
                  >
                    {day.isToday ? 'Bugün' : day.dayName}
                  </div>
                  <span className="text-sm font-bold text-[var(--text-primary)] font-mono tabular-nums">
                    {day.date}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    ({day.isWeekend ? 'Hafta Sonu: 4s' : 'Hafta İçi: 2s'})
                  </span>
                </div>

                {/* Kapasite Özeti */}
                <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
                  <span className="text-[var(--text-muted)]">
                    Planlanan: <strong className="text-[var(--text-primary)]">{day.totalAllocatedMinutes}</strong> / {day.capacityMinutes} dk
                  </span>
                  <span className="text-[var(--border-theme)]">·</span>
                  <span
                    className={`font-semibold ${
                      occupancyRate > 100
                        ? 'text-rose-500'
                        : 'text-[var(--accent)]'
                    }`}
                  >
                    %{occupancyRate} Doluluk
                  </span>
                </div>
              </div>

              {/* Günlük Doluluk Çubuğu */}
              <div className="w-full bg-[var(--bg-page)] h-1.5 rounded-full overflow-hidden my-3 border border-[var(--border-theme)]">
                <div
                  className={`h-full rounded-full transition-all ${
                    occupancyRate > 100
                      ? 'bg-rose-500'
                      : occupancyRate >= 80
                      ? 'bg-amber-500'
                      : 'bg-[var(--accent)]'
                  }`}
                  style={{ width: `${Math.min(100, occupancyRate)}%` }}
                />
              </div>

              {/* O gün çalışılacak görevler listesi */}
              {day.items.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] italic py-2">
                  Bu gün için planlanmış çalışma yükü bulunmuyor. Serbest tekrar veya dinlenme günü.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  {day.items.map((item) => (
                    <div
                      key={item.taskId}
                      className="p-3.5 rounded-xl border border-[var(--border-theme)] bg-[var(--bg-page)] flex flex-col justify-between gap-2 shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[var(--text-primary)]">
                            {item.course}
                          </span>
                          {item.isReview ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30">
                              Tekrar
                            </span>
                          ) : (
                            <span className="font-mono tabular-nums text-[var(--text-muted)]">
                              Teslim: {item.dueDate}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-semibold text-[var(--text-primary)] line-clamp-1">
                          {item.taskTitle}
                        </h4>
                        {item.timeSlot && (
                          <div className="text-[10px] font-mono tabular-nums text-[var(--accent)] flex items-center gap-1 font-semibold">
                            <Clock className="w-2.5 h-2.5 text-[var(--accent)]" />
                            <span>
                              {item.timeSlot.startTime} - {item.timeSlot.endTime}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1.5 border-t border-[var(--border-theme)] text-xs">
                        <span className="font-mono tabular-nums font-bold text-[var(--text-primary)]">
                          {item.plannedMinutes} dk
                        </span>
                        {day.isToday && (
                          <button
                            onClick={() => handleStartTask(item.taskId)}
                            className="flex items-center gap-1 text-[11px] font-bold text-[var(--accent)] hover:underline cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-current text-[var(--accent)]" />
                            <span>Başlat</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
