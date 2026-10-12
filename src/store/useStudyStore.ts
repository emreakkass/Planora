import { create } from 'zustand';
import {
  Task,
  UserSettings,
  PomodoroSession,
  ClassScheduleItem,
  ActiveTab,
  StreakData,
} from '../types';
import { storageService, DEFAULT_SETTINGS } from '../lib/storage';
import { calculateStudyStreak } from '../lib/analytics/streakCalculator';
import { notifyPomodoroComplete } from '../lib/notifications/notificationService';
import { applyTheme } from '../lib/theme';

interface StudyState {
  tasks: Task[];
  schedule: ClassScheduleItem[];
  settings: UserSettings;
  sessions: PomodoroSession[];
  activeTab: ActiveTab;
  selectedTaskIdForPomodoro: string | null;

  // Filtreleme durumu
  filterCourse: string;
  filterType: string;
  filterPriority: string;
  searchQuery: string;

  // Bildirim mesajı (Toast)
  toastMessage: string | null;

  // Eylemler
  setActiveTab: (tab: ActiveTab) => void;
  setToast: (msg: string | null) => void;
  loadUserData: (userId?: string) => void;

  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompleted: (id: string) => void;
  updateTaskProgress: (id: string, percentage: number) => void;

  addClass: (item: Omit<ClassScheduleItem, 'id'>) => ClassScheduleItem;
  updateClass: (id: string, updates: Partial<ClassScheduleItem>) => void;
  deleteClass: (id: string) => void;

  updateSettings: (updates: Partial<UserSettings>) => void;
  resetSettings: () => void;

  addSession: (session: Omit<PomodoroSession, 'id'>) => void;
  deleteSession: (id: string) => void;

  setSelectedTaskIdForPomodoro: (taskId: string | null) => void;

  setFilterCourse: (course: string) => void;
  setFilterType: (type: string) => void;
  setFilterPriority: (priority: string) => void;
  setSearchQuery: (query: string) => void;

  getStreak: () => StreakData;

  resetToDemoData: () => void;
  clearAllData: () => void;
  importJsonData: (json: string) => { success: boolean; message: string };
}

export const useStudyStore = create<StudyState>((set, get) => {
  const initialTasks = storageService.loadTasks();
  const initialSchedule = storageService.loadSchedule();
  const initialSettings = storageService.loadSettings();
  const initialSessions = storageService.loadSessions();

  return {
    tasks: initialTasks,
    schedule: initialSchedule,
    settings: initialSettings,
    sessions: initialSessions,
    activeTab: 'today',
    selectedTaskIdForPomodoro: initialTasks.length > 0 ? initialTasks[0].id : null,

    filterCourse: 'all',
    filterType: 'all',
    filterPriority: 'all',
    searchQuery: '',
    toastMessage: null,

    setActiveTab: (tab) => set({ activeTab: tab }),

    setToast: (msg) => {
      set({ toastMessage: msg });
      if (msg) {
        setTimeout(() => {
          if (get().toastMessage === msg) {
            set({ toastMessage: null });
          }
        }, 3500);
      }
    },

    loadUserData: (userId) => {
      const tasks = storageService.loadTasks(userId);
      const schedule = storageService.loadSchedule(userId);
      const settings = storageService.loadSettings(userId);
      const sessions = storageService.loadSessions(userId);
      if (settings.theme) {
        applyTheme(settings.theme);
      }
      set({
        tasks,
        schedule,
        settings,
        sessions,
        selectedTaskIdForPomodoro: tasks.length > 0 ? tasks[0].id : null,
      });
    },

    addTask: (taskData) => {
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
        isCompleted: taskData.isCompleted ?? false,
        difficulty: taskData.difficulty || 3,
      };
      const updated = [newTask, ...get().tasks];
      storageService.saveTasks(updated);
      set({ tasks: updated });
      get().setToast(`"${newTask.title}" başarıyla eklendi.`);
      return newTask;
    },

    updateTask: (id, updates) => {
      const updated = get().tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
      storageService.saveTasks(updated);
      set({ tasks: updated });
      get().setToast('Görev güncellendi.');
    },

    deleteTask: (id) => {
      const taskToDelete = get().tasks.find((t) => t.id === id);
      const updated = get().tasks.filter((t) => t.id !== id);
      storageService.saveTasks(updated);
      set({
        tasks: updated,
        selectedTaskIdForPomodoro:
          get().selectedTaskIdForPomodoro === id ? null : get().selectedTaskIdForPomodoro,
      });
      get().setToast(taskToDelete ? `"${taskToDelete.title}" silindi.` : 'Görev silindi.');
    },

    toggleTaskCompleted: (id) => {
      const updated = get().tasks.map((t) => {
        if (t.id === id) {
          const nextState = !t.isCompleted;
          return {
            ...t,
            isCompleted: nextState,
            completionPercentage: nextState ? 100 : Math.min(90, t.completionPercentage),
            completedAt: nextState ? new Date().toISOString() : undefined,
          };
        }
        return t;
      });
      storageService.saveTasks(updated);
      set({ tasks: updated });
      const completedTask = updated.find((t) => t.id === id);
      if (completedTask?.isCompleted) {
        get().setToast(`Tebrikler! "${completedTask.title}" tamamlandı.`);
      }
    },

    updateTaskProgress: (id, percentage) => {
      const p = Math.min(100, Math.max(0, percentage));
      const updated = get().tasks.map((t) => {
        if (t.id === id) {
          const isDone = p >= 100;
          return {
            ...t,
            completionPercentage: p,
            isCompleted: isDone,
            completedAt: isDone ? new Date().toISOString() : undefined,
          };
        }
        return t;
      });
      storageService.saveTasks(updated);
      set({ tasks: updated });
    },

    addClass: (classData) => {
      const newClass: ClassScheduleItem = {
        ...classData,
        id: `class-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      };
      const updated = [...get().schedule, newClass];
      storageService.saveSchedule(updated);
      set({ schedule: updated });
      get().setToast(`"${newClass.course}" ders programına eklendi.`);
      return newClass;
    },

    updateClass: (id, updates) => {
      const updated = get().schedule.map((c) => (c.id === id ? { ...c, ...updates } : c));
      storageService.saveSchedule(updated);
      set({ schedule: updated });
      get().setToast('Ders programı güncellendi.');
    },

    deleteClass: (id) => {
      const updated = get().schedule.filter((c) => c.id !== id);
      storageService.saveSchedule(updated);
      set({ schedule: updated });
      get().setToast('Ders silindi.');
    },

    updateSettings: (updates) => {
      const updated = { ...get().settings, ...updates };
      storageService.saveSettings(updated);
      if (updates.theme) {
        applyTheme(updates.theme);
      }
      set({ settings: updated });
      get().setToast('Ayarlar kaydedildi.');
    },

    resetSettings: () => {
      storageService.saveSettings(DEFAULT_SETTINGS);
      applyTheme(DEFAULT_SETTINGS.theme);
      set({ settings: DEFAULT_SETTINGS });
      get().setToast('Ayarlar varsayılana sıfırlandı.');
    },

    addSession: (sessionData) => {
      const newSession: PomodoroSession = {
        ...sessionData,
        id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      };
      const updatedSessions = [newSession, ...get().sessions];
      storageService.saveSessions(updatedSessions);

      if (sessionData.taskId && sessionData.type === 'focus') {
        const task = get().tasks.find((t) => t.id === sessionData.taskId);
        if (task && !task.isCompleted) {
          const addedProgress = Math.min(
            100,
            task.completionPercentage +
              Math.round(
                (sessionData.durationMinutes / Math.max(60, task.estimatedTotalMinutes)) * 100
              )
          );
          get().updateTaskProgress(task.id, addedProgress);
        }
      }

      set({ sessions: updatedSessions });
      get().setToast(`Pomodoro oturumu kaydedildi (+${newSession.durationMinutes} dk).`);

      // Tarayıcı bildirimi tetikle
      if (get().settings.notificationsEnabled) {
        notifyPomodoroComplete(
          sessionData.type === 'focus' ? 'Odaklanma Seansı' : 'Mola',
          sessionData.taskTitle
        );
      }
    },

    deleteSession: (id) => {
      const updated = get().sessions.filter((s) => s.id !== id);
      storageService.saveSessions(updated);
      set({ sessions: updated });
    },

    setSelectedTaskIdForPomodoro: (taskId) => {
      set({ selectedTaskIdForPomodoro: taskId });
    },

    setFilterCourse: (course) => set({ filterCourse: course }),
    setFilterType: (type) => set({ filterType: type }),
    setFilterPriority: (priority) => set({ filterPriority: priority }),
    setSearchQuery: (query) => set({ searchQuery: query }),

    getStreak: () => {
      return calculateStudyStreak(get().sessions, new Date());
    },

    resetToDemoData: () => {
      const res = storageService.resetToDemo();
      set({
        tasks: res.tasks,
        schedule: res.schedule,
        settings: res.settings,
        sessions: res.sessions,
        selectedTaskIdForPomodoro: res.tasks[0]?.id || null,
      });
      get().setToast('Örnek veriler başarıyla yüklendi.');
    },

    clearAllData: () => {
      storageService.clearAll();
      set({
        tasks: [],
        schedule: [],
        sessions: [],
        selectedTaskIdForPomodoro: null,
      });
      get().setToast('Tüm görev, ders ve oturum kayıtları temizlendi.');
    },

    importJsonData: (jsonStr) => {
      const res = storageService.importAllData(jsonStr);
      if (res.success) {
        set({
          tasks: storageService.loadTasks(),
          schedule: storageService.loadSchedule(),
          settings: storageService.loadSettings(),
          sessions: storageService.loadSessions(),
        });
        get().setToast(res.message);
      }
      return res;
    },
  };
});
