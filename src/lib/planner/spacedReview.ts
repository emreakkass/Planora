import { differenceInCalendarDays, parseISO, startOfDay } from 'date-fns';
import { Task, DailyPlanItem } from '../../types';
import { getCourseColor } from '../storage';

/**
 * ============================================================================
 * ARALIKLI TEKRAR (SPACED REVIEW) MOTORU
 * ============================================================================
 * Ebbinghaus unutma eğrisi prensibine göre:
 * Bir sınavın ana hazırlığı tamamlandığında veya erken bittiğinde,
 * sınav tarihinden 7, 3 ve 1 gün önce otomatik olarak 30-45 dakikalık
 * hafıza pekiştirme ve soru tekrarı oturumları planlanır.
 * ============================================================================
 */
export function getSpacedReviewItemsForDate(
  tasks: Task[],
  targetDate: Date
): DailyPlanItem[] {
  const normalizedTarget = startOfDay(targetDate);
  const reviewItems: DailyPlanItem[] = [];

  const examTasks = tasks.filter((t) => t.type === 'exam');

  examTasks.forEach((task) => {
    const dueDate = startOfDay(parseISO(task.dueDate));
    const daysUntilExam = differenceInCalendarDays(dueDate, normalizedTarget);

    // Sınav gelecekteyse ve 1, 3 veya 7 gün kaldıysa tekrar tetiklenir
    // Ana hazırlık %60+ tamamlanmışsa veya kalan süre azsa tekrar başlar
    const isReviewDay = [1, 3, 7].includes(daysUntilExam);
    const isEligibleForReview = task.completionPercentage >= 60 || task.isCompleted;

    if (isReviewDay && isEligibleForReview) {
      // 1 gün kala 30 dk, 3 veya 7 gün kala 45 dk
      const duration = daysUntilExam === 1 ? 30 : 45;

      reviewItems.push({
        taskId: `review-${task.id}-${daysUntilExam}`,
        taskTitle: `${task.title} (Aralıklı Tekrar - Sınava ${daysUntilExam} Gün)`,
        course: task.course,
        courseColor: task.courseColor || getCourseColor(task.course),
        type: 'exam',
        plannedMinutes: duration,
        completedMinutesToday: 0,
        priority: task.priority,
        difficulty: task.difficulty || 3,
        riskScore: Math.round(task.difficulty * 12),
        riskLevel: 'low',
        dueDate: task.dueDate,
        isOverdue: false,
        remainingMinutesTotal: 0,
        isReview: true,
      });
    }
  });

  return reviewItems;
}
