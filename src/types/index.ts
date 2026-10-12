export type TaskType = 'exam' | 'assignment' | 'project';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  title: string;
  course: string;
  type: TaskType;
  dueDate: string; // YYYY-MM-DD
  estimatedTotalMinutes: number;
  completionPercentage: number; // 0 - 100
  priority: TaskPriority;
  difficulty: number; // 1 - 5 (Default: 3)
  notes?: string;
  isCompleted: boolean;
  completedAt?: string; // ISO date
  createdAt: string; // ISO date
  courseColor?: string;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskAssessment {
  score: number; // 0 - 100
  level: RiskLevel;
  label: string;
  colorHex: string;
  warningMessage: string;
  remainingMinutes: number;
  remainingDays: number;
  dailyMinutesRequired: number;
  isOverdue: boolean;
  pressureFactor: number;
  difficultyFactor: number;
}

export type WeekType = 'all' | 'A' | 'B';

export interface ClassScheduleItem {
  id: string;
  course: string;
  dayOfWeek: number; // 1: Pazartesi, 2: Salı, 3: Çarşamba, 4: Perşembe, 5: Cuma, 6: Cumartesi, 7: Pazar
  startTime: string; // "HH:mm" e.g. "09:00"
  endTime: string; // "HH:mm" e.g. "10:30"
  classroom?: string; // e.g. "D-204"
  color?: string;
  weekType: WeekType; // 'all' | 'A' | 'B'
  instructor?: string;
}

export interface UserSettings {
  weekdayMinutes: number; // Daily study capacity on weekdays (minutes)
  weekendMinutes: number; // Daily study capacity on weekends (minutes)
  geminiApiKey: string; // Optional user-provided Gemini API key (localStorage only)
  pomodoroFocusMinutes: number;
  pomodoroShortBreakMinutes: number;
  pomodoroLongBreakMinutes: number;
  pomodoroCyclesBeforeLongBreak: number;
  theme: 'dark' | 'light' | 'system';
  soundEnabled: boolean;

  // Yeni Özellik Ayarları
  awakeStartTime: string; // "HH:mm", Varsayılan: "08:00"
  awakeEndTime: string; // "HH:mm", Varsayılan: "23:00"
  abWeekEnabled: boolean; // Varsayılan: true
  termStartDate: string; // "YYYY-MM-DD", Dönem başlangıcı (A/B hafta hesabı için)
  notificationLeadMinutes: number; // Kaç dakika önce bildirim verilsin (Varsayılan: 15)
  notificationsEnabled: boolean;
}

export interface PomodoroSession {
  id: string;
  taskId: string | null;
  taskTitle: string;
  course: string;
  durationMinutes: number;
  completedAt: string; // ISO string
  type: 'focus' | 'short_break' | 'long_break';
}

export interface FreeTimeSlot {
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  durationMinutes: number;
}

export interface DailyPlanItem {
  taskId: string;
  taskTitle: string;
  course: string;
  courseColor: string;
  type: TaskType;
  plannedMinutes: number;
  completedMinutesToday: number;
  priority: TaskPriority;
  difficulty: number;
  riskScore: number;
  riskLevel: RiskLevel;
  dueDate: string;
  isOverdue: boolean;
  remainingMinutesTotal: number;
  timeSlot?: {
    startTime: string; // "HH:mm"
    endTime: string; // "HH:mm"
  };
  isReview?: boolean; // Aralıklı tekrar (Spaced review) oturumu mu?
}

export interface DailyPlan {
  date: string; // YYYY-MM-DD
  dayName: string; // 'Pazartesi', 'Salı', ...
  dayOfWeek: number; // 1-7
  isWeekend: boolean;
  isToday: boolean;
  capacityMinutes: number;
  totalAllocatedMinutes: number;
  items: DailyPlanItem[];
  freeSlots: FreeTimeSlot[];
  totalFreeMinutes: number;
  overcapacity: boolean;
  overcapacityMinutes: number;
  warning?: string;
}

export interface OvercapacityTask {
  task: Task;
  requiredDailyMinutes: number;
  availableDailyMinutes: number;
  deficitMinutes: number;
  dueDate: string;
  remainingDays: number;
}

export interface StudyPlanResult {
  days: DailyPlan[];
  todayPlan: DailyPlan;
  overcapacityTasks: OvercapacityTask[];
  totalBacklogMinutes: number;
  urgentTasksCount: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  hasStudiedToday: boolean;
  lastStudyDate: string | null;
}

export interface WeeklyReportSummary {
  startDate: string;
  endDate: string;
  plannedMinutes: number;
  actualMinutes: number;
  completionRatePercent: number;
  totalSessionsCount: number;
  completedTasksCount: number;
  mostStudiedCourse: { name: string; minutes: number } | null;
  mostDelayedCourse: { name: string; riskScore: number; taskCount: number } | null;
  courseBreakdown: { course: string; minutes: number; percentage: number }[];
  dailyComparison: { date: string; dayName: string; planned: number; actual: number }[];
  eightWeekTrend: { weekLabel: string; minutes: number }[];
  avgEarlyCompletionDays: number;
  recommendations: string[];
  executiveSummary: string;
  isAiGenerated: boolean;
}

export type ActiveTab =
  | 'today'
  | 'tasks'
  | 'schedule'
  | 'planner'
  | 'pomodoro'
  | 'stats'
  | 'report'
  | 'settings';
