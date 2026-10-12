import { describe, it, expect } from 'vitest';
import { calculateRiskScore } from './riskEngine';
import { Task } from '../../types';
import { DEFAULT_SETTINGS } from '../storage';

describe('riskEngine', () => {
  const baseSettings = { ...DEFAULT_SETTINGS };

  it('returns 0 risk for already completed tasks', () => {
    const task: Task = {
      id: 't-1',
      title: 'Bitmiş Ödev',
      course: 'Matematik',
      type: 'assignment',
      dueDate: '2026-10-15',
      estimatedTotalMinutes: 120,
      completionPercentage: 100,
      priority: 'high',
      difficulty: 3,
      isCompleted: true,
      createdAt: '2026-10-01',
    };

    const assessment = calculateRiskScore(task, baseSettings, new Date('2026-10-08'));
    expect(assessment.score).toBe(0);
    expect(assessment.level).toBe('low');
  });

  it('assigns higher risk score when task difficulty is higher', () => {
    // Aynı teslim tarihi, aynı süre, sadece zorluk farklı (1 vs 5)
    const taskEasy: Task = {
      id: 't-easy',
      title: 'Kolay Ödev',
      course: 'Tarih',
      type: 'assignment',
      dueDate: '2026-10-12',
      estimatedTotalMinutes: 120,
      completionPercentage: 0,
      priority: 'medium',
      difficulty: 1,
      isCompleted: false,
      createdAt: '2026-10-01',
    };

    const taskHard: Task = {
      id: 't-hard',
      title: 'Zor Proje',
      course: 'Yapay Zeka',
      type: 'assignment',
      dueDate: '2026-10-12',
      estimatedTotalMinutes: 120,
      completionPercentage: 0,
      priority: 'medium',
      difficulty: 5,
      isCompleted: false,
      createdAt: '2026-10-01',
    };

    const assessmentEasy = calculateRiskScore(taskEasy, baseSettings, new Date('2026-10-08'));
    const assessmentHard = calculateRiskScore(taskHard, baseSettings, new Date('2026-10-08'));

    expect(assessmentHard.score).toBeGreaterThan(assessmentEasy.score);
  });

  it('marks overdue task with maximum risk score 100', () => {
    const overdueTask: Task = {
      id: 't-overdue',
      title: 'Geçmiş Ödev',
      course: 'Fizik',
      type: 'assignment',
      dueDate: '2026-10-05',
      estimatedTotalMinutes: 60,
      completionPercentage: 20,
      priority: 'low',
      difficulty: 2,
      isCompleted: false,
      createdAt: '2026-09-25',
    };

    const assessment = calculateRiskScore(overdueTask, baseSettings, new Date('2026-10-08'));
    expect(assessment.score).toBe(100);
    expect(assessment.level).toBe('critical');
    expect(assessment.isOverdue).toBe(true);
    expect(assessment.warningMessage).toContain('Teslim tarihi');
    expect(assessment.colorHex).toBe('#EF4444');
  });
});
