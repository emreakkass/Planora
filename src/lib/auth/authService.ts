import { User, Session } from './types';
import { generateSalt, hashPassword, verifyPassword, generateToken } from './crypto';
import { IStorageAdapter } from '../storage/adapter';
import { defaultStorageAdapter, normalizeEmail } from '../storage/localStorageAdapter';

export class AuthService {
  private adapter: IStorageAdapter;

  constructor(adapter: IStorageAdapter = defaultStorageAdapter) {
    this.adapter = adapter;
  }

  setAdapter(adapter: IStorageAdapter) {
    this.adapter = adapter;
  }

  getAdapter(): IStorageAdapter {
    return this.adapter;
  }

  /**
   * Yeni kullanıcı kaydı oluşturur.
   */
  async register(
    name: string,
    email: string,
    password: string,
    rememberMe: boolean = true
  ): Promise<{ user: User; session: Session }> {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      throw new Error('Lütfen geçerli bir e-posta adresi girin.');
    }

    const existing = await this.adapter.findUserByEmail(normalizedEmail);
    if (existing) {
      throw new Error('Bu e-posta adresi ile kayıtlı bir hesap zaten var.');
    }

    if (password.length < 8) {
      throw new Error('Şifre en az 8 karakter uzunluğunda olmalıdır.');
    }

    const salt = generateSalt(16);
    const passwordHash = await hashPassword(password, salt);

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      passwordSalt: salt,
      createdAt: new Date().toISOString(),
      isGuest: false,
    };

    await this.adapter.saveUser(newUser);

    // Oturum süresi: Beni hatırla ise 30 gün, değilse 1 gün
    const durationMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const session: Session = {
      token: generateToken(32),
      userId: newUser.id,
      expiresAt: Date.now() + durationMs,
      rememberMe,
    };

    return { user: newUser, session };
  }

  /**
   * E-posta ve şifre ile giriş yapar.
   */
  async login(
    email: string,
    password: string,
    rememberMe: boolean = true
  ): Promise<{ user: User; session: Session }> {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      throw new Error('Lütfen e-posta adresinizi girin.');
    }

    const user = await this.adapter.findUserByEmail(normalizedEmail);
    if (!user) {
      throw new Error('Bu e-posta adresiyle eşleşen bir hesap bulunamadı.');
    }

    let isValid = false;
    if (user.passwordSalt && user.passwordHash) {
      isValid = await verifyPassword(password, user.passwordSalt, user.passwordHash);
    } else if ((user as any).password) {
      // Geriye dönük uyumluluk: eski düz metin şifre kontrolü ve anında güvenli PBKDF2 hash'e yükseltme
      isValid = (user as any).password === password;
      if (isValid) {
        const salt = generateSalt(16);
        const passwordHash = await hashPassword(password, salt);
        user.passwordSalt = salt;
        user.passwordHash = passwordHash;
        delete (user as any).password;
        await this.adapter.saveUser(user);
      }
    }

    if (!isValid) {
      throw new Error('Girdiğiniz şifre hatalı. Lütfen kontrol edip tekrar deneyin.');
    }

    const durationMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const session: Session = {
      token: generateToken(32),
      userId: user.id,
      expiresAt: Date.now() + durationMs,
      rememberMe,
    };

    await this.adapter.saveSession(session);
    return { user, session };
  }

  /**
   * Misafir olarak deneme (hızlı giriş) modunu başlatır.
   */
  async guestLogin(): Promise<{ user: User; session: Session }> {
    const guestId = 'guest_demo_user';
    let guestUser = await this.adapter.getUserById(guestId);

    if (!guestUser) {
      guestUser = {
        id: guestId,
        name: 'Misafir Öğrenci',
        email: 'misafir@planora.app',
        passwordHash: 'guest_hash',
        passwordSalt: 'guest_salt',
        createdAt: new Date().toISOString(),
        isGuest: true,
      };
      await this.adapter.saveUser(guestUser);
    }

    const session: Session = {
      token: generateToken(32),
      userId: guestId,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      rememberMe: false,
    };

    await this.adapter.saveSession(session);
    return { user: guestUser, session };
  }

  /**
   * Oturumu kapatır.
   */
  async logout(): Promise<void> {
    await this.adapter.clearSession();
  }

  /**
   * Aktif oturum ve kullanıcıyı getirir.
   */
  async getCurrentUser(): Promise<User | null> {
    const session = await this.adapter.getSession();
    if (!session) return null;
    return await this.adapter.getUserById(session.userId);
  }

  async getCurrentSession(): Promise<Session | null> {
    return await this.adapter.getSession();
  }
}

export const authService = new AuthService(defaultStorageAdapter);
