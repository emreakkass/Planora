import React from 'react';
import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { OvercapacityTask } from '../../types';

interface OvercapacityAlertProps {
  tasks: OvercapacityTask[];
  onOpenSettings?: () => void;
}

export function OvercapacityAlert({ tasks, onOpenSettings }: OvercapacityAlertProps) {
  if (tasks.length === 0) return null;

  return (
    <div className="border border-rose-500/30 bg-rose-500/10 p-4 rounded-2xl text-[var(--text-primary)]">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-rose-500/20 text-rose-500 rounded-xl shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm text-rose-500">
              Kapasite Aşımı Riski Tespit Edildi ({tasks.length} Görev)
            </h4>
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="text-xs font-medium text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Kapasite Ayarları <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
            Aşağıdaki görevlerin teslim tarihine kadar tamamlanabilmesi için gereken günlük çalışma süresi,
            mevcut günlük çalışma kapasitenizi aşıyor.
          </p>

          <div className="space-y-1.5 pt-1">
            {tasks.map(({ task, requiredDailyMinutes, availableDailyMinutes, remainingDays }) => (
              <div
                key={task.id}
                className="text-xs bg-[var(--bg-card)] p-2.5 rounded-xl border border-[var(--border-theme)] flex flex-wrap items-center justify-between gap-2"
              >
                <div>
                  <span className="font-semibold text-[var(--text-primary)]">{task.title}</span>
                  <span className="text-[var(--text-muted)]"> ({task.course})</span>
                </div>
                <div className="flex items-center gap-2 font-mono tabular-nums text-[11px] text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-rose-500" />
                    Gereken: <strong className="text-rose-500 font-bold">{requiredDailyMinutes} dk/gün</strong>
                  </span>
                  <span>·</span>
                  <span>Kapasite: {availableDailyMinutes} dk/gün</span>
                  <span>·</span>
                  <span>Kalan: {remainingDays} gün</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-[var(--text-muted)] pt-1">
            💡 <strong>Öneri:</strong> Hafta sonu çalışma sürenizi artırabilir veya daha düşük öncelikli görevleri erteleyerek odaklanabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
