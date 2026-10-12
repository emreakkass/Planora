import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, BookOpen, AlertCircle, Zap } from 'lucide-react';
import { Task, TaskPriority, TaskType } from '../../types';
import { useStudyStore } from '../../store/useStudyStore';
import { getCourseColor } from '../../lib/storage';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

const COMMON_COURSES = [
  'Web Programlama',
  'Veri Yapıları',
  'Matematik',
  'İşletim Sistemleri',
  'Veritabanı Sistemleri',
  'Yapay Zeka',
  'Algoritmalar',
  'Siber Güvenlik',
  'Fizik',
];

const DIFFICULTY_LABELS: Record<number, string> = {
  1: '1 - Çok Kolay',
  2: '2 - Kolay',
  3: '3 - Orta',
  4: '4 - Zor',
  5: '5 - Çok Zor',
};

export function TaskModal({ isOpen, onClose, taskToEdit }: TaskModalProps) {
  const { addTask, updateTask } = useStudyStore();

  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('Web Programlama');
  const [customCourse, setCustomCourse] = useState('');
  const [type, setType] = useState<TaskType>('assignment');
  const [dueDate, setDueDate] = useState('');
  const [estimatedTotalMinutes, setEstimatedTotalMinutes] = useState(180);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [difficulty, setDifficulty] = useState<number>(3);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      if (COMMON_COURSES.includes(taskToEdit.course)) {
        setCourse(taskToEdit.course);
        setCustomCourse('');
      } else {
        setCourse('other');
        setCustomCourse(taskToEdit.course);
      }
      setType(taskToEdit.type);
      setDueDate(taskToEdit.dueDate);
      setEstimatedTotalMinutes(taskToEdit.estimatedTotalMinutes);
      setCompletionPercentage(taskToEdit.completionPercentage);
      setPriority(taskToEdit.priority);
      setDifficulty(taskToEdit.difficulty || 3);
      setNotes(taskToEdit.notes || '');
    } else {
      setTitle('');
      setCourse('Web Programlama');
      setCustomCourse('');
      setType('assignment');
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setDueDate(nextWeek.toISOString().split('T')[0]);
      setEstimatedTotalMinutes(180);
      setCompletionPercentage(0);
      setPriority('medium');
      setDifficulty(3);
      setNotes('');
    }
    setError(null);
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Lütfen bir görev başlığı girin.');
      return;
    }
    const finalCourse = course === 'other' ? customCourse.trim() || 'Genel Ders' : course;
    if (!finalCourse) {
      setError('Lütfen geçerli bir ders adı belirtin.');
      return;
    }
    if (!dueDate) {
      setError('Lütfen bir teslim tarihi seçin.');
      return;
    }
    if (estimatedTotalMinutes <= 0) {
      setError('Tahmini süre en az 15 dakika olmalıdır.');
      return;
    }

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title: title.trim(),
        course: finalCourse,
        courseColor: getCourseColor(finalCourse),
        type,
        dueDate,
        estimatedTotalMinutes,
        completionPercentage,
        priority,
        difficulty,
        notes: notes.trim() || undefined,
      });
    } else {
      addTask({
        title: title.trim(),
        course: finalCourse,
        courseColor: getCourseColor(finalCourse),
        type,
        dueDate,
        estimatedTotalMinutes,
        completionPercentage,
        priority,
        difficulty,
        notes: notes.trim() || undefined,
        isCompleted: false,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-theme)]">
          <div>
            <h3 className="font-bold text-base text-[var(--text-primary)]">
              {taskToEdit ? 'Görevi Düzenle' : 'Yeni Görev / Sınav Ekle'}
            </h3>
            <p className="text-[11px] text-[var(--text-secondary)]">
              {taskToEdit
                ? 'Mevcut görevin süre ve teslim parametrelerini güncelleyin.'
                : 'Planlama motoruna yeni bir çalışma hedefi tanıtın.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Görev Başlığı */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)]">
              Görev Başlığı *
            </label>
            <input
              type="text"
              required
              placeholder="Örn: 1. Vize Sınavı Hazırlığı (Ağaçlar & Graf Algoritmaları)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-xl outline-hidden focus:border-[var(--accent)] text-[var(--text-primary)]"
            />
          </div>

          {/* Ders ve Tür */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
                Ders Adı *
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-xl outline-hidden focus:border-[var(--accent)] text-[var(--text-primary)]"
              >
                {COMMON_COURSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="other">Diğer (Özel Ders Gir)...</option>
              </select>
              {course === 'other' && (
                <input
                  type="text"
                  placeholder="Ders adını yazın"
                  value={customCourse}
                  onChange={(e) => setCustomCourse(e.target.value)}
                  className="mt-1.5 w-full px-3 py-1.5 text-xs bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-xl text-[var(--text-primary)]"
                />
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                Tür *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
                className="w-full px-3 py-2 text-sm bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-xl outline-hidden focus:border-[var(--accent)] text-[var(--text-primary)]"
              >
                <option value="exam">Sınav (Vize / Final / Quiz)</option>
                <option value="project">Proje / Bitirme Tezi</option>
                <option value="assignment">Ödev / Laboratuvar Raporu</option>
              </select>
            </div>
          </div>

          {/* Teslim Tarihi ve Öncelik */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />
                Teslim / Sınav Tarihi *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-xl outline-hidden focus:border-[var(--accent)] text-[var(--text-primary)] font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                Öncelik Seviyesi
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 text-sm bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-xl outline-hidden focus:border-[var(--accent)] text-[var(--text-primary)]"
              >
                <option value="low">Düşük</option>
                <option value="medium">Orta (Standart)</option>
                <option value="high">Yüksek</option>
                <option value="critical">Kritik / Acil</option>
              </select>
            </div>
          </div>

          {/* Zorluk Derecesi (1 - 5) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-[var(--accent)]" />
                Zorluk Derecesi (1 - 5)
              </label>
              <span className="text-xs font-semibold text-[var(--accent)]">
                {DIFFICULTY_LABELS[difficulty]}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  className={`py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    difficulty === lvl
                      ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] border-transparent shadow-xs'
                      : 'border-[var(--border-theme)] text-[var(--text-secondary)] hover:bg-[var(--bg-page)]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              Yüksek zorluk derecesi, planlama algoritmasında bu derse daha fazla zaman ve risk ağırlığı ayırır.
            </p>
          </div>

          {/* Tahmini Süre & Hızlı Butonlar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
                Tahmini Toplam Çalışma Süresi
              </label>
              <span className="text-xs font-mono tabular-nums text-[var(--accent)] font-bold">
                {estimatedTotalMinutes} dk ({(estimatedTotalMinutes / 60).toFixed(1)} saat)
              </span>
            </div>
            <input
              type="range"
              min={15}
              max={600}
              step={15}
              value={estimatedTotalMinutes}
              onChange={(e) => setEstimatedTotalMinutes(Number(e.target.value))}
              className="w-full accent-[var(--accent)] cursor-pointer"
            />
            <div className="flex items-center gap-2 pt-1">
              {[60, 120, 180, 240, 360].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setEstimatedTotalMinutes(mins)}
                  className={`px-2 py-0.5 text-[11px] rounded-lg font-mono tabular-nums border cursor-pointer transition-colors ${
                    estimatedTotalMinutes === mins
                      ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] border-transparent'
                      : 'border-[var(--border-theme)] text-[var(--text-secondary)] hover:bg-[var(--bg-page)]'
                  }`}
                >
                  {mins / 60}s
                </button>
              ))}
            </div>
          </div>

          {/* Tamamlanma Yüzdesi */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                Mevcut İlerleme
              </label>
              <span className="text-xs font-mono tabular-nums font-bold text-[var(--accent)]">
                %{completionPercentage} Tamamlandı
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={completionPercentage}
              onChange={(e) => setCompletionPercentage(Number(e.target.value))}
              className="w-full accent-[var(--accent)] cursor-pointer"
            />
          </div>

          {/* Notlar */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)]">
              Özel Notlar & Konular (Opsiyonel)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Örn: Bölüm 4-6 tekrarı, 10 adet algoritma sorusu çözümü..."
              className="w-full px-3 py-2 text-xs bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-xl outline-hidden focus:border-[var(--accent)] text-[var(--text-primary)] resize-none"
            />
          </div>

          {/* Actions */}
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
              className="btn-primary py-2 px-5 text-xs shadow-xs"
            >
              {taskToEdit ? 'Değişiklikleri Kaydet' : 'Görevi Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
