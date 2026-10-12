import { Task, ClassScheduleItem, UserSettings, PomodoroSession } from '../../types';
import { User, Session } from '../auth/types';

/**
 * Planora Veri Katmanı Arayüzü (Storage Adapter Interface)
 * Bugün tarayıcı tabanlı localStorage / sessionStorage çalışır;
 * Yarın Supabase, Firebase veya PostgreSQL backend'ine tek satırla bağlanabilir.
 */
export interface IStorageAdapter {
  // --- Kullanıcı Yönetimi ---
  getUsers(): Promise<User[]>;
  saveUser(user: User): Promise<void>;
  findUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;

  // --- Oturum Yönetimi ---
  getSession(): Promise<Session | null>;
  saveSession(session: Session): Promise<void>;
  clearSession(): Promise<void>;

  // --- Kullanıcıya Özel Veriler ---
  getTasks(userId: string): Promise<Task[]>;
  saveTasks(userId: string, tasks: Task[]): Promise<void>;

  getSchedule(userId: string): Promise<ClassScheduleItem[]>;
  saveSchedule(userId: string, schedule: ClassScheduleItem[]): Promise<void>;

  getSettings(userId: string): Promise<UserSettings>;
  saveSettings(userId: string, settings: UserSettings): Promise<void>;

  getSessions(userId: string): Promise<PomodoroSession[]>;
  saveSessions(userId: string, sessions: PomodoroSession[]): Promise<void>;

  // --- Eski (Üyeliksiz) Veri Migrasyonu ---
  hasLegacyData(): boolean;
  getLegacyDataCount(): { tasks: number; schedule: number };
  migrateLegacyDataToUser(userId: string): Promise<boolean>;

  // --- Sıfırlama ---
  resetUserToDemo(userId: string): Promise<{
    tasks: Task[];
    schedule: ClassScheduleItem[];
    settings: UserSettings;
    sessions: PomodoroSession[];
  }>;
  clearUserData(userId: string): Promise<void>;
}
