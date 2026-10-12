import {
  addDays,
  differenceInCalendarDays,
  format,
  isWeekend,
  parseISO,
  startOfDay,
} from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Task,
  UserSettings,
  ClassScheduleItem,
  StudyPlanResult,
  DailyPlan,
  DailyPlanItem,
  OvercapacityTask,
  FreeTimeSlot,
} from '../../types';
import { calculateRiskScore } from '../risk/riskEngine';
import { getCourseColor } from '../storage';
import {
  calculateFreeTimeSlots,
  minutesToTimeString,
  timeStringToMinutes,
} from './freeTimeFinder';
import { getSpacedReviewItemsForDate } from './spacedReview';

/**
 * ============================================================================
 * PLANORA DETERMINİSTİK PLANLAMA & BOŞ ZAMAN EŞLEŞTİRME MOTORU
 * ============================================================================
 * 
 * Saf matematiksel ve deterministik algoritma:
 * 1. Aktif görevlerin kalan süreleri ve zorluk (1-5) dereceleri hesaplanır.
 * 2. Her gün için ders programı ve uyanıklık saatlerinden boş zaman blokları çıkarılır.
 * 3. Günlük çalışma kapasitesi görevlere ağırlıklı olarak paylaştırılır.
 * 4. Çalışma blokları boş zaman dilimlerine ardışık olarak yerleştirilir (timeSlot: HH:mm-HH:mm).
 * 5. Aralıklı tekrar (Spaced Review) oturumları sınav öncesi günlere eklenir.
 * 6. Kapasite ve boş zaman yetersizlikleri açıkça raporlanır.
 * ============================================================================
 */

export function generateStudyPlan(
  tasks: Task[],
  settings: UserSettings,
  schedule: ClassScheduleItem[] = [],
  startDateInput: Date = new Date(),
  rangeDays: number = 14
): StudyPlanResult {
  const startDate = startOfDay(startDateInput);
  const activeTasks = tasks.filter((t) => !t.isCompleted && t.completionPercentage < 100);

  const days: DailyPlan[] = [];
  const overcapacityTasks: OvercapacityTask[] = [];

  // 1. Kümülatif Kapasite Aşımı Analizi
  activeTasks.forEach((task) => {
    const dueDate = startOfDay(parseISO(task.dueDate));
    const remainingDays = differenceInCalendarDays(dueDate, startDate);
    const remainingMinutes = Math.max(
      0,
      Math.round(task.estimatedTotalMinutes * (1 - task.completionPercentage / 100))
    );

    if (remainingDays <= 0) {
      if (remainingMinutes > 0) {
        overcapacityTasks.push({
          task,
          requiredDailyMinutes: remainingMinutes,
          availableDailyMinutes: isWeekend(startDate)
            ? settings.weekendMinutes
            : settings.weekdayMinutes,
          deficitMinutes: remainingMinutes,
          dueDate: task.dueDate,
          remainingDays: Math.max(0, remainingDays),
        });
      }
      return;
    }

    let totalAvailableCapacityUntilDue = 0;
    for (let d = 0; d < remainingDays; d++) {
      const cur = addDays(startDate, d);
      totalAvailableCapacityUntilDue += isWeekend(cur)
        ? settings.weekendMinutes
        : settings.weekdayMinutes;
    }

    const requiredDailyMinutes = Math.round(remainingMinutes / remainingDays);
    const avgDailyCapacity = totalAvailableCapacityUntilDue / remainingDays;

    if (requiredDailyMinutes > avgDailyCapacity || remainingMinutes > totalAvailableCapacityUntilDue) {
      overcapacityTasks.push({
        task,
        requiredDailyMinutes,
        availableDailyMinutes: Math.round(avgDailyCapacity),
        deficitMinutes: Math.max(0, remainingMinutes - totalAvailableCapacityUntilDue),
        dueDate: task.dueDate,
        remainingDays,
      });
    }
  });

  // 2. Gün Bazlı Planlama & Boş Zaman Bloklarına Yerleştirme Döngüsü
  for (let dayOffset = 0; dayOffset < rangeDays; dayOffset++) {
    const currentDate = addDays(startDate, dayOffset);
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const dayWeekend = isWeekend(currentDate);
    const dayCapacity = dayWeekend ? settings.weekendMinutes : settings.weekdayMinutes;
    const isToday = dayOffset === 0;

    // JavaScript'te getDay(): 0: Pazar, 1: Pazartesi ...
    const jsDay = currentDate.getDay();
    const dayOfWeek = jsDay === 0 ? 7 : jsDay;

    // Bu günün boş zaman dilimlerini hesapla
    const freeSlots = calculateFreeTimeSlots({
      date: currentDate,
      schedule,
      awakeStart: settings.awakeStartTime || '08:00',
      awakeEnd: settings.awakeEndTime || '23:00',
      abWeekEnabled: settings.abWeekEnabled,
      termStartDate: settings.termStartDate || '2026-09-21',
      minBlockMinutes: 15,
    });

    const totalFreeMinutes = freeSlots.reduce((sum, s) => sum + s.durationMinutes, 0);

    // Bu gün için uygun aktif görevler
    const eligibleTasks = activeTasks.filter((t) => {
      const due = startOfDay(parseISO(t.dueDate));
      return differenceInCalendarDays(due, currentDate) >= 0;
    });

    // Aralıklı tekrar (Spaced review) öğelerini kontrol et
    const reviewItems = getSpacedReviewItemsForDate(tasks, currentDate);

    if (eligibleTasks.length === 0 && reviewItems.length === 0) {
      days.push({
        date: dateStr,
        dayName: format(currentDate, 'EEEE', { locale: tr }),
        dayOfWeek,
        isWeekend: dayWeekend,
        isToday,
        capacityMinutes: dayCapacity,
        totalAllocatedMinutes: 0,
        items: [],
        freeSlots,
        totalFreeMinutes,
        overcapacity: false,
        overcapacityMinutes: 0,
      });
      continue;
    }

    // Görevlerin ağırlık hesabı (Zorluk çarpanı dahil)
    const taskWeights = eligibleTasks.map((task) => {
      const due = startOfDay(parseISO(task.dueDate));
      const daysLeft = Math.max(1, differenceInCalendarDays(due, currentDate) + 1);
      const remainingMinutes = Math.max(
        0,
        Math.round(task.estimatedTotalMinutes * (1 - task.completionPercentage / 100))
      );

      // Öncelik katsayısı
      let pFactor = 1.0;
      if (task.priority === 'critical') pFactor = 1.45;
      else if (task.priority === 'high') pFactor = 1.25;
      else if (task.priority === 'low') pFactor = 0.7;

      // Tür katsayısı
      let tFactor = 1.0;
      if (task.type === 'exam') tFactor = 1.25;
      else if (task.type === 'project') tFactor = 1.15;

      // Zorluk katsayısı (1-5)
      const diff = task.difficulty || 3;
      const diffFactor = 0.75 + diff * 0.12;

      // Aciliyet hızı
      const urgencyRate = remainingMinutes / daysLeft;
      const weight = Math.max(0.1, urgencyRate * pFactor * tFactor * diffFactor);

      return {
        task,
        weight,
        remainingMinutes,
        daysLeft,
      };
    });

    const totalWeight = taskWeights.reduce((sum, item) => sum + item.weight, 0);

    // Review oturumlarının süresini kapasiteden düş
    const reviewMinutesTotal = reviewItems.reduce((acc, r) => acc + r.plannedMinutes, 0);
    const availableForRegularTasks = Math.max(0, dayCapacity - reviewMinutesTotal);

    // Görevlere paylaştırma ve 15 dk bloklara yuvarlama
    let allocatedSum = 0;
    const rawAllocations = taskWeights.map((item) => {
      if (totalWeight <= 0) return { ...item, allocatedMinutes: 0 };
      const ratio = item.weight / totalWeight;
      const rawMins = ratio * availableForRegularTasks;
      let rounded = Math.round(rawMins / 15) * 15;
      if (rounded === 0 && item.remainingMinutes > 0 && availableForRegularTasks >= 30) {
        rounded = 15;
      }
      rounded = Math.min(rounded, item.remainingMinutes);
      allocatedSum += rounded;
      return { ...item, allocatedMinutes: rounded };
    });

    // Günlük kapasiteye tam denkleştirme
    let difference = availableForRegularTasks - allocatedSum;
    if (difference !== 0 && rawAllocations.length > 0) {
      rawAllocations.sort((a, b) => b.weight - a.weight);
      for (const item of rawAllocations) {
        if (difference === 0) break;
        if (difference > 0) {
          const addAmount = Math.min(difference, item.remainingMinutes - item.allocatedMinutes);
          if (addAmount > 0) {
            item.allocatedMinutes += addAmount;
            difference -= addAmount;
          } else {
            item.allocatedMinutes += difference;
            difference = 0;
          }
        } else {
          const cutAmount = Math.min(Math.abs(difference), item.allocatedMinutes - 15);
          if (cutAmount > 0) {
            item.allocatedMinutes -= cutAmount;
            difference += cutAmount;
          }
        }
      }
    }

    // Görev plan öğelerini oluştur
    const regularItems: DailyPlanItem[] = rawAllocations
      .filter((alloc) => alloc.allocatedMinutes > 0)
      .map((alloc) => {
        const risk = calculateRiskScore(alloc.task, settings, currentDate);
        return {
          taskId: alloc.task.id,
          taskTitle: alloc.task.title,
          course: alloc.task.course,
          courseColor: alloc.task.courseColor || getCourseColor(alloc.task.course),
          type: alloc.task.type,
          plannedMinutes: alloc.allocatedMinutes,
          completedMinutesToday: 0,
          priority: alloc.task.priority,
          difficulty: alloc.task.difficulty || 3,
          riskScore: risk.score,
          riskLevel: risk.level,
          dueDate: alloc.task.dueDate,
          isOverdue: risk.isOverdue,
          remainingMinutesTotal: alloc.remainingMinutes,
          isReview: false,
        };
      });

    // Düzenli görevler ve tekrar görevlerini birleştir
    const combinedItems = [...regularItems, ...reviewItems].sort(
      (a, b) => b.riskScore - a.riskScore
    );

    // Boş zaman dilimlerine çalışma bloklarını yerleştir (Time slot placement)
    let currentSlotIdx = 0;
    let currentSlotTimeMin =
      freeSlots.length > 0 ? timeStringToMinutes(freeSlots[0].startTime) : 0;

    combinedItems.forEach((planItem) => {
      if (currentSlotIdx >= freeSlots.length) return;

      const slot = freeSlots[currentSlotIdx];
      const slotEndMin = timeStringToMinutes(slot.endTime);
      const neededMin = planItem.plannedMinutes;

      // Eğer mevcut slotta yeterli yer varsa
      if (currentSlotTimeMin + neededMin <= slotEndMin) {
        planItem.timeSlot = {
          startTime: minutesToTimeString(currentSlotTimeMin),
          endTime: minutesToTimeString(currentSlotTimeMin + neededMin),
        };
        currentSlotTimeMin += neededMin + 5; // 5 dk geçiş payı
      } else {
        // Sonraki slota geç
        currentSlotIdx++;
        if (currentSlotIdx < freeSlots.length) {
          const nextSlot = freeSlots[currentSlotIdx];
          currentSlotTimeMin = timeStringToMinutes(nextSlot.startTime);
          planItem.timeSlot = {
            startTime: minutesToTimeString(currentSlotTimeMin),
            endTime: minutesToTimeString(currentSlotTimeMin + neededMin),
          };
          currentSlotTimeMin += neededMin + 5;
        }
      }
    });

    const totalAllocated = combinedItems.reduce((acc, it) => acc + it.plannedMinutes, 0);
    const isOver = totalAllocated > dayCapacity;
    const hasEnoughFreeTime = totalFreeMinutes >= totalAllocated;

    let warningText: string | undefined;
    if (isOver) {
      warningText = `Planlanan süre (${totalAllocated} dk), günlük kapasitenizi (${dayCapacity} dk) aşıyor.`;
    } else if (!hasEnoughFreeTime && totalFreeMinutes > 0) {
      warningText = `Ders programı yoğunluğu nedeniyle bugün planlanan ${totalAllocated} dk çalışma için yalnızca ${totalFreeMinutes} dk boş zaman bulunuyor.`;
    }

    days.push({
      date: dateStr,
      dayName: format(currentDate, 'EEEE', { locale: tr }),
      dayOfWeek,
      isWeekend: dayWeekend,
      isToday,
      capacityMinutes: dayCapacity,
      totalAllocatedMinutes: totalAllocated,
      items: combinedItems,
      freeSlots,
      totalFreeMinutes,
      overcapacity: isOver,
      overcapacityMinutes: isOver ? totalAllocated - dayCapacity : 0,
      warning: warningText,
    });
  }

  const todayPlan = days[0] || {
    date: format(startDate, 'yyyy-MM-dd'),
    dayName: format(startDate, 'EEEE', { locale: tr }),
    dayOfWeek: startDate.getDay() === 0 ? 7 : startDate.getDay(),
    isWeekend: isWeekend(startDate),
    isToday: true,
    capacityMinutes: isWeekend(startDate) ? settings.weekendMinutes : settings.weekdayMinutes,
    totalAllocatedMinutes: 0,
    items: [],
    freeSlots: [],
    totalFreeMinutes: 0,
    overcapacity: false,
    overcapacityMinutes: 0,
  };

  const totalBacklogMinutes = activeTasks.reduce((sum, t) => {
    return sum + Math.round(t.estimatedTotalMinutes * (1 - t.completionPercentage / 100));
  }, 0);

  const urgentTasksCount = activeTasks.filter((t) => {
    const risk = calculateRiskScore(t, settings, startDate);
    return risk.level === 'critical' || risk.level === 'high';
  }).length;

  return {
    days,
    todayPlan,
    overcapacityTasks,
    totalBacklogMinutes,
    urgentTasksCount,
  };
}
