import { differenceInCalendarWeeks, parseISO, startOfDay } from 'date-fns';
import { ClassScheduleItem, FreeTimeSlot, WeekType } from '../../types';

/**
 * Dönem başlangıç tarihine göre verilen tarihin A haftası mı yoksa B haftası mı olduğunu hesaplar.
 * Haftalar Pazartesi'den başlar; çift indeksli haftalar A, tek indeksli haftalar B kabul edilir.
 */
export function getCurrentWeekType(
  date: Date = new Date(),
  termStartDateStr: string = '2026-09-21'
): 'A' | 'B' {
  try {
    const termStart = startOfDay(parseISO(termStartDateStr));
    const target = startOfDay(date);
    const diffWeeks = Math.abs(differenceInCalendarWeeks(target, termStart, { weekStartsOn: 1 }));
    return diffWeeks % 2 === 0 ? 'A' : 'B';
  } catch {
    return 'A';
  }
}

/**
 * "HH:mm" biçimindeki saat dizesini günün başlangıcından itibaren geçen dakikaya çevirir.
 * Örn: "09:30" -> 570 dk
 */
export function timeStringToMinutes(timeStr: string): number {
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  return h * 60 + m;
}

/**
 * Dakika değerini "HH:mm" biçimine çevirir.
 * Örn: 570 -> "09:30"
 */
export function minutesToTimeString(totalMinutes: number): string {
  const normalized = Math.max(0, Math.min(24 * 60 - 1, totalMinutes));
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export interface CalculateFreeTimeSlotsOptions {
  date: Date;
  schedule: ClassScheduleItem[];
  awakeStart?: string; // Varsayılan: "08:00"
  awakeEnd?: string; // Varsayılan: "23:00"
  abWeekEnabled?: boolean;
  termStartDate?: string;
  minBlockMinutes?: number; // 15 dakikadan kısa bloklar elenir
}

/**
 * ============================================================================
 * BOŞ ZAMAN BULUCU (FREE TIME FINDER)
 * ============================================================================
 * Öğrencinin uyanıklık aralığı (örn: 08:00–23:00) ve haftalık ders programını
 * analiz ederek gün içindeki kesintisiz boş zaman bloklarını hesaplar.
 * 15 dakikadan kısa olan blokları çalışma için yetersiz sayarak eler.
 * ============================================================================
 */
export function calculateFreeTimeSlots({
  date,
  schedule,
  awakeStart = '08:00',
  awakeEnd = '23:00',
  abWeekEnabled = true,
  termStartDate = '2026-09-21',
  minBlockMinutes = 15,
}: CalculateFreeTimeSlotsOptions): FreeTimeSlot[] {
  // JavaScript'te getDay(): 0: Pazar, 1: Pazartesi, ... 6: Cumartesi
  // Bizim sistemimizde 1: Pazartesi ... 7: Pazar
  const jsDay = date.getDay();
  const dayOfWeek = jsDay === 0 ? 7 : jsDay;

  const currentWeekType = abWeekEnabled ? getCurrentWeekType(date, termStartDate) : 'all';

  // Bu gün ve bu haftada olan dersleri filtrele
  const todayClasses = schedule.filter((c) => {
    if (c.dayOfWeek !== dayOfWeek) return false;
    if (!abWeekEnabled || c.weekType === 'all') return true;
    return c.weekType === currentWeekType;
  });

  const awakeStartMin = timeStringToMinutes(awakeStart);
  const awakeEndMin = timeStringToMinutes(awakeEnd);

  if (awakeStartMin >= awakeEndMin) {
    return [];
  }

  // Dersleri başlangıç saatine göre sırala
  const sortedClasses = [...todayClasses].sort(
    (a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime)
  );

  // Ders aralıklarını uyanıklık sınırlarına kırp
  const busyIntervals: { start: number; end: number }[] = [];
  sortedClasses.forEach((c) => {
    const cStart = Math.max(awakeStartMin, timeStringToMinutes(c.startTime));
    const cEnd = Math.min(awakeEndMin, timeStringToMinutes(c.endTime));
    if (cStart < cEnd) {
      busyIntervals.push({ start: cStart, end: cEnd });
    }
  });

  // Çakışan ders aralıklarını birleştir (merge overlapping busy intervals)
  const mergedBusy: { start: number; end: number }[] = [];
  for (const interval of busyIntervals) {
    if (mergedBusy.length === 0) {
      mergedBusy.push({ ...interval });
    } else {
      const last = mergedBusy[mergedBusy.length - 1];
      if (interval.start <= last.end) {
        last.end = Math.max(last.end, interval.end);
      } else {
        mergedBusy.push({ ...interval });
      }
    }
  }

  // Boşlukları hesapla
  const freeSlots: FreeTimeSlot[] = [];
  let pointer = awakeStartMin;

  for (const busy of mergedBusy) {
    if (busy.start > pointer) {
      const duration = busy.start - pointer;
      if (duration >= minBlockMinutes) {
        freeSlots.push({
          startTime: minutesToTimeString(pointer),
          endTime: minutesToTimeString(busy.start),
          durationMinutes: duration,
        });
      }
    }
    pointer = Math.max(pointer, busy.end);
  }

  // Son dersten uyanıklık bitişine kadar olan boşluk
  if (awakeEndMin > pointer) {
    const duration = awakeEndMin - pointer;
    if (duration >= minBlockMinutes) {
      freeSlots.push({
        startTime: minutesToTimeString(pointer),
        endTime: minutesToTimeString(awakeEndMin),
        durationMinutes: duration,
      });
    }
  }

  return freeSlots;
}
