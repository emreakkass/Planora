import React, { useState } from 'react';
import { X, Clock } from 'lucide-react';
import { useStudyStore } from '../../store/useStudyStore';

interface ManualSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManualSessionModal({ isOpen, onClose }: ManualSessionModalProps) {
  const { tasks, addSession } = useStudyStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string>(tasks[0]?.id || 'custom');
  const [course, setCourse] = useState<string>(tasks[0]?.course || 'Genel');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);

  if (!isOpen) return null;

  const handleTaskChange = (taskId: string) => {
    setSelectedTaskId(taskId);
    if (taskId !== 'custom') {
      const task = tasks.find((t) => t.id === taskId);
      if (task) setCourse(task.course);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const task = tasks.find((t) => t.id === selectedTaskId);

    addSession({
      taskId: task ? task.id : null,
      taskTitle: task ? task.title : 'Manuel Çalışma Seansı',
      course: task ? task.course : course,
      durationMinutes,
      completedAt: new Date().toISOString(),
      type: 'focus',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-theme)]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="font-semibold text-base text-[var(--text-primary)]">
              Manuel Çalışma Kaydı Ekle
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)]">
              İlgili Görev / Ders
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => handleTaskChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-lg text-[var(--text-primary)]"
            >
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.course} — {t.title}
                </option>
              ))}
              <option value="custom">Genel Bağımsız Çalışma</option>
            </select>
          </div>

          {selectedTaskId === 'custom' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                Ders Adı
              </label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="Örn: Fizik, Yapay Zeka"
                className="w-full px-3 py-2 text-sm bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-lg text-[var(--text-primary)]"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-[var(--text-primary)]">
              <span>Çalışılan Süre (Dakika)</span>
              <span className="font-mono tabular-nums text-[var(--accent)]">
                {durationMinutes} dk ({(durationMinutes / 60).toFixed(1)} saat)
              </span>
            </div>
            <input
              type="range"
              min={15}
              max={240}
              step={15}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full accent-[var(--accent)] cursor-pointer"
            />
            <div className="flex gap-1.5 pt-1">
              {[25, 45, 60, 90, 120].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDurationMinutes(m)}
                  className={`px-2 py-0.5 text-[11px] rounded font-mono tabular-nums border cursor-pointer ${
                    durationMinutes === m
                      ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] border-transparent'
                      : 'border-[var(--border-theme)] text-[var(--text-secondary)]'
                  }`}
                >
                  {m}dk
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-theme)]">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary py-2 px-4 text-xs"
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn-primary py-2 px-4 text-xs shadow-xs"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
