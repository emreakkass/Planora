export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // PBKDF2 (SHA-256) hash (hex)
  passwordSalt: string; // Rastgele 16 byte salt (hex)
  createdAt: string; // ISO date
  isGuest?: boolean;
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: number; // Unix timestamp (ms)
  rememberMe: boolean;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
}

export interface PasswordStrength {
  score: number; // 0 - 4
  label: 'Zayıf' | 'Orta' | 'Güçlü' | 'Çok Güçlü';
  color: string;
  percent: number; // 0 - 100
  hints: string[];
}
