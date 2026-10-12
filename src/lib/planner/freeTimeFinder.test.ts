import { describe, it, expect } from 'vitest';
import {
  calculateFreeTimeSlots,
  getCurrentWeekType,
  timeStringToMinutes,
  minutesToTimeString,
} from './freeTimeFinder';
import { ClassScheduleItem } from '../../types';

describe('freeTimeFinder', () => {
  it('converts time strings to minutes and vice versa', () => {
    expect(timeStringToMinutes('00:00')).toBe(0);
    expect(timeStringToMinutes('08:30')).toBe(510);
    expect(timeStringToMinutes('23:15')).toBe(1395);

    expect(minutesToTimeString(0)).toBe('00:00');
    expect(minutesToTimeString(510)).toBe('08:30');
    expect(minutesToTimeString(1395)).toBe('23:15');
  });

  it('determines week type A or B correctly based on term start date', () => {
    // 2026-09-21 Pazartesi -> Hafta A
    const weekA = new Date('2026-09-21T10:00:00');
    expect(getCurrentWeekType(weekA, '2026-09-21')).toBe('A');

    // 2026-09-28 Pazartesi (1 hafta sonra) -> Hafta B
    const weekB = new Date('2026-09-28T10:00:00');
    expect(getCurrentWeekType(weekB, '2026-09-21')).toBe('B');

    // 2026-10-05 Pazartesi (2 hafta sonra) -> Hafta A
    const weekA2 = new Date('2026-10-05T10:00:00');
    expect(getCurrentWeekType(weekA2, '2026-09-21')).toBe('A');
  });

  it('calculates free time slots eliminating slots shorter than minBlockMinutes (15 min)', () => {
    // Pazartesi günü için ders: 10:00 - 12:00 ve 12:10 - 14:00 (arada 10 dk boşluk var, elenmeli!)
    const schedule: ClassScheduleItem[] = [
      {
        id: 'cls-1',
        course: 'Matematik',
        dayOfWeek: 1, // Pazartesi
        startTime: '10:00',
        endTime: '12:00',
        weekType: 'all',
      },
      {
        id: 'cls-2',
        course: 'Fizik',
        dayOfWeek: 1, // Pazartesi
        startTime: '12:10',
        endTime: '14:00',
        weekType: 'all',
      },
    ];

    // 2026-09-21 Pazartesi
    const monday = new Date('2026-09-21T09:00:00');

    const slots = calculateFreeTimeSlots({
      date: monday,
      schedule,
      awakeStart: '08:00',
      awakeEnd: '20:00',
      abWeekEnabled: false,
      minBlockMinutes: 15,
    });

    // Beklenen slotlar:
    // 1) 08:00 - 10:00 (120 dk >= 15 dk) -> VAR
    // 2) 12:00 - 12:10 (10 dk < 15 dk) -> ELENMELİ!
    // 3) 14:00 - 20:00 (360 dk >= 15 dk) -> VAR
    expect(slots).toHaveLength(2);
    expect(slots[0]).toEqual({
      startTime: '08:00',
      endTime: '10:00',
      durationMinutes: 120,
    });
    expect(slots[1]).toEqual({
      startTime: '14:00',
      endTime: '20:00',
      durationMinutes: 360,
    });
  });

  it('handles completely free day when no classes exist', () => {
    const sunday = new Date('2026-09-27T10:00:00');
    const slots = calculateFreeTimeSlots({
      date: sunday,
      schedule: [],
      awakeStart: '09:00',
      awakeEnd: '22:00',
    });

    expect(slots).toHaveLength(1);
    expect(slots[0]).toEqual({
      startTime: '09:00',
      endTime: '22:00',
      durationMinutes: 780,
    });
  });

  it('respects A/B week filtering', () => {
    // 2026-09-21 Pazartesi -> Hafta A
    const monday = new Date('2026-09-21T10:00:00');
    const schedule: ClassScheduleItem[] = [
      {
        id: 'cls-b-only',
        course: 'Laboratuvar',
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '12:00',
        weekType: 'B', // Hafta B'de var, Hafta A'da yok
      },
    ];

    const slots = calculateFreeTimeSlots({
      date: monday,
      schedule,
      awakeStart: '08:00',
      awakeEnd: '14:00',
      abWeekEnabled: true,
      termStartDate: '2026-09-21',
    });

    // B haftası dersi Hafta A'da görünmemeli, dolayısıyla 08:00-14:00 tek parça boş olmalı
    expect(slots).toHaveLength(1);
    expect(slots[0].startTime).toBe('08:00');
    expect(slots[0].endTime).toBe('14:00');
  });
});
