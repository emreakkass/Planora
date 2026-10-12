import { create } from 'zustand';
import { User, Session } from '../lib/auth/types';
import { authService } from '../lib/auth/authService';
import { defaultStorageAdapter } from '../lib/storage/localStorageAdapter';

interface AuthStoreState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  showMigrationModal: boolean;
  legacyDataCounts: { tasks: number; schedule: number };

  initAuth: () => Promise<void>;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  guestLogin: () => Promise<void>;
  logout: () => Promise<void>;
  migrateLegacyData: () => Promise<boolean>;
  dismissMigrationModal: () => void;
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isGuest: false,
  isLoading: true,
  showMigrationModal: false,
  legacyDataCounts: { tasks: 0, schedule: 0 },

  initAuth: async () => {
    try {
      set({ isLoading: true });
      const session = await authService.getCurrentSession();
      if (session) {
        const user = await authService.getCurrentUser();
        if (user) {
          set({
            user,
            session,
            isAuthenticated: true,
            isGuest: !!user.isGuest,
            isLoading: false,
          });
          return;
        }
      }
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isGuest: false,
        isLoading: false,
      });
    } catch {
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isGuest: false,
        isLoading: false,
      });
    }
  },

  login: async (email, password, rememberMe = true) => {
    try {
      const { user, session } = await authService.login(email, password, rememberMe);
      const hasLegacy = defaultStorageAdapter.hasLegacyData();
      const legacyCounts = hasLegacy ? defaultStorageAdapter.getLegacyDataCount() : { tasks: 0, schedule: 0 };

      set({
        user,
        session,
        isAuthenticated: true,
        isGuest: false,
        showMigrationModal: hasLegacy && legacyCounts.tasks > 0,
        legacyDataCounts: legacyCounts,
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Giriş yapılamadı.' };
    }
  },

  register: async (name, email, password, rememberMe = true) => {
    try {
      await authService.register(name, email, password, rememberMe);
      // Kullanıcı hesabı kalıcı olarak localStorage'a kaydedildi.
      // Doğrudan oturum açmak yerine kayıt onay mesajı ile giriş ekranına yönlendirilir.
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Kayıt oluşturulamadı.' };
    }
  },

  guestLogin: async () => {
    try {
      const { user, session } = await authService.guestLogin();
      set({
        user,
        session,
        isAuthenticated: true,
        isGuest: true,
        showMigrationModal: false,
      });
    } catch (err) {
      console.error('Misafir girişi hatası:', err);
    }
  },

  logout: async () => {
    await authService.logout();
    set({
      user: null,
      session: null,
      isAuthenticated: false,
      isGuest: false,
      showMigrationModal: false,
    });
  },

  migrateLegacyData: async () => {
    const user = get().user;
    if (!user) return false;
    const ok = await defaultStorageAdapter.migrateLegacyDataToUser(user.id);
    set({ showMigrationModal: false });
    return ok;
  },

  dismissMigrationModal: () => {
    set({ showMigrationModal: false });
  },
}));
