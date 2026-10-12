import React, { useState, useMemo } from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  AlertCircle,
  Play,
} from 'lucide-react';
import { useStudyStore } from '../store/useStudyStore';
import { calculateRiskScore } from '../lib/risk/riskEngine';
import { Task, TaskType, TaskPriority } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { AnimatedCheckButton } from '../components/common/AnimatedCheckButton';
import { AnimatedNumber } from '../components/common/AnimatedNumber';

interface TasksViewProps {
  onOpenTaskModal: (task?: Task) => void;
  onOpenNaturalLanguageModal?: () => void;
}

export function TasksView({ onOpenTaskModal }: TasksViewProps) {
  const {
    tasks,
    deleteTask,
    updateTaskProgress,
    toggleTaskCompleted,
    settings,
    setActiveTab,
    setSelectedTaskIdForPomodoro,
  } = useStudyStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('active');

  // Silme onay modalı state'i
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Benzersiz ders listesi
  const uniqueCourses = useMemo(() => {
    return Array.from(new Set(tasks.map((t) => t.course))).filter(Boolean);
  }, [tasks]);

  // Filtreleme mantığı
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Durum filtresi
      if (statusFilter === 'active' && task.isCompleted) return false;
      if (statusFilter === 'completed' && !task.isCompleted) return false;

      // Ders filtresi
      if (filterCourse !== 'all' && task.course !== filterCourse) return false;

      // Tür filtresi
      if (filterType !== 'all' && task.type !== (filterType as TaskType)) return false;

      // Öncelik filtresi
      if (filterPriority !== 'all' && task.priority !== (filterPriority as TaskPriority)) return false;

      // Arama filtresi
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = task.title.toLowerCase().includes(query);
        const courseMatch = task.course.toLowerCase().includes(query);
        const notesMatch = task.notes?.toLowerCase().includes(query) || false;
        if (!titleMatch && !courseMatch && !notesMatch) return false;
      }

      return true;
    });
  }, [tasks, statusFilter, filterCourse, filterType, filterPriority, searchQuery]);

  const shouldReduceMotion = useReducedMotion();

  const handleStartPomodoro = (taskId: string) => {
    setSelectedTaskIdForPomodoro(taskId);
    setActiveTab('pomodoro');
  };

  const listContainerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.22, ease: 'easeOut' },
    },
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Üst Bar: Başlık & Aksiyonlar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-theme)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Görev & Sınav Yönetimi
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Tüm derslerinizi, ödevlerinizi ve sınavlarınızı tek ekranda organize edin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
            onClick={() => onOpenTaskModal()}
            className="btn-primary py-2 px-3.5 text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Görev Ekle</span>
          </motion.button>
        </div>
      </div>

      {/* Arama ve Filtre Kontrolleri */}
      <div className="bg-[var(--bg-card)] p-3.5 sm:p-4 rounded-2xl border border-[var(--border-card)] space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Canlı Arama Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Görev adı, ders veya konu ara..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-xl outline-hidden focus:border-[var(--accent)] text-[var(--text-primary)]"
            />
          </div>

          {/* Durum Segmented Butonları */}
          <div className="flex items-center gap-1 p-1 bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-xl shrink-0">
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Devam Eden ({tasks.filter((t) => !t.isCompleted).length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Tamamlanan ({tasks.filter((t) => t.isCompleted).length})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Tümü ({tasks.length})
            </button>
          </div>
        </div>

        {/* Dropdown Filtreler */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Ders Filtresi */}
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="px-2.5 py-1.5 bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-xl text-[var(--text-primary)] outline-hidden"
          >
            <option value="all">Tüm Dersler</option>
            {uniqueCourses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Tür Filtresi */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-xl text-[var(--text-primary)] outline-hidden"
          >
            <option value="all">Tüm Türler</option>
            <option value="exam">Sınavlar</option>
            <option value="project">Projeler</option>
            <option value="assignment">Ödevler</option>
          </select>

          {/* Öncelik Filtresi */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-2.5 py-1.5 bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-xl text-[var(--text-primary)] outline-hidden"
          >
            <option value="all">Tüm Öncelikler</option>
            <option value="critical">Kritik</option>
            <option value="high">Yüksek</option>
            <option value="medium">Orta</option>
            <option value="low">Düşük</option>
          </select>

          {(filterCourse !== 'all' || filterType !== 'all' || filterPriority !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setFilterCourse('all');
                setFilterType('all');
                setFilterPriority('all');
                setSearchQuery('');
              }}
              className="text-[11px] text-[var(--accent)] hover:underline px-2 cursor-pointer font-semibold"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      </div>

      {/* Görev Kartları Listesi */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl space-y-3">
          <AlertCircle className="w-10 h-10 mx-auto text-[var(--text-muted)]" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Filtreye uygun görev bulunamadı
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
            Arama terimini veya filtreleri değiştirin ya da listenize yeni bir çalışma görevi ekleyin.
          </p>
          <motion.button
            whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
            onClick={() => onOpenTaskModal()}
            className="btn-primary py-2 px-3.5 text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Görev Oluştur</span>
          </motion.button>
        </div>
      ) : (
        <motion.div
          variants={listContainerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {filteredTasks.map((task) => {
            const risk = calculateRiskScore(task, settings);
            const remainingMins = Math.round(
              task.estimatedTotalMinutes * (1 - task.completionPercentage / 100)
            );

            return (
              <motion.div
                key={task.id}
                variants={cardVariants}
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : { y: -2, boxShadow: '0 8px 24px -4px rgba(0,0,0,0.08)' }
                }
                transition={{ duration: 0.15 }}
                className={`p-3.5 sm:p-5 rounded-2xl bg-[var(--bg-card)] border transition-all flex flex-col justify-between gap-4 shadow-xs ${
                  task.isCompleted
                    ? 'border-[var(--border-theme)] opacity-70'
                    : 'border-[var(--border-card)] hover:border-[var(--accent)]/50'
                }`}
              >
                {/* Üst Kısım: Ders ve Tip */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <span className="font-bold text-[var(--text-primary)]">
                        {task.course}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">
                        {task.type === 'exam' ? 'Sınav' : task.type === 'project' ? 'Proje' : 'Ödev'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize font-medium">
                        {task.priority === 'critical'
                          ? 'Kritik Öncelik'
                          : task.priority === 'high'
                          ? 'Yüksek Öncelik'
                          : task.priority === 'low'
                          ? 'Düşük Öncelik'
                          : 'Orta Öncelik'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums text-[var(--text-primary)] font-semibold">
                        Zorluk: {task.difficulty || 3}/5
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenTaskModal(task)}
                        className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-md cursor-pointer"
                        title="Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setTaskToDelete(task)}
                        className="p-1 text-[var(--text-muted)] hover:text-rose-600 rounded-md cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Başlık */}
                  <h3
                    className={`text-base font-semibold leading-snug ${
                      task.isCompleted
                        ? 'line-through text-[var(--text-muted)]'
                        : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {task.title}
                  </h3>

                  {task.notes && (
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                      {task.notes}
                    </p>
                  )}

                  {/* Tarih ve Süre Bilgileri */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)] font-mono tabular-nums pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[var(--accent)]" />
                      Teslim: {task.dueDate}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[var(--accent)]" />
                      Kalan: <AnimatedNumber value={remainingMins} /> dk / {task.estimatedTotalMinutes} dk
                    </span>
                  </div>
                </div>

                {/* Orta Kısım: İlerleme Çubuğu & Hızlı Güncelleme */}
                <div className="space-y-1.5 pt-2 border-t border-[var(--border-theme)]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--text-secondary)]">İlerleme Durumu</span>
                    <span className="font-mono tabular-nums font-semibold text-[var(--accent)]">
                      %<AnimatedNumber value={task.completionPercentage} />
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={task.completionPercentage}
                    onChange={(e) => updateTaskProgress(task.id, Number(e.target.value))}
                    className="w-full accent-[var(--accent)] cursor-pointer h-1.5"
                  />
                </div>

                {/* Alt Kısım: Risk Değerlendirmesi & Eylemler */}
                <div className="space-y-3 pt-1">
                  {!task.isCompleted && (
                    <RiskBadge assessment={risk} showBar={true} showExplanation={true} />
                  )}

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border-theme)]">
                    <AnimatedCheckButton
                      variant="badge"
                      isCompleted={task.isCompleted}
                      onToggle={() => toggleTaskCompleted(task.id)}
                      title="Tamamlandı olarak işaretle"
                    />

                    {!task.isCompleted && (
                      <motion.button
                        whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                        onClick={() => handleStartPomodoro(task.id)}
                        className="btn-primary py-1.5 px-3 text-xs shadow-xs"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Pomodoro Başlat</span>
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Görev Silme Onay Modalı */}
      <ConfirmModal
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            deleteTask(taskToDelete.id);
            setTaskToDelete(null);
          }
        }}
        title="Görevi Sil"
        description={`"${taskToDelete?.title}" adlı görevi silmek istediğinize emin misiniz?`}
        confirmText="Görevi Sil"
        cancelText="İptal"
        isDanger={true}
      />
    </div>
  );
}
