import { addDays, format, parseISO } from 'date-fns';
import { ClassScheduleItem, DailyPlan } from '../../types';

function formatDateToICS(date: Date): string {
  // YYYYMMDDTHHmmssZ
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function formatLocalDateToICS(dateStr: string, timeStr: string): string {
  // YYYYMMDDTHHmm00
  const cleanDate = dateStr.replace(/-/g, '');
  const cleanTime = timeStr.replace(/:/g, '') + '00';
  return `${cleanDate}T${cleanTime}`;
}

const ICS_DAY_MAP: Record<number, string> = {
  1: 'MO',
  2: 'TU',
  3: 'WE',
  4: 'TH',
  5: 'FR',
  6: 'SA',
  7: 'SU',
};

/**
 * ============================================================================
 * STANDARD RFC 5545 iCALENDAR (.ics) ÜRETİCİ
 * ============================================================================
 * Harici kütüphane kullanmadan Google Calendar, Apple Calendar ve Outlook
 * ile tam uyumlu iCalendar dosyası oluşturur.
 * - Ders programı için haftalık tekrar eden (RRULE:FREQ=WEEKLY) etkinlikler
 * - Planlanan günlük çalışma oturumları için tekil etkinlikler
 * ============================================================================
 */
export function generateICalendarData(
  dailyPlans: DailyPlan[],
  classSchedule: ClassScheduleItem[],
  termStartDateStr: string = '2026-09-21'
): string {
  const now = new Date();
  const dtstamp = formatDateToICS(now);

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Planora//Akilli Ders ve Calisma Planlayici//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Planora Çalışma ve Ders Takvimi',
    'X-WR-TIMEZONE:Europe/Istanbul',
    'BEGIN:VTIMEZONE',
    'TZID:Europe/Istanbul',
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0300',
    'TZOFFSETTO:+0300',
    'TZNAME:TRT',
    'END:STANDARD',
    'END:VTIMEZONE',
  ];

  // 1. Haftalık Ders Programı Etkinlikleri (Tekrar eden RRULE)
  const termStart = parseISO(termStartDateStr);

  classSchedule.forEach((cls) => {
    // Dönem başlangıcından itibaren dersin ilk gerçekleştiği günü bul
    const jsDay = cls.dayOfWeek === 7 ? 0 : cls.dayOfWeek;
    let firstClassDate = termStart;
    while (firstClassDate.getDay() !== jsDay) {
      firstClassDate = addDays(firstClassDate, 1);
    }
    const firstDateStr = format(firstClassDate, 'yyyy-MM-dd');

    const dtStart = formatLocalDateToICS(firstDateStr, cls.startTime);
    const dtEnd = formatLocalDateToICS(firstDateStr, cls.endTime);
    const byDay = ICS_DAY_MAP[cls.dayOfWeek] || 'MO';

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:planora-class-${cls.id}@planora.app`);
    lines.push(`DTSTAMP:${dtstamp}`);
    lines.push(`DTSTART;TZID=Europe/Istanbul:${dtStart}`);
    lines.push(`DTEND;TZID=Europe/Istanbul:${dtEnd}`);
    lines.push(`SUMMARY:📚 ${cls.course}`);
    if (cls.classroom) {
      lines.push(`LOCATION:${cls.classroom}`);
    }
    const descParts = [
      `Ders: ${cls.course}`,
      cls.instructor ? `Öğretim Üyesi: ${cls.instructor}` : null,
      cls.weekType !== 'all' ? `Hafta Türü: ${cls.weekType} Haftası` : null,
    ]
      .filter(Boolean)
      .join('\\n');

    lines.push(`DESCRIPTION:${descParts}`);
    // 14 haftalık dönem tekrar kuralı
    lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${byDay};COUNT=16`);
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  // 2. Planlanan Çalışma Blokları (Her günün spesifik saatleri)
  dailyPlans.forEach((day) => {
    day.items.forEach((item, itemIdx) => {
      // Saat aralığı varsa spesifik, yoksa varsayılan
      const startTime = item.timeSlot?.startTime || '18:00';
      const endTime = item.timeSlot?.endTime || '19:00';

      const dtStart = formatLocalDateToICS(day.date, startTime);
      const dtEnd = formatLocalDateToICS(day.date, endTime);

      const isReviewPrefix = item.isReview ? '🔄 [Tekrar] ' : '⚡ [Çalışma] ';

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:planora-study-${day.date}-${item.taskId}-${itemIdx}@planora.app`);
      lines.push(`DTSTAMP:${dtstamp}`);
      lines.push(`DTSTART;TZID=Europe/Istanbul:${dtStart}`);
      lines.push(`DTEND;TZID=Europe/Istanbul:${dtEnd}`);
      lines.push(`SUMMARY:${isReviewPrefix}${item.course} — ${item.taskTitle}`);
      lines.push(
        `DESCRIPTION:Planora akıllı çalışma bloğu.\\nSüre: ${item.plannedMinutes} dakika\\nTeslim Tarihi: ${item.dueDate}`
      );
      lines.push('STATUS:CONFIRMED');
      lines.push('END:VEVENT');
    });
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * .ics dosyasını tarayıcıda indirir.
 */
export function downloadICalendarFile(
  dailyPlans: DailyPlan[],
  classSchedule: ClassScheduleItem[],
  termStartDate?: string
): void {
  const icsData = generateICalendarData(dailyPlans, classSchedule, termStartDate);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `planora-takvim-${new Date().toISOString().split('T')[0]}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
