import React, { useState, useEffect } from 'react';
import { X, BookOpen, Clock, MapPin, User, Calendar } from 'lucide-react';
import { ClassScheduleItem, WeekType } from '../../types';
import { useStudyStore } from '../../store/useStudyStore';
import { getCourseColor } from '../../lib/storage';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classToEdit?: ClassScheduleItem | null;
}

const DAYS_OF_WEEK = [
  { id: 1, label: 'Pazartesi' },
  { id: 2, label: 'Salı' },
  { id: 3, label: 'Çarşamba' },
  { id: 4, label: 'Perşembe' },
  { id: 5, label: 'Cuma' },
  { id: 6, label: 'Cumartesi' },
  { id: 7, label: 'Pazar' },
];

const PRESET_COURSES = [
  'Web Programlama',
  'Veri Yapıları',
  'Matematik',
  'İşletim Sistemleri',
  'Veritabanı Sistemleri',
  'Yapay Zeka',
  'Algoritmalar',
  'Bilgisayar Ağları',
  'Siber Güvenlik',
  'Fizik',
];

export function ClassModal({ isOpen, onClose, classToEdit }: ClassModalProps) {
  const { addClass, updateClass } = useStudyStore();

  const [course, setCourse] = useState('Web Programlama');
  const [customCourse, setCustomCourse] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [classroom, setClassroom] = useState('');
  const [weekType, setWeekType] = useState<WeekType>('all');
  const [instructor, setInstructor] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (classToEdit) {
      if (PRESET_COURSES.includes(classToEdit.course)) {
        setCourse(classToEdit.course);
        setCustomCourse('');
      } else {
        setCourse('other');
        setCustomCourse(classToEdit.course);
      }
      setDayOfWeek(classToEdit.dayOfWeek);
      setStartTime(classToEdit.startTime);
      setEndTime(classToEdit.endTime);
      setClassroom(classToEdit.classroom || '');
      setWeekType(classToEdit.weekType || 'all');
      setInstructor(classToEdit.instructor || '');
    } else {
      setCourse('Web Programlama');
      setCustomCourse('');
      setDayOfWeek(1);
      setStartTime('09:00');
      setEndTime('10:30');
      setClassroom('');
      setWeekType('all');
      setInstructor('');
    }
    setError(null);
  }, [classToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCourse = course === 'other' ? customCourse.trim() : course;
    if (!finalCourse) {
      setError('Lütfen bir ders adı belirtin.');
      return;
    }
    if (startTime >= endTime) {
      setError('Bitiş saati başlangıç saatinden sonra olmalıdır.');
      return;
    }

    const payload = {
      course: finalCourse,
      dayOfWeek,
      startTime,
      endTime,
      classroom: classroom.trim() || undefined,
      weekType,
      instructor: instructor.trim() || undefined,
      color: getCourseColor(finalCourse),
    };

    if (classToEdit) {
      updateClass(classToEdit.id, payload);
    } else {
      addClass(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Başlık */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-theme)]">
          <div>
            <h3 className="font-bold text-base text-[var(--text-primary)]">
              {classToEdit ? 'Dersi Düzenle' : 'Yeni Ders Ekle'}
            </h3>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Ders saati ve yer bilgilerini haftalık programa ekleyin.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form İçeriği */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
              {error}
            </div>
          )}

          {/* Ders Adı */}
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
              {PRESET_COURSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="other">Diğer (Manuel Giriş)...</option>
            </select>
            {course === 'other' && (
              <input
                type="text"
                placeholder="Örn: Yapay Sinir Ağları"
                value={customCourse}
                onChange={(e) => setCustomCourse(e.target.value)}
                className="mt-1.5 w-full px-3 py-1.5 text-xs bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-xl text-[var(--text-primary)]"
              />
            )}
          </div>

          {/* Gün Seçimi */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />
              Ders Günü *
            </label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-xl text-[var(--text-primary)]"
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Başlangıç ve Bitiş Saati */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
                Başlangıç Saati *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-xl text-[var(--text-primary)] font-mono"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
                Bitiş Saati *
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-xl text-[var(--text-primary)] font-mono"
                required
              />
            </div>
          </div>

          {/* A/B Hafta Türü */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)]">
              Hafta Türü (A/B Tek/Çift Hafta)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setWeekType('all')}
                className={`py-1.5 text-xs rounded-xl font-medium transition-colors cursor-pointer border ${
                  weekType === 'all'
                    ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] border-transparent shadow-xs'
                    : 'border-[var(--border-theme)] text-[var(--text-secondary)] hover:bg-[var(--bg-page)]'
                }`}
              >
                Her Hafta
              </button>
              <button
                type="button"
                onClick={() => setWeekType('A')}
                className={`py-1.5 text-xs rounded-xl font-medium transition-colors cursor-pointer border ${
                  weekType === 'A'
                    ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] border-transparent shadow-xs'
                    : 'border-[var(--border-theme)] text-[var(--text-secondary)] hover:bg-[var(--bg-page)]'
                }`}
              >
                A Haftası (Tek)
              </button>
              <button
                type="button"
                onClick={() => setWeekType('B')}
                className={`py-1.5 text-xs rounded-xl font-medium transition-colors cursor-pointer border ${
                  weekType === 'B'
                    ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] border-transparent shadow-xs'
                    : 'border-[var(--border-theme)] text-[var(--text-secondary)] hover:bg-[var(--bg-page)]'
                }`}
              >
                B Haftası (Çift)
              </button>
            </div>
          </div>

          {/* Sınıf / Konum & Öğretim Görevlisi */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
                Derslik / Amfi
              </label>
              <input
                type="text"
                placeholder="Örn: D-204"
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-xl text-[var(--text-primary)]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[var(--accent)]" />
                Öğretim Üyesi
              </label>
              <input
                type="text"
                placeholder="Örn: Dr. Yılmaz"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-xl text-[var(--text-primary)]"
              />
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
              className="btn-primary py-2 px-5 text-xs shadow-xs"
            >
              {classToEdit ? 'Değişiklikleri Kaydet' : 'Dersi Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
