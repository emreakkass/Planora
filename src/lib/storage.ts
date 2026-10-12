import { Task, UserSettings, PomodoroSession, ClassScheduleItem } from '../types';

// Planora LocalStorage Keys
const STORAGE_KEYS = {
  TASKS: 'planora_tasks_v1',
  SETTINGS: 'planora_settings_v1',
  SESSIONS: 'planora_sessions_v1',
  SCHEDULE: 'planora_schedule_v1',
  THEME: 'planora_theme_v1',
} as const;

// Legacy StudyFlow Keys for Automatic Migration
const LEGACY_STORAGE_KEYS = {
  TASKS: 'studyflow_tasks_v1',
  SETTINGS: 'studyflow_settings_v1',
  SESSIONS: 'studyflow_sessions_v1',
  THEME: 'studyflow_theme_v1',
} as const;

export const DEFAULT_SETTINGS: UserSettings = {
  weekdayMinutes: 120, // 2 saat hafta içi
  weekendMinutes: 240, // 4 saat hafta sonu
  geminiApiKey: '',
  pomodoroFocusMinutes: 25,
  pomodoroShortBreakMinutes: 5,
  pomodoroLongBreakMinutes: 15,
  pomodoroCyclesBeforeLongBreak: 4,
  theme: 'dark',
  soundEnabled: true,

  // Planora Ayarları
  awakeStartTime: '08:00',
  awakeEndTime: '23:00',
  abWeekEnabled: true,
  termStartDate: '2026-09-21', // 2026-2027 Güz Dönemi
  notificationLeadMinutes: 15,
  notificationsEnabled: false,
};

// Orijinal Ders Renk Paleti (Indigo, Mavi, Zümrüt, Mor, Pembe, Kehribar, Camgöbeği)
export const COURSE_PALETTE: Record<string, string> = {
  'Web Programlama': '#6366F1', // Indigo
  'Veri Yapıları': '#3B82F6',    // Blue
  'Matematik': '#10B981',        // Emerald
  'Yapay Zeka': '#8B5CF6',       // Purple
  'İşletim Sistemleri': '#EC4899', // Pink
  'Veritabanı Sistemleri': '#F59E0B', // Amber
  'Algoritmalar': '#06B6D4',     // Cyan
};

export function getCourseColor(courseName: string): string {
  if (COURSE_PALETTE[courseName]) {
    return COURSE_PALETTE[courseName];
  }
  let hash = 0;
  for (let i = 0; i < courseName.length; i++) {
    hash = courseName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#6366F1',
    '#3B82F6',
    '#10B981',
    '#8B5CF6',
    '#EC4899',
    '#F59E0B',
    '#06B6D4',
    '#14B8A6',
    '#64748B',
  ];
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Otomatik Veri Migrasyonu:
 * Eski "studyflow_*" anahtarlarındaki verileri "planora_*" anahtarlarına taşır.
 */
function runStorageMigration(): void {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    if (!localStorage.getItem(STORAGE_KEYS.TASKS) && localStorage.getItem(LEGACY_STORAGE_KEYS.TASKS)) {
      const old = localStorage.getItem(LEGACY_STORAGE_KEYS.TASKS);
      if (old) localStorage.setItem(STORAGE_KEYS.TASKS, old);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS) && localStorage.getItem(LEGACY_STORAGE_KEYS.SETTINGS)) {
      const old = localStorage.getItem(LEGACY_STORAGE_KEYS.SETTINGS);
      if (old) localStorage.setItem(STORAGE_KEYS.SETTINGS, old);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SESSIONS) && localStorage.getItem(LEGACY_STORAGE_KEYS.SESSIONS)) {
      const old = localStorage.getItem(LEGACY_STORAGE_KEYS.SESSIONS);
      if (old) localStorage.setItem(STORAGE_KEYS.SESSIONS, old);
    }
  } catch (e) {
    console.debug('Migrasyon kontrolü sırasında hata:', e);
  }
}

// Uygulama başlarken migrasyonu çalıştır
runStorageMigration();

export function getDemoTasks(): Task[] {
  return [
    {
      id: 'task-1',
      title: 'Dönem Sonu Web Projesi (E-Ticaret Mimarisi)',
      course: 'Web Programlama',
      type: 'project',
      dueDate: '2026-10-18',
      estimatedTotalMinutes: 300,
      completionPercentage: 40,
      priority: 'critical',
      difficulty: 4,
      notes: 'Frontend bileşenleri tamamlandı, REST API entegrasyonu ve sepet mantığı kaldı.',
      isCompleted: false,
      createdAt: '2026-10-01T10:00:00.000Z',
      courseColor: '#6366F1',
    },
    {
      id: 'task-2',
      title: 'Vize Sınavı Hazırlığı (Ağaçlar & Graf Algoritmaları)',
      course: 'Veri Yapıları',
      type: 'exam',
      dueDate: '2026-10-20',
      estimatedTotalMinutes: 360,
      completionPercentage: 20,
      priority: 'high',
      difficulty: 5,
      notes: 'AVL Trees, B-Trees ve Dijkstra algoritması soru çözümleri yapılacak.',
      isCompleted: false,
      createdAt: '2026-10-02T11:00:00.000Z',
      courseColor: '#3B82F6',
    },
    {
      id: 'task-3',
      title: 'Ara Sınav (Lineer Cebir & Matris Analizi)',
      course: 'Matematik',
      type: 'exam',
      dueDate: '2026-10-24',
      estimatedTotalMinutes: 240,
      completionPercentage: 10,
      priority: 'medium',
      difficulty: 4,
      notes: 'Özdeğerler, özvektörler ve determinant konuları tekrar edilecek.',
      isCompleted: false,
      createdAt: '2026-10-03T12:00:00.000Z',
      courseColor: '#10B981',
    },
    {
      id: 'task-4',
      title: 'Süreç Yönetimi & Bellek Tahsis Laboratuvarı',
      course: 'İşletim Sistemleri',
      type: 'assignment',
      dueDate: '2026-10-27',
      estimatedTotalMinutes: 180,
      completionPercentage: 0,
      priority: 'medium',
      difficulty: 3,
      notes: 'Fork ve pthread kütüphaneleri ile C simülasyonu yazılacak.',
      isCompleted: false,
      createdAt: '2026-10-04T09:00:00.000Z',
      courseColor: '#EC4899',
    },
    {
      id: 'task-5',
      title: 'İlişkisel Şema Tasarımı & SQL Sorgu Ödevi',
      course: 'Veritabanı Sistemleri',
      type: 'assignment',
      dueDate: '2026-10-12',
      estimatedTotalMinutes: 120,
      completionPercentage: 100,
      priority: 'medium',
      difficulty: 3,
      notes: '3NF normalizasyon ve indeks optimizasyonu tamamlandı.',
      isCompleted: true,
      completedAt: '2026-10-07T16:30:00.000Z',
      createdAt: '2026-10-02T08:00:00.000Z',
      courseColor: '#F59E0B',
    },
  ];
}

export function getDemoSchedule(): ClassScheduleItem[] {
  return [
    {
      id: 'class-1',
      course: 'Web Programlama',
      dayOfWeek: 1, // Pazartesi
      startTime: '09:00',
      endTime: '11:30',
      classroom: 'D-204',
      color: '#6366F1',
      weekType: 'all',
      instructor: 'Prof. Dr. Ahmet Yılmaz',
    },
    {
      id: 'class-2',
      course: 'Algoritmalar',
      dayOfWeek: 1, // Pazartesi
      startTime: '13:00',
      endTime: '15:30',
      classroom: 'Amfi-1',
      color: '#06B6D4',
      weekType: 'all',
      instructor: 'Doç. Dr. Selin Kaya',
    },
    {
      id: 'class-3',
      course: 'Veri Yapıları',
      dayOfWeek: 2, // Salı
      startTime: '10:00',
      endTime: '12:30',
      classroom: 'D-302',
      color: '#3B82F6',
      weekType: 'all',
      instructor: 'Dr. Öğr. Üyesi Mehmet Demir',
    },
    {
      id: 'class-4',
      course: 'Matematik',
      dayOfWeek: 3, // Çarşamba
      startTime: '09:00',
      endTime: '12:00',
      classroom: 'Amfi-2',
      color: '#10B981',
      weekType: 'all',
      instructor: 'Prof. Dr. Fatma Çelik',
    },
    {
      id: 'class-5',
      course: 'İşletim Sistemleri',
      dayOfWeek: 4, // Perşembe
      startTime: '13:30',
      endTime: '16:00',
      classroom: 'D-105',
      color: '#EC4899',
      weekType: 'A', // A Haftası
      instructor: 'Doç. Dr. Emre Arslan',
    },
    {
      id: 'class-6',
      course: 'Veritabanı Sistemleri',
      dayOfWeek: 5, // Cuma
      startTime: '10:00',
      endTime: '12:30',
      classroom: 'Lab-3',
      color: '#F59E0B',
      weekType: 'all',
      instructor: 'Öğr. Gör. Canan Şahin',
    },
  ];
}

export function getDemoSessions(): PomodoroSession[] {
  return [
    {
      id: 'sess-1',
      taskId: 'task-1',
      taskTitle: 'Dönem Sonu Web Projesi (E-Ticaret Mimarisi)',
      course: 'Web Programlama',
      durationMinutes: 25,
      completedAt: '2026-10-07T14:25:00.000Z',
      type: 'focus',
    },
    {
      id: 'sess-2',
      taskId: 'task-1',
      taskTitle: 'Dönem Sonu Web Projesi (E-Ticaret Mimarisi)',
      course: 'Web Programlama',
      durationMinutes: 25,
      completedAt: '2026-10-07T15:00:00.000Z',
      type: 'focus',
    },
    {
      id: 'sess-3',
      taskId: 'task-2',
      taskTitle: 'Vize Sınavı Hazırlığı (Ağaçlar & Graf Algoritmaları)',
      course: 'Veri Yapıları',
      durationMinutes: 25,
      completedAt: '2026-10-07T16:15:00.000Z',
      type: 'focus',
    },
    {
      id: 'sess-4',
      taskId: 'task-5',
      taskTitle: 'İlişkisel Şema Tasarımı & SQL Sorgu Ödevi',
      course: 'Veritabanı Sistemleri',
      durationMinutes: 25,
      completedAt: '2026-10-06T18:00:00.000Z',
      type: 'focus',
    },
    {
      id: 'sess-5',
      taskId: 'task-5',
      taskTitle: 'İlişkisel Şema Tasarımı & SQL Sorgu Ödevi',
      course: 'Veritabanı Sistemleri',
      durationMinutes: 25,
      completedAt: '2026-10-05T18:35:00.000Z',
      type: 'focus',
    },
    {
      id: 'sess-6',
      taskId: 'task-3',
      taskTitle: 'Ara Sınav (Lineer Cebir & Matris Analizi)',
      course: 'Matematik',
      durationMinutes: 25,
      completedAt: '2026-10-04T11:20:00.000Z',
      type: 'focus',
    },
    {
      id: 'sess-7',
      taskId: 'task-2',
      taskTitle: 'Vize Sınavı Hazırlığı (Ağaçlar & Graf Algoritmaları)',
      course: 'Veri Yapıları',
      durationMinutes: 25,
      completedAt: '2026-10-03T17:00:00.000Z',
      type: 'focus',
    },
  ];
}

function resolveStorageKey(baseKey: string, userId?: string): string {
  if (userId) {
    return `planora_user_${userId}_${baseKey.replace('planora_', '')}`;
  }
  try {
    const raw = sessionStorage.getItem('planora_auth_session_v1') || localStorage.getItem('planora_auth_session_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.userId) {
        return `planora_user_${parsed.userId}_${baseKey.replace('planora_', '')}`;
      }
    }
  } catch {}
  return baseKey;
}

export const storageService = {
  loadTasks(userId?: string): Task[] {
    try {
      const key = resolveStorageKey(STORAGE_KEYS.TASKS, userId);
      let raw = localStorage.getItem(key);
      if (!raw && key !== STORAGE_KEYS.TASKS) {
        // Fallback to legacy single-user key if user-specific is not yet initialized
        raw = localStorage.getItem(STORAGE_KEYS.TASKS);
      }
      if (!raw) {
        const demo = getDemoTasks();
        this.saveTasks(demo, userId);
        return demo;
      }
      const parsed: Task[] = JSON.parse(raw);
      return parsed.map((t) => ({
        ...t,
        difficulty: typeof t.difficulty === 'number' ? t.difficulty : 3,
      }));
    } catch {
      return getDemoTasks();
    }
  },

  saveTasks(tasks: Task[], userId?: string): void {
    try {
      const key = resolveStorageKey(STORAGE_KEYS.TASKS, userId);
      localStorage.setItem(key, JSON.stringify(tasks));
    } catch (e) {
      console.error('Görevler kaydedilirken hata oluştu:', e);
    }
  },

  loadSchedule(userId?: string): ClassScheduleItem[] {
    try {
      const key = resolveStorageKey(STORAGE_KEYS.SCHEDULE, userId);
      let raw = localStorage.getItem(key);
      if (!raw && key !== STORAGE_KEYS.SCHEDULE) {
        raw = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
      }
      if (!raw) {
        const demo = getDemoSchedule();
        this.saveSchedule(demo, userId);
        return demo;
      }
      return JSON.parse(raw);
    } catch {
      return getDemoSchedule();
    }
  },

  saveSchedule(schedule: ClassScheduleItem[], userId?: string): void {
    try {
      const key = resolveStorageKey(STORAGE_KEYS.SCHEDULE, userId);
      localStorage.setItem(key, JSON.stringify(schedule));
    } catch (e) {
      console.error('Ders programı kaydedilirken hata oluştu:', e);
    }
  },

  loadSettings(userId?: string): UserSettings {
    try {
      const key = resolveStorageKey(STORAGE_KEYS.SETTINGS, userId);
      let raw = localStorage.getItem(key);
      if (!raw && key !== STORAGE_KEYS.SETTINGS) {
        raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      }
      if (!raw) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: UserSettings, userId?: string): void {
    try {
      const key = resolveStorageKey(STORAGE_KEYS.SETTINGS, userId);
      localStorage.setItem(key, JSON.stringify(settings));
    } catch (e) {
      console.error('Ayarlar kaydedilirken hata oluştu:', e);
    }
  },

  loadSessions(userId?: string): PomodoroSession[] {
    try {
      const key = resolveStorageKey(STORAGE_KEYS.SESSIONS, userId);
      let raw = localStorage.getItem(key);
      if (!raw && key !== STORAGE_KEYS.SESSIONS) {
        raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      }
      if (!raw) {
        const demo = getDemoSessions();
        this.saveSessions(demo, userId);
        return demo;
      }
      return JSON.parse(raw);
    } catch {
      return getDemoSessions();
    }
  },

  saveSessions(sessions: PomodoroSession[], userId?: string): void {
    try {
      const key = resolveStorageKey(STORAGE_KEYS.SESSIONS, userId);
      localStorage.setItem(key, JSON.stringify(sessions));
    } catch (e) {
      console.error('Oturumlar kaydedilirken hata oluştu:', e);
    }
  },

  exportAllData(userId?: string): string {
    const data = {
      appName: 'Planora',
      version: '2.0',
      exportDate: new Date().toISOString(),
      tasks: this.loadTasks(userId),
      schedule: this.loadSchedule(userId),
      settings: this.loadSettings(userId),
      sessions: this.loadSessions(userId),
    };
    return JSON.stringify(data, null, 2);
  },

  importAllData(jsonString: string, userId?: string): { success: boolean; message: string; tasksCount?: number } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
        return { success: false, message: 'Geçersiz veri formatı: "tasks" listesi bulunamadı.' };
      }

      const formattedTasks: Task[] = parsed.tasks.map((t: Partial<Task> & { id?: string; title?: string }) => ({
        id: t.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: t.title || 'Başlıksız Görev',
        course: t.course || 'Genel Ders',
        type: t.type || 'assignment',
        dueDate: t.dueDate || new Date().toISOString().split('T')[0],
        estimatedTotalMinutes: t.estimatedTotalMinutes || 120,
        completionPercentage: t.completionPercentage || 0,
        priority: t.priority || 'medium',
        difficulty: typeof t.difficulty === 'number' ? t.difficulty : 3,
        notes: t.notes,
        isCompleted: t.isCompleted ?? false,
        createdAt: t.createdAt || new Date().toISOString(),
        courseColor: t.courseColor || getCourseColor(t.course || 'Genel Ders'),
      }));

      this.saveTasks(formattedTasks, userId);

      if (parsed.schedule && Array.isArray(parsed.schedule)) {
        this.saveSchedule(parsed.schedule, userId);
      }
      if (parsed.settings) {
        this.saveSettings({ ...DEFAULT_SETTINGS, ...parsed.settings }, userId);
      }
      if (parsed.sessions && Array.isArray(parsed.sessions)) {
        this.saveSessions(parsed.sessions, userId);
      }

      return {
        success: true,
        message: `${formattedTasks.length} adet görev ve ilgili veriler Planora'ya başarıyla aktarıldı.`,
        tasksCount: formattedTasks.length,
      };
    } catch {
      return { success: false, message: 'JSON formatı çözümlenemedi veya dosya bozuk.' };
    }
  },

  resetToDemo(userId?: string): {
    tasks: Task[];
    schedule: ClassScheduleItem[];
    settings: UserSettings;
    sessions: PomodoroSession[];
  } {
    const tasks = getDemoTasks();
    const schedule = getDemoSchedule();
    const settings = DEFAULT_SETTINGS;
    const sessions = getDemoSessions();
    this.saveTasks(tasks, userId);
    this.saveSchedule(schedule, userId);
    this.saveSettings(settings, userId);
    this.saveSessions(sessions, userId);
    return { tasks, schedule, settings, sessions };
  },

  clearAll(userId?: string): void {
    const taskKey = resolveStorageKey(STORAGE_KEYS.TASKS, userId);
    const settingsKey = resolveStorageKey(STORAGE_KEYS.SETTINGS, userId);
    const sessionsKey = resolveStorageKey(STORAGE_KEYS.SESSIONS, userId);
    const scheduleKey = resolveStorageKey(STORAGE_KEYS.SCHEDULE, userId);

    localStorage.removeItem(taskKey);
    localStorage.removeItem(settingsKey);
    localStorage.removeItem(sessionsKey);
    localStorage.removeItem(scheduleKey);

    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.SCHEDULE);
    localStorage.removeItem(LEGACY_STORAGE_KEYS.TASKS);
    localStorage.removeItem(LEGACY_STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(LEGACY_STORAGE_KEYS.SESSIONS);
  },
};
