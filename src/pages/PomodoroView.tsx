import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  Volume2,
  VolumeX,
  Clock,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { useStudyStore } from '../store/useStudyStore';
import { usePomodoroTimer, PomodoroMode } from '../hooks/usePomodoroTimer';
import { ManualSessionModal } from '../components/pomodoro/ManualSessionModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { PomodoroSession } from '../types';

export function PomodoroView() {
  const {
    tasks,
    settings,
    updateSettings,
    sessions,
    deleteSession,
    selectedTaskIdForPomodoro,
    setSelectedTaskIdForPomodoro,
  } = useStudyStore();
  const shouldReduceMotion = useReducedMotion();

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<PomodoroSession | null>(null);

  const {
    mode,
    isRunning,
    formattedTime,
    progressPercent,
    completedCycles,
    toggleTimer,
    resetTimer,
    switchMode,
    activeTask,
  } = usePomodoroTimer();

  const toggleSound = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const recentSessions = sessions.slice(0, 6);

  const modeInfo: Record<
    PomodoroMode,
    { title: string; subtitle: string; icon: typeof Brain; color: string }
  > = {
    focus: {
      title: 'Odaklanma Zamanı',
      subtitle: activeTask ? `${activeTask.course} — ${activeTask.title}` : 'Genel Çalışma',
      icon: Brain,
      color: 'text-[var(--accent)]',
    },
    short_break: {
      title: 'Kısa Mola',
      subtitle: 'Nefes alın, su için ve gözlerinizi dinlendirin.',
      icon: Coffee,
      color: 'text-emerald-500',
    },
    long_break: {
      title: 'Uzun Mola',
      subtitle: 'Harika 4 tur tamamladınız! 15 dakika boyunca tamamen dinlenin.',
      icon: Coffee,
      color: 'text-[var(--accent)]',
    },
  };

  const currentModeInfo = modeInfo[mode];
  const CurrentIcon = currentModeInfo.icon;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Üst Başlık & Kontroller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-theme)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Pomodoro Zamanlayıcı
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Zaman damgası tabanlı hassas sayaç. Sekme değişse bile süreniz asla kaybolmaz.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              settings.soundEnabled
                ? 'border-[var(--accent)]/40 text-[var(--accent)] bg-[var(--accent)]/10'
                : 'border-[var(--border-theme)] text-[var(--text-muted)]'
            }`}
            title={settings.soundEnabled ? 'Bildirim Sesi Açık' : 'Bildirim Sesi Kapalı'}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <motion.button
            whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
            onClick={() => setIsManualModalOpen(true)}
            className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Manuel Seans Ekle</span>
          </motion.button>
        </div>
      </div>

      {/* Ana Sayaç Kartı */}
      <div className="p-4 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] text-center space-y-6 shadow-sm">
        {/* Mod Değiştirme Butonları */}
        <div className="inline-flex items-center gap-1 p-1 bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-2xl flex-wrap justify-center sm:flex-nowrap">
          <button
            onClick={() => switchMode('focus')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'focus'
                ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Odaklan ({settings.pomodoroFocusMinutes} dk)
          </button>
          <button
            onClick={() => switchMode('short_break')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'short_break'
                ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Kısa Mola ({settings.pomodoroShortBreakMinutes} dk)
          </button>
          <button
            onClick={() => switchMode('long_break')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'long_break'
                ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Uzun Mola ({settings.pomodoroLongBreakMinutes} dk)
          </button>
        </div>

        {/* Görev Seçimi Dropdown */}
        <div className="max-w-md mx-auto">
          <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
            Çalışılan Görev:
          </label>
          <select
            value={selectedTaskIdForPomodoro || ''}
            onChange={(e) => setSelectedTaskIdForPomodoro(e.target.value || null)}
            className="w-full px-3 py-2 text-xs bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-xl text-[var(--text-primary)] font-medium text-center outline-hidden focus:border-[var(--accent)]"
          >
            <option value="">Genel / Bağımsız Çalışma</option>
            {tasks
              .filter((t) => !t.isCompleted)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.course} — {t.title} (%{t.completionPercentage})
                </option>
              ))}
          </select>
        </div>

        {/* Büyük Zaman Damgası Göstergesi */}
        <div className="py-4">
          <div className="text-7xl sm:text-8xl font-bold font-mono tabular-nums tracking-tighter text-[var(--text-primary)] select-none">
            {formattedTime}
          </div>

          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-[var(--text-secondary)]">
            <CurrentIcon className={`w-4 h-4 ${currentModeInfo.color}`} />
            <span className="font-semibold text-[var(--text-primary)]">
              {currentModeInfo.title}
            </span>
            <span aria-hidden="true">·</span>
            <span>{currentModeInfo.subtitle}</span>
          </div>

          {/* Tamamlanan Turlar */}
          <div className="flex items-center justify-center gap-2 mt-4 text-xs">
            <span className="text-[var(--text-muted)]">Tamamlanan Turlar:</span>
            <div className="flex items-center gap-1.5 font-mono">
              {[1, 2, 3, 4].map((i) => {
                const isCycleDone = completedCycles % 4 >= i || (completedCycles > 0 && completedCycles % 4 === 0);
                return (
                  <div
                    key={i}
                    className={`w-3.5 h-3.5 rounded-full transition-colors ${
                      isCycleDone
                        ? 'bg-[var(--accent)]'
                        : 'bg-[var(--border-theme)]'
                    }`}
                    title={`Tur ${i}`}
                  />
                );
              })}
            </div>
            <span className="font-mono tabular-nums text-[var(--text-muted)]">
              ({completedCycles} Toplam)
            </span>
          </div>
        </div>

        {/* Ana Butonlar: Başlat / Duraklat / Sıfırla */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <motion.button
            whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
            onClick={toggleTimer}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold shadow-md transition-all cursor-pointer ${
              isRunning
                ? 'bg-[var(--accent)] text-[#182524]'
                : 'btn-primary text-sm'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Duraklat</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>{progressPercent > 0 ? 'Devam Et' : 'Başlat'}</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={shouldReduceMotion ? undefined : { scale: 1.06 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
            onClick={resetTimer}
            className="p-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-2xl hover:bg-[var(--bg-page)] transition-colors cursor-pointer border border-[var(--border-theme)]"
            title="Sıfırla"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Son Tamamlanan Oturumlar Listesi */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <h3 className="font-semibold text-sm text-[var(--text-primary)]">
              Tamamlanan Pomodoro Oturumları
            </h3>
          </div>
          <span className="text-xs font-mono tabular-nums text-[var(--text-muted)]">
            Toplam {sessions.length} Oturum
          </span>
        </div>

        {recentSessions.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] italic py-3 text-center">
            Henüz tamamlanmış bir oturum yok. Yukarıdaki sayaçla ilk oturumunuzu başlatın!
          </p>
        ) : (
          <div className="space-y-2">
            {recentSessions.map((sess) => (
              <div
                key={sess.id}
                className="p-3 rounded-xl bg-[var(--bg-page)] border border-[var(--border-theme)] flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
                    <span className="font-bold">{sess.course}</span>
                    <span aria-hidden="true" className="text-[var(--text-muted)]">·</span>
                    <span className="text-[var(--text-secondary)]">{sess.taskTitle}</span>
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)] font-mono tabular-nums">
                    {sess.completedAt ? new Date(sess.completedAt).toLocaleString('tr-TR') : 'Kayıtlı'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono tabular-nums font-bold text-[var(--accent)]">
                    +{sess.durationMinutes} dk
                  </span>
                  <button
                    onClick={() => setSessionToDelete(sess)}
                    className="p-1 text-[var(--text-muted)] hover:text-rose-500 rounded cursor-pointer"
                    title="Kaydı sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ManualSessionModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />

      {/* Oturum Silme Onay Modalı */}
      <ConfirmModal
        isOpen={Boolean(sessionToDelete)}
        onClose={() => setSessionToDelete(null)}
        onConfirm={() => {
          if (sessionToDelete) {
            deleteSession(sessionToDelete.id);
            setSessionToDelete(null);
          }
        }}
        title="Oturumu Sil"
        description={`"${sessionToDelete?.course}" dersine ait ${sessionToDelete?.durationMinutes} dakikalık oturum kaydını silmek istediğinize emin misiniz?`}
        confirmText="Oturumu Sil"
        cancelText="İptal"
        isDanger={true}
      />
    </div>
  );
}
