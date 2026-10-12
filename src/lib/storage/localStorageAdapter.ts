import { Task, ClassScheduleItem, UserSettings, PomodoroSession } from '../../types';
import { User, Session } from '../auth/types';
import { IStorageAdapter } from './adapter';
import { DEFAULT_SETTINGS, getDemoTasks, getDemoSchedule, getDemoSessions } from '../storage';

export const USERS_KEY = 'planora_auth_users_v1';
export const SESSION_KEY = 'planora_auth_session_v1';

// Legacy keys for user accounts and data backwards-compatibility
export const LEGACY_USER_KEYS = [
  'planora_auth_users',
  'planora_users_v1',
  'planora_users',
  'studyflow_auth_users',
  'studyflow_users',
  'users',
] as const;

/**
 * E-posta adresini baştaki/sondaki boşlukları temizleyerek ve küçük harfe çevirerek normalize eder.
 */
export function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

// Legacy keys from previous single-user or StudyFlow iterations
const LEGACY_KEYS = {
  PLANORA_TASKS: 'planora_tasks_v1',
  PLANORA_SCHEDULE: 'planora_schedule_v1',
  PLANORA_SETTINGS: 'planora_settings_v1',
  PLANORA_SESSIONS: 'planora_sessions_v1',
  STUDYFLOW_TASKS: 'studyflow_tasks_v1',
  STUDYFLOW_SETTINGS: 'studyflow_settings_v1',
  STUDYFLOW_SESSIONS: 'studyflow_sessions_v1',
} as const;

export class LocalStorageAdapter implements IStorageAdapter {
  private getUserKey(userId: string, resource: 'tasks' | 'schedule' | 'settings' | 'sessions'): string {
    return `planora_user_${userId}_${resource}_v1`;
  }

  // --- Kullanıcı Yönetimi ---
  async getUsers(): Promise<User[]> {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      let users: User[] = [];
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            users = parsed;
          }
        } catch {
          users = [];
        }
      }

      // Geriye dönük uyumluluk: Eski anahtarlarla saklanmış olabilecek kullanıcıları tara ve birleştir
      let mergedFromLegacy = false;
      for (const legacyKey of LEGACY_USER_KEYS) {
        try {
          const legRaw = localStorage.getItem(legacyKey);
          if (legRaw) {
            const parsed = JSON.parse(legRaw);
            if (Array.isArray(parsed)) {
              for (const u of parsed) {
                if (u && (u.email || u.id)) {
                  const normEmail = normalizeEmail(u.email);
                  const exists = users.some(
                    (existing) => existing.id === u.id || normalizeEmail(existing.email) === normEmail
                  );
                  if (!exists) {
                    users.push({
                      ...u,
                      email: normEmail,
                    });
                    mergedFromLegacy = true;
                  }
                }
              }
            }
          }
        } catch {}
      }

      // Tüm kullanıcıların e-posta alanlarını normalize et
      users = users.map((u) => ({
        ...u,
        email: normalizeEmail(u.email),
      }));

      // Eğer eski anahtardan veri aktarıldıysa kalıcı USERS_KEY'e yaz
      if (mergedFromLegacy && users.length > 0) {
        const serialized = JSON.stringify(users);
        localStorage.setItem(USERS_KEY, serialized);
        localStorage.setItem('planora_auth_users', serialized);
      }

      return users;
    } catch {
      return [];
    }
  }

  async saveUser(user: User): Promise<void> {
    const normalizedEmail = normalizeEmail(user.email);
    const cleanUser: User = {
      ...user,
      email: normalizedEmail,
    };
    const users = await this.getUsers();
    const existingIndex = users.findIndex(
      (u) => u.id === cleanUser.id || normalizeEmail(u.email) === normalizedEmail
    );
    if (existingIndex >= 0) {
      users[existingIndex] = cleanUser;
    } else {
      users.push(cleanUser);
    }
    const serialized = JSON.stringify(users);
    localStorage.setItem(USERS_KEY, serialized);
    // Geriye dönük uyumluluk ve güvenilirlik için yedek anahtara da yaz
    localStorage.setItem('planora_auth_users', serialized);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const normalized = normalizeEmail(email);
    if (!normalized) return null;
    const users = await this.getUsers();
    return users.find((u) => normalizeEmail(u.email) === normalized) || null;
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find((u) => u.id === id) || null;
  }

  // --- Oturum Yönetimi ---
  async getSession(): Promise<Session | null> {
    try {
      // Önce sessionStorage, sonra localStorage kontrol et
      const sessionRaw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
      if (!sessionRaw) return null;

      const session: Session = JSON.parse(sessionRaw);
      // Süre dolmuş mu kontrolü
      if (Date.now() > session.expiresAt) {
        await this.clearSession();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  async saveSession(session: Session): Promise<void> {
    const data = JSON.stringify(session);
    if (session.rememberMe) {
      localStorage.setItem(SESSION_KEY, data);
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, data);
      localStorage.removeItem(SESSION_KEY);
    }
  }

  async clearSession(): Promise<void> {
    // Çıkış işleminde SADECE oturum verisi silinir; kayıtlı kullanıcılar ve hesaplar kesinlikle korunur
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('planora_auth_session');
    localStorage.removeItem('planora_auth_session');
  }

  // --- Kullanıcıya Özel Görevler ---
  async getTasks(userId: string): Promise<Task[]> {
    try {
      const key = this.getUserKey(userId, 'tasks');
      const raw = localStorage.getItem(key);
      if (!raw) {
        // Yeni kullanıcı için örnek verileri yükle
        const demo = getDemoTasks();
        await this.saveTasks(userId, demo);
        return demo;
      }
      const tasks: Task[] = JSON.parse(raw);
      return tasks.map((t) => ({
        ...t,
        difficulty: typeof t.difficulty === 'number' ? t.difficulty : 3,
      }));
    } catch {
      return getDemoTasks();
    }
  }

  async saveTasks(userId: string, tasks: Task[]): Promise<void> {
    try {
      localStorage.setItem(this.getUserKey(userId, 'tasks'), JSON.stringify(tasks));
    } catch (e) {
      console.error('Görevler kaydedilemedi:', e);
    }
  }

  // --- Kullanıcıya Özel Ders Programı ---
  async getSchedule(userId: string): Promise<ClassScheduleItem[]> {
    try {
      const key = this.getUserKey(userId, 'schedule');
      const raw = localStorage.getItem(key);
      if (!raw) {
        const demo = getDemoSchedule();
        await this.saveSchedule(userId, demo);
        return demo;
      }
      return JSON.parse(raw);
    } catch {
      return getDemoSchedule();
    }
  }

  async saveSchedule(userId: string, schedule: ClassScheduleItem[]): Promise<void> {
    try {
      localStorage.setItem(this.getUserKey(userId, 'schedule'), JSON.stringify(schedule));
    } catch (e) {
      console.error('Ders programı kaydedilemedi:', e);
    }
  }

  // --- Kullanıcıya Özel Ayarlar ---
  async getSettings(userId: string): Promise<UserSettings> {
    try {
      const key = this.getUserKey(userId, 'settings');
      const raw = localStorage.getItem(key);
      if (!raw) {
        return DEFAULT_SETTINGS;
      }
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  async saveSettings(userId: string, settings: UserSettings): Promise<void> {
    try {
      localStorage.setItem(this.getUserKey(userId, 'settings'), JSON.stringify(settings));
    } catch (e) {
      console.error('Ayarlar kaydedilemedi:', e);
    }
  }

  // --- Kullanıcıya Özel Pomodoro Oturumları ---
  async getSessions(userId: string): Promise<PomodoroSession[]> {
    try {
      const key = this.getUserKey(userId, 'sessions');
      const raw = localStorage.getItem(key);
      if (!raw) {
        const demo = getDemoSessions();
        await this.saveSessions(userId, demo);
        return demo;
      }
      return JSON.parse(raw);
    } catch {
      return getDemoSessions();
    }
  }

  async saveSessions(userId: string, sessions: PomodoroSession[]): Promise<void> {
    try {
      localStorage.setItem(this.getUserKey(userId, 'sessions'), JSON.stringify(sessions));
    } catch (e) {
      console.error('Oturumlar kaydedilemedi:', e);
    }
  }

  // --- Eski Üyeliksiz Dönem Verisi Kontrolü ve Taşıma ---
  hasLegacyData(): boolean {
    const rawTasks = localStorage.getItem(LEGACY_KEYS.PLANORA_TASKS) || localStorage.getItem(LEGACY_KEYS.STUDYFLOW_TASKS);
    if (!rawTasks) return false;
    try {
      const parsed = JSON.parse(rawTasks);
      return Array.isArray(parsed) && parsed.length > 0;
    } catch {
      return false;
    }
  }

  getLegacyDataCount(): { tasks: number; schedule: number } {
    let tasks = 0;
    let schedule = 0;
    try {
      const rawTasks = localStorage.getItem(LEGACY_KEYS.PLANORA_TASKS) || localStorage.getItem(LEGACY_KEYS.STUDYFLOW_TASKS);
      if (rawTasks) tasks = JSON.parse(rawTasks).length;
      const rawSched = localStorage.getItem(LEGACY_KEYS.PLANORA_SCHEDULE);
      if (rawSched) schedule = JSON.parse(rawSched).length;
    } catch {}
    return { tasks, schedule };
  }

  async migrateLegacyDataToUser(userId: string): Promise<boolean> {
    try {
      const rawTasks = localStorage.getItem(LEGACY_KEYS.PLANORA_TASKS) || localStorage.getItem(LEGACY_KEYS.STUDYFLOW_TASKS);
      const rawSchedule = localStorage.getItem(LEGACY_KEYS.PLANORA_SCHEDULE);
      const rawSettings = localStorage.getItem(LEGACY_KEYS.PLANORA_SETTINGS) || localStorage.getItem(LEGACY_KEYS.STUDYFLOW_SETTINGS);
      const rawSessions = localStorage.getItem(LEGACY_KEYS.PLANORA_SESSIONS) || localStorage.getItem(LEGACY_KEYS.STUDYFLOW_SESSIONS);

      if (rawTasks) {
        localStorage.setItem(this.getUserKey(userId, 'tasks'), rawTasks);
      }
      if (rawSchedule) {
        localStorage.setItem(this.getUserKey(userId, 'schedule'), rawSchedule);
      }
      if (rawSettings) {
        localStorage.setItem(this.getUserKey(userId, 'settings'), rawSettings);
      }
      if (rawSessions) {
        localStorage.setItem(this.getUserKey(userId, 'sessions'), rawSessions);
      }

      // Taşındıktan sonra eski anahtarları temizle ki tekrar sorulmasın
      localStorage.removeItem(LEGACY_KEYS.PLANORA_TASKS);
      localStorage.removeItem(LEGACY_KEYS.PLANORA_SCHEDULE);
      localStorage.removeItem(LEGACY_KEYS.PLANORA_SETTINGS);
      localStorage.removeItem(LEGACY_KEYS.PLANORA_SESSIONS);
      localStorage.removeItem(LEGACY_KEYS.STUDYFLOW_TASKS);
      localStorage.removeItem(LEGACY_KEYS.STUDYFLOW_SETTINGS);
      localStorage.removeItem(LEGACY_KEYS.STUDYFLOW_SESSIONS);

      return true;
    } catch (e) {
      console.error('Migrasyon hatası:', e);
      return false;
    }
  }

  // --- Sıfırlama ---
  async resetUserToDemo(userId: string): Promise<{
    tasks: Task[];
    schedule: ClassScheduleItem[];
    settings: UserSettings;
    sessions: PomodoroSession[];
  }> {
    const tasks = getDemoTasks();
    const schedule = getDemoSchedule();
    const settings = DEFAULT_SETTINGS;
    const sessions = getDemoSessions();

    await this.saveTasks(userId, tasks);
    await this.saveSchedule(userId, schedule);
    await this.saveSettings(userId, settings);
    await this.saveSessions(userId, sessions);

    return { tasks, schedule, settings, sessions };
  }

  async clearUserData(userId: string): Promise<void> {
    localStorage.removeItem(this.getUserKey(userId, 'tasks'));
    localStorage.removeItem(this.getUserKey(userId, 'schedule'));
    localStorage.removeItem(this.getUserKey(userId, 'settings'));
    localStorage.removeItem(this.getUserKey(userId, 'sessions'));
  }
}

export const defaultStorageAdapter = new LocalStorageAdapter();
