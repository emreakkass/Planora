import { useState, useEffect, useRef, useCallback } from 'react';
import { useStudyStore } from '../store/useStudyStore';
import { playChimeSound } from '../lib/audio/soundEffects';

export type PomodoroMode = 'focus' | 'short_break' | 'long_break';

export function usePomodoroTimer() {
  const { settings, addSession, selectedTaskIdForPomodoro, tasks } = useStudyStore();

  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedCycles, setCompletedCycles] = useState<number>(0);

  // Modlara göre süre belirleme (dakika -> saniye)
  const getDurationForMode = useCallback(
    (currentMode: PomodoroMode): number => {
      switch (currentMode) {
        case 'focus':
          return settings.pomodoroFocusMinutes * 60;
        case 'short_break':
          return settings.pomodoroShortBreakMinutes * 60;
        case 'long_break':
          return settings.pomodoroLongBreakMinutes * 60;
      }
    },
    [settings]
  );

  const [timeLeft, setTimeLeft] = useState<number>(() => getDurationForMode('focus'));
  const [totalDuration, setTotalDuration] = useState<number>(() => getDurationForMode('focus'));

  // Zaman damgası referansı (drift-free timestamp countdown)
  const endTimeRef = useRef<number | null>(null);

  // Aktif görevi bul
  const activeTask = tasks.find((t) => t.id === selectedTaskIdForPomodoro) || null;

  // Mod değiştirme fonksiyonu
  const switchMode = useCallback(
    (newMode: PomodoroMode, autoStart: boolean = false) => {
      setIsRunning(false);
      endTimeRef.current = null;
      const duration = getDurationForMode(newMode);
      setMode(newMode);
      setTimeLeft(duration);
      setTotalDuration(duration);

      if (autoStart) {
        endTimeRef.current = Date.now() + duration * 1000;
        setIsRunning(true);
      }
    },
    [getDurationForMode]
  );

  // Zamanlayıcıyı başlat/duraklat
  const toggleTimer = useCallback(() => {
    if (isRunning) {
      // Duraklat
      setIsRunning(false);
      endTimeRef.current = null;
    } else {
      // Başlat
      const currentRemaining = timeLeft > 0 ? timeLeft : totalDuration;
      endTimeRef.current = Date.now() + currentRemaining * 1000;
      setIsRunning(true);
    }
  }, [isRunning, timeLeft, totalDuration]);

  // Sıfırla
  const resetTimer = useCallback(() => {
    setIsRunning(false);
    endTimeRef.current = null;
    const duration = getDurationForMode(mode);
    setTimeLeft(duration);
    setTotalDuration(duration);
  }, [getDurationForMode, mode]);

  // Seans bittiğinde yapılacaklar
  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    endTimeRef.current = null;

    // Ses efekti
    if (settings.soundEnabled) {
      playChimeSound();
    }

    // Tarayıcı bildirimi
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      const title =
        mode === 'focus' ? '🎉 Pomodoro Tamamlandı!' : '☕ Mola Sona Erdi, Odaklanmaya Hazır mısın?';
      const body =
        mode === 'focus'
          ? `${activeTask ? activeTask.title : 'Çalışma oturumu'} bitti. Harika iş!`
          : 'Mola süresi bitti. Yeni çalışma turuna başlayabilirsiniz.';
      try {
        new Notification(title, { body });
      } catch (e) {
        console.debug('Notification error:', e);
      }
    }

    // Oturumu kaydet
    if (mode === 'focus') {
      const minutesSpent = Math.round(totalDuration / 60);
      addSession({
        taskId: activeTask ? activeTask.id : null,
        taskTitle: activeTask ? activeTask.title : 'Genel Çalışma',
        course: activeTask ? activeTask.course : 'Genel',
        durationMinutes: minutesSpent,
        completedAt: new Date().toISOString(),
        type: 'focus',
      });

      const nextCycles = completedCycles + 1;
      setCompletedCycles(nextCycles);

      // 4 turdan sonra uzun mola, yoksa kısa mola
      if (nextCycles % settings.pomodoroCyclesBeforeLongBreak === 0) {
        switchMode('long_break', false);
      } else {
        switchMode('short_break', false);
      }
    } else {
      // Mola bitti, tekrar odaklanma moduna geç
      switchMode('focus', false);
    }
  }, [
    mode,
    totalDuration,
    activeTask,
    settings,
    addSession,
    completedCycles,
    switchMode,
  ]);

  // Timestamp tabanlı sayaç motoru & sekme değişimi senkronizasyonu
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (!endTimeRef.current) return;

      const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        handleSessionComplete();
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isRunning, handleSessionComplete]);

  // Sekme arka plana gidip geri gelince anında senkronize et (Drift önleme)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunning && endTimeRef.current) {
        const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          handleSessionComplete();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, handleSessionComplete]);

  // Ayarlar değiştikçe modun temel süresini senkronize et
  useEffect(() => {
    if (!isRunning) {
      const d = getDurationForMode(mode);
      setTimeLeft(d);
      setTotalDuration(d);
    }
  }, [settings, mode, isRunning, getDurationForMode]);

  const progressPercent = totalDuration > 0 ? Math.round(((totalDuration - timeLeft) / totalDuration) * 100) : 0;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    mode,
    isRunning,
    timeLeft,
    totalDuration,
    progressPercent,
    completedCycles,
    formattedTime,
    activeTask,
    toggleTimer,
    resetTimer,
    switchMode,
  };
}
