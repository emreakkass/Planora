import { format, subDays } from 'date-fns';
import { PomodoroSession, StreakData } from '../../types';

/**
 * ============================================================================
 * SERİ (STREAK) HESAPLAMA MOTORU
 * ============================================================================
 * En az 1 tamamlanan odaklanma (focus) seansı olan her takvim günü aktif sayılır.
 * Mevcut seriyi ve kaydedilen en uzun çalışma serisini deterministik hesaplar.
 * ============================================================================
 */
export function calculateStudyStreak(
  sessions: PomodoroSession[],
  referenceDateInput: Date = new Date()
): StreakData {
  const referenceDate = referenceDateInput;
  const todayStr = format(referenceDate, 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(referenceDate, 1), 'yyyy-MM-dd');

  // Geçerli odaklanma seanslarının tarihlerini (YYYY-MM-DD) benzersiz kümede topla
  const activeDaysSet = new Set<string>();
  sessions.forEach((s) => {
    if (s.type === 'focus' && s.durationMinutes > 0 && s.completedAt) {
      const day = s.completedAt.split('T')[0];
      if (day) activeDaysSet.add(day);
    }
  });

  const hasStudiedToday = activeDaysSet.has(todayStr);

  // Günleri sırala
  const sortedDays = Array.from(activeDaysSet).sort();

  if (sortedDays.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      hasStudiedToday: false,
      lastStudyDate: null,
    };
  }

  const lastStudyDate = sortedDays[sortedDays.length - 1];

  // 1. Mevcut Seri Hesabı:
  // Başlangıç noktası: Bugün çalışıldıysa bugün, çalışılmadıysa dünden itibaren geriye say
  let currentStreak = 0;
  let checkDate = hasStudiedToday ? referenceDate : subDays(referenceDate, 1);
  const startDayStr = format(checkDate, 'yyyy-MM-dd');

  if (activeDaysSet.has(startDayStr)) {
    while (true) {
      const dStr = format(checkDate, 'yyyy-MM-dd');
      if (activeDaysSet.has(dStr)) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }
  }

  // 2. En Uzun Seri Hesabı (Longest Streak across entire history):
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dayStr of sortedDays) {
    const currentDate = new Date(dayStr);
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round(
        (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDate = currentDate;
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  return {
    currentStreak,
    longestStreak,
    hasStudiedToday,
    lastStudyDate,
  };
}
