import { describe, it, expect } from 'vitest';
import { generateICalendarData } from './icsGenerator';
import { ClassScheduleItem, DailyPlan } from '../../types';

describe('icsGenerator', () => {
  it('generates valid RFC 5545 iCalendar content with Europe/Istanbul timezone', () => {
    const classSchedule: ClassScheduleItem[] = [
      {
        id: 'cls-1',
        course: 'Yapay Zeka',
        dayOfWeek: 1, // Pazartesi
        startTime: '09:00',
        endTime: '11:45',
        classroom: 'D-302',
        instructor: 'Prof. Dr. Kaya',
        weekType: 'all',
      },
    ];

    const dailyPlans: DailyPlan[] = [
      {
        date: '2026-10-12',
        dayName: 'Pazartesi',
        dayOfWeek: 1,
        isWeekend: false,
        isToday: false,
        capacityMinutes: 180,
        totalAllocatedMinutes: 60,
        freeSlots: [],
        totalFreeMinutes: 120,
        overcapacity: false,
        overcapacityMinutes: 0,
        items: [
          {
            taskId: 'task-1',
            taskTitle: 'Vize Hazırlığı',
            course: 'Yapay Zeka',
            courseColor: '#6366F1',
            type: 'exam',
            plannedMinutes: 60,
            completedMinutesToday: 0,
            priority: 'high',
            difficulty: 4,
            riskScore: 65,
            riskLevel: 'medium',
            dueDate: '2026-10-16',
            isOverdue: false,
            remainingMinutesTotal: 180,
            timeSlot: {
              startTime: '14:00',
              endTime: '15:00',
            },
          },
        ],
      },
    ];

    const ics = generateICalendarData(dailyPlans, classSchedule, '2026-09-21');

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('PRODID:-//Planora//Akilli Ders ve Calisma Planlayici//TR');
    expect(ics).toContain('TZID:Europe/Istanbul');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('SUMMARY:📚 Yapay Zeka');
    expect(ics).toContain('LOCATION:D-302');
    expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=MO;COUNT=16');
    expect(ics).toContain('SUMMARY:⚡ [Çalışma] Yapay Zeka — Vize Hazırlığı');
    expect(ics).toContain('END:VCALENDAR');
  });
});
