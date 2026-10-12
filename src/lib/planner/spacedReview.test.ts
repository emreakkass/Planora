import { describe, it, expect } from 'vitest';
import { getSpacedReviewItemsForDate } from './spacedReview';
import { Task } from '../../types';

describe('spacedReview', () => {
  it('triggers spaced review sessions at 7, 3, and 1 days before exam if eligible', () => {
    // Sınav tarihi: 2026-10-15
    const examTask: Task = {
      id: 'task-exam-1',
      title: 'Algoritma Final Sınavı',
      course: 'Algoritmalar',
      type: 'exam',
      dueDate: '2026-10-15',
      estimatedTotalMinutes: 300,
      completionPercentage: 80, // %60+ tamamlanmış -> tekrara uygun
      priority: 'critical',
      difficulty: 4,
      isCompleted: false,
      createdAt: '2026-10-01',
    };

    // 7 gün önce: 2026-10-08
    const date7DaysBefore = new Date('2026-10-08T10:00:00');
    const items7 = getSpacedReviewItemsForDate([examTask], date7DaysBefore);
    expect(items7).toHaveLength(1);
    expect(items7[0].isReview).toBe(true);
    expect(items7[0].plannedMinutes).toBe(45);
    expect(items7[0].taskTitle).toContain('Aralıklı Tekrar - Sınava 7 Gün');

    // 3 gün önce: 2026-10-12
    const date3DaysBefore = new Date('2026-10-12T10:00:00');
    const items3 = getSpacedReviewItemsForDate([examTask], date3DaysBefore);
    expect(items3).toHaveLength(1);
    expect(items3[0].plannedMinutes).toBe(45);
    expect(items3[0].taskTitle).toContain('Aralıklı Tekrar - Sınava 3 Gün');

    // 1 gün önce: 2026-10-14
    const date1DayBefore = new Date('2026-10-14T10:00:00');
    const items1 = getSpacedReviewItemsForDate([examTask], date1DayBefore);
    expect(items1).toHaveLength(1);
    expect(items1[0].plannedMinutes).toBe(30);
    expect(items1[0].taskTitle).toContain('Aralıklı Tekrar - Sınava 1 Gün');

    // Diğer bir gün (örneğin 5 gün önce: 2026-10-10) -> Tekrar tetiklenmemeli
    const date5DaysBefore = new Date('2026-10-10T10:00:00');
    const items5 = getSpacedReviewItemsForDate([examTask], date5DaysBefore);
    expect(items5).toHaveLength(0);
  });

  it('does not trigger review if exam progress is less than 60% and not completed', () => {
    const unreadyExam: Task = {
      id: 'task-exam-2',
      title: 'Fizik Vizesi',
      course: 'Fizik',
      type: 'exam',
      dueDate: '2026-10-15',
      estimatedTotalMinutes: 240,
      completionPercentage: 20, // Henüz %20'de
      priority: 'high',
      difficulty: 3,
      isCompleted: false,
      createdAt: '2026-10-01',
    };

    const date3DaysBefore = new Date('2026-10-12T10:00:00');
    const items = getSpacedReviewItemsForDate([unreadyExam], date3DaysBefore);
    expect(items).toHaveLength(0);
  });
});
