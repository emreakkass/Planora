import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Download,
  User,
} from 'lucide-react';
import { useStudyStore } from '../store/useStudyStore';
import { ClassScheduleItem, WeekType } from '../types';
import { ClassModal } from '../components/schedule/ClassModal';
import { getCurrentWeekType } from '../lib/planner/freeTimeFinder';
import { downloadICalendarFile } from '../lib/calendar/icsGenerator';
import { generateStudyPlan } from '../lib/planner/planEngine';
import { ConfirmModal } from '../components/common/ConfirmModal';

const DAYS_HEADER = [
  { id: 1, name: 'Pazartesi' },
  { id: 2, name: 'Salı' },
  { id: 3, name: 'Çarşamba' },
  { id: 4, name: 'Perşembe' },
  { id: 5, name: 'Cuma' },
  { id: 6, name: 'Cumartesi' },
  { id: 7, name: 'Pazar' },
];

export function ScheduleView() {
  const { schedule, deleteClass, settings, tasks } = useStudyStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassScheduleItem | null>(null);
  const [activeMobileDay, setActiveMobileDay] = useState(1);
  const [filterWeek, setFilterWeek] = useState<WeekType>('all');
  const [classToDelete, setClassToDelete] = useState<ClassScheduleItem | null>(null);

  // Bugünün gün indeksini bul (1: Pazartesi .. 7: Pazar)
  const todayJsDay = new Date().getDay();
  const todayDayOfWeek = todayJsDay === 0 ? 7 : todayJsDay;

  // Mevcut haftanın A mı B mi olduğunu hesapla
  const currentWeekType = useMemo(() => {
    return getCurrentWeekType(new Date(), settings.termStartDate || '2026-09-21');
  }, [settings.termStartDate]);

  const handleEdit = (item: ClassScheduleItem) => {
    setSelectedClass(item);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedClass(null);
    setIsModalOpen(true);
  };

  const handleExportCalendar = () => {
    const planResult = generateStudyPlan(tasks, settings, schedule, new Date(), 7);
    downloadICalendarFile(planResult.days, schedule, settings.termStartDate);
  };

  // Filtrelenmiş dersler
  const filteredSchedule = useMemo(() => {
    if (filterWeek === 'all') return schedule;
    return schedule.filter((c) => c.weekType === 'all' || c.weekType === filterWeek);
  }, [schedule, filterWeek]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Üst Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-theme)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            <span>Haftalık Ders Programı</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
            Ders Çizelgesi & Boş Zaman Blokları
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Ders saatlerinizi tanımlayın; Planora çalışma seanslarınızı otomatik olarak derslerinizin arasındaki boşluklara yerleştirsin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCalendar}
            className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
            title="Ders programını ve çalışma planını .ics olarak indir"
          >
            <Download className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Takvime Aktar (.ics)</span>
          </button>

          <button
            onClick={handleCreate}
            className="btn-primary py-2 px-3.5 text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Ders Ekle</span>
          </button>
        </div>
      </div>

      {/* A/B Hafta Durumu & Filtre Bandı */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="text-xs font-bold text-[var(--accent)]">
              Bu Hafta: {currentWeekType} Haftası
            </span>
          </div>
          <span className="text-xs text-[var(--text-muted)] hidden sm:inline">
            Dönem Başlangıcı: {settings.termStartDate || '2026-09-21'}
          </span>
        </div>

        {/* Hafta Filtresi */}
        <div className="flex items-center gap-1 p-1 bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-xl text-xs">
          <button
            onClick={() => setFilterWeek('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              filterWeek === 'all'
                ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Tüm Haftalar
          </button>
          <button
            onClick={() => setFilterWeek('A')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              filterWeek === 'A'
                ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Sadece A Haftası
          </button>
          <button
            onClick={() => setFilterWeek('B')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              filterWeek === 'B'
                ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Sadece B Haftası
          </button>
        </div>
      </div>

      {/* Mobil Görünüm: Gün Gün Sekmeler */}
      <div className="lg:hidden space-y-4">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {DAYS_HEADER.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveMobileDay(d.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeMobileDay === d.id
                  ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)]'
                  : d.id === todayDayOfWeek
                  ? 'bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30'
                  : 'bg-[var(--bg-card)] border border-[var(--border-theme)] text-[var(--text-secondary)]'
              }`}
            >
              {d.name} {d.id === todayDayOfWeek && '· Bugün'}
            </button>
          ))}
        </div>

        {/* Aktif Mobil Günün Dersleri */}
        <div className="space-y-3">
          {filteredSchedule.filter((c) => c.dayOfWeek === activeMobileDay).length === 0 ? (
            <div className="p-8 text-center bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl text-xs text-[var(--text-muted)]">
              Bu gün için ders kaydı bulunmuyor.
            </div>
          ) : (
            filteredSchedule
              .filter((c) => c.dayOfWeek === activeMobileDay)
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-2 border-l-4"
                  style={{ borderLeftColor: item.color || '#F1B45C' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[var(--text-primary)]">
                      {item.course}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                        title="Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setClassToDelete(item)}
                        className="p-1 text-[var(--text-muted)] hover:text-rose-500 cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)] font-mono tabular-nums">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[var(--accent)]" />
                      {item.startTime} — {item.endTime}
                    </span>
                    {item.classroom && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[var(--accent)]" />
                        {item.classroom}
                      </span>
                    )}
                    {item.weekType !== 'all' && (
                      <span className="text-[10px] font-sans px-1.5 py-0.5 rounded-md bg-[var(--accent)]/15 text-[var(--accent)] font-semibold border border-[var(--accent)]/30">
                        {item.weekType} Haftası
                      </span>
                    )}
                  </div>

                  {item.instructor && (
                    <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{item.instructor}</span>
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      </div>

      {/* Masaüstü Görünüm: Haftalık Grid Tablosu */}
      <div className="hidden lg:block bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl shadow-xs overflow-hidden">
        {/* Gün Başlıkları */}
        <div className="grid grid-cols-7 border-b border-[var(--border-theme)] bg-[var(--bg-page)]">
          {DAYS_HEADER.map((d) => (
            <div
              key={d.id}
              className={`p-3 text-center border-r last:border-r-0 border-[var(--border-theme)] ${
                d.id === todayDayOfWeek ? 'bg-[var(--accent)]/10' : ''
              }`}
            >
              <span className="font-bold text-xs text-[var(--text-primary)] block">
                {d.name}
              </span>
              {d.id === todayDayOfWeek && (
                <span className="text-[10px] text-[var(--accent)] font-bold uppercase tracking-wider block">
                  Bugün
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Gün Kolonları ve Ders Kartları */}
        <div className="grid grid-cols-7 min-h-[500px] divide-x divide-[var(--border-theme)]">
          {DAYS_HEADER.map((d) => {
            const dayClasses = filteredSchedule
              .filter((c) => c.dayOfWeek === d.id)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));

            return (
              <div
                key={d.id}
                className={`p-2 space-y-2.5 ${
                  d.id === todayDayOfWeek ? 'bg-[var(--accent)]/5' : ''
                }`}
              >
                {dayClasses.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center p-3">
                    <span className="text-[11px] text-[var(--text-muted)] italic">
                      Ders Yok
                    </span>
                  </div>
                ) : (
                  dayClasses.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl border border-[var(--border-theme)] bg-[var(--bg-page)] shadow-2xs space-y-1.5 transition-all hover:shadow-xs group border-l-3"
                      style={{ borderLeftColor: item.color || '#F1B45C' }}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-bold text-xs text-[var(--text-primary)] leading-tight">
                          {item.course}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setClassToDelete(item)}
                            className="p-0.5 text-[var(--text-muted)] hover:text-rose-500 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="text-[11px] font-mono tabular-nums text-[var(--text-secondary)] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[var(--accent)]" />
                        <span>
                          {item.startTime} - {item.endTime}
                        </span>
                      </div>

                      {item.classroom && (
                        <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-[var(--accent)]" />
                          <span>{item.classroom}</span>
                        </div>
                      )}

                      {item.weekType !== 'all' && (
                        <span className="inline-block text-[9px] font-semibold px-1 py-0.2 rounded bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30">
                          {item.weekType} Haftası
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>

      <ClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        classToEdit={selectedClass}
      />

      {/* Ders Silme Onay Modalı */}
      <ConfirmModal
        isOpen={Boolean(classToDelete)}
        onClose={() => setClassToDelete(null)}
        onConfirm={() => {
          if (classToDelete) {
            deleteClass(classToDelete.id);
            setClassToDelete(null);
          }
        }}
        title="Dersi Sil"
        description={`"${classToDelete?.course}" dersini haftalık programınızdan silmek istediğinize emin misiniz?`}
        confirmText="Dersi Sil"
        cancelText="İptal"
        isDanger={true}
      />
    </div>
  );
}
