import { describe, it, expect } from 'vitest';
import { calculateStudyStreak } from './streakCalculator';
import { PomodoroSession } from '../../types';

describe('streakCalculator', () => {
  it('returns 0 streak when there are no sessions', () => {
    const result = calculateStudyStreak([], new Date('2026-10-08T12:00:00'));
    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(0);
    expect(result.hasStudiedToday).toBe(false);
  });

  it('calculates current streak and longest streak across consecutive days', () => {
    // 2026-10-06, 2026-10-07, 2026-10-08 seansları
    const sessions: PomodoroSession[] = [
      {
        id: 's1',
        taskId: 't-1',
        taskTitle: 'Çalışma 1',
        course: 'Matematik',
        durationMinutes: 25,
        type: 'focus',
        completedAt: '2026-10-06T14:00:00.000Z',
      },
      {
        id: 's2',
        taskId: 't-2',
        taskTitle: 'Çalışma 2',
        course: 'Fizik',
        durationMinutes: 25,
        type: 'focus',
        completedAt: '2026-10-07T15:00:00.000Z',
      },
      {
        id: 's3',
        taskId: 't-3',
        taskTitle: 'Çalışma 3',
        course: 'Kimya',
        durationMinutes: 25,
        type: 'focus',
        completedAt: '2026-10-08T11:00:00.000Z',
      },
    ];

    const today = new Date('2026-10-08T12:00:00');
    const result = calculateStudyStreak(sessions, today);

    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(3);
    expect(result.hasStudiedToday).toBe(true);
  });

  it('keeps streak alive from yesterday if user has not yet studied today', () => {
    // Dün (2026-10-07) ve evvelsi gün (2026-10-06) çalışıldı, bugün henüz çalışılmadı
    const sessions: PomodoroSession[] = [
      {
        id: 's1',
        taskId: 't-1',
        taskTitle: 'Çalışma 1',
        course: 'Matematik',
        durationMinutes: 25,
        type: 'focus',
        completedAt: '2026-10-06T14:00:00.000Z',
      },
      {
        id: 's2',
        taskId: 't-2',
        taskTitle: 'Çalışma 2',
        course: 'Fizik',
        durationMinutes: 25,
        type: 'focus',
        completedAt: '2026-10-07T15:00:00.000Z',
      },
    ];

    const today = new Date('2026-10-08T09:00:00');
    const result = calculateStudyStreak(sessions, today);

    expect(result.currentStreak).toBe(2);
    expect(result.hasStudiedToday).toBe(false);
  });

  it('resets current streak to 0 if yesterday was missed and not studied today', () => {
    // En son 2026-10-05'te çalışılmış (2 gün önce kaçırılmış)
    const sessions: PomodoroSession[] = [
      {
        id: 's1',
        taskId: 't-1',
        taskTitle: 'Çalışma 1',
        course: 'Matematik',
        durationMinutes: 25,
        type: 'focus',
        completedAt: '2026-10-05T14:00:00.000Z',
      },
    ];

    const today = new Date('2026-10-08T09:00:00');
    const result = calculateStudyStreak(sessions, today);

    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(1);
    expect(result.hasStudiedToday).toBe(false);
  });

  it('ignores break sessions when calculating study streak', () => {
    const sessions: PomodoroSession[] = [
      {
        id: 's1',
        taskId: null,
        taskTitle: 'Kısa Mola',
        course: 'Mola',
        durationMinutes: 5,
        type: 'short_break',
        completedAt: '2026-10-08T10:00:00.000Z',
      },
    ];

    const today = new Date('2026-10-08T12:00:00');
    const result = calculateStudyStreak(sessions, today);
    expect(result.hasStudiedToday).toBe(false);
    expect(result.currentStreak).toBe(0);
  });
});
