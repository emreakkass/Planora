import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from './authService';
import { LocalStorageAdapter, USERS_KEY, SESSION_KEY, normalizeEmail } from '../storage/localStorageAdapter';

describe('Auth Service Full Lifecycle & Persistence Scenarios', () => {
  // In-memory mock storage for localStorage and sessionStorage
  let localStore: Record<string, string> = {};
  let sessionStore: Record<string, string> = {};

  beforeEach(() => {
    localStore = {};
    sessionStore = {};

    globalThis.localStorage = {
      getItem: (key: string) => localStore[key] || null,
      setItem: (key: string, val: string) => {
        localStore[key] = String(val);
      },
      removeItem: (key: string) => {
        delete localStore[key];
      },
      clear: () => {
        localStore = {};
      },
      length: 0,
      key: () => null,
    };

    globalThis.sessionStorage = {
      getItem: (key: string) => sessionStore[key] || null,
      setItem: (key: string, val: string) => {
        sessionStore[key] = String(val);
      },
      removeItem: (key: string) => {
        delete sessionStore[key];
      },
      clear: () => {
        sessionStore = {};
      },
      length: 0,
      key: () => null,
    };
  });

  it('email normalization cleans whitespace and lowercases', () => {
    expect(normalizeEmail('  Emre.Akkas@Uni.EDU.TR  ')).toBe('emre.akkas@uni.edu.tr');
    expect(normalizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com');
  });

  it('scenario: yeni hesap oluştur -> çıkış yap -> aynı bilgilerle giriş yap -> sayfayı yenile -> tekrar giriş yap', async () => {
    const adapter = new LocalStorageAdapter();
    const auth = new AuthService(adapter);

    const testName = 'Ahmet Yılmaz';
    const testEmail = '  Ahmet.Yilmaz@Universite.Edu.Tr  '; // Başı/sonu boşluklu ve büyük harfli
    const testPassword = 'GuvenliSifre2026!';

    // Adım 1: Yeni hesap oluştur
    const { user: registeredUser } = await auth.register(testName, testEmail, testPassword, true);
    expect(registeredUser.id).toBeDefined();
    expect(registeredUser.email).toBe('ahmet.yilmaz@universite.edu.tr');
    expect(registeredUser.passwordHash).toBeDefined();
    expect(registeredUser.passwordSalt).toBeDefined();
    // Şifre asla düz metin saklanmamalı
    expect((registeredUser as any).password).toBeUndefined();
    expect(registeredUser.passwordHash).not.toBe(testPassword);

    // Kullanıcı localStorage'da mevcut mu?
    const rawUsersAfterRegister = localStore[USERS_KEY];
    expect(rawUsersAfterRegister).toBeDefined();
    const parsedUsers = JSON.parse(rawUsersAfterRegister);
    expect(parsedUsers.length).toBe(1);
    expect(parsedUsers[0].email).toBe('ahmet.yilmaz@universite.edu.tr');

    // Adım 2: Çıkış yap
    await auth.logout();
    // Çıkış yapınca session temizlenmeli ama kullanıcılar SİLİNMEMELİ
    expect(localStore[SESSION_KEY]).toBeUndefined();
    expect(sessionStore[SESSION_KEY]).toBeUndefined();
    expect(localStore[USERS_KEY]).toBeDefined();
    expect(JSON.parse(localStore[USERS_KEY]).length).toBe(1);

    // Adım 3: Aynı bilgilerle giriş yap (farklı büyük/küçük harf kombinasyonu ile)
    const loginEmail = 'AHMET.YILMAZ@UNIVERSITE.EDU.TR';
    const { user: loggedInUser, session: loginSession } = await auth.login(loginEmail, testPassword, true);
    expect(loggedInUser.id).toBe(registeredUser.id);
    expect(loginSession.userId).toBe(registeredUser.id);
    expect(localStore[SESSION_KEY]).toBeDefined();

    // Adım 4: Sayfayı yenile (yeni auth service instance'ı yükleme / restore simülasyonu)
    const reloadedAuth = new AuthService(new LocalStorageAdapter());
    const currentUser = await reloadedAuth.getCurrentUser();
    expect(currentUser).not.toBeNull();
    expect(currentUser?.id).toBe(registeredUser.id);
    expect(currentUser?.email).toBe('ahmet.yilmaz@universite.edu.tr');

    // Adım 5: Tekrar çıkış yap ve tekrar giriş yap
    await reloadedAuth.logout();
    expect(await reloadedAuth.getCurrentUser()).toBeNull();

    const secondLogin = await reloadedAuth.login('ahmet.yilmaz@universite.edu.tr', testPassword, false);
    expect(secondLogin.user.id).toBe(registeredUser.id);
    // rememberMe false olduğu için sessionStorage'da olmalı
    expect(sessionStore[SESSION_KEY]).toBeDefined();
    expect(localStore[SESSION_KEY]).toBeUndefined();
  });

  it('backward compatibility: reads legacy users from older keys and migrates smoothly', async () => {
    // Eski sistemden kalma bir kullanıcıyı eski anahtara kaydediyoruz
    const legacyUser = {
      id: 'legacy_123',
      name: 'Eski Kullanıcı',
      email: 'ESKI@TEST.COM',
      password: 'OldPlainPassword123', // Eski düz metin şifre
      createdAt: '2025-01-01T00:00:00.000Z',
    };
    localStore['planora_auth_users'] = JSON.stringify([legacyUser]);

    const adapter = new LocalStorageAdapter();
    const auth = new AuthService(adapter);

    // Kullanıcı eski anahtardan okunabilmeli
    const foundUser = await adapter.findUserByEmail('eski@test.com');
    expect(foundUser).not.toBeNull();
    expect(foundUser?.id).toBe('legacy_123');

    // Eski kullanıcının girişi başarılı olmalı ve otomatik hash'e yükseltilmeli
    const { user: upgradedUser } = await auth.login('eski@test.com', 'OldPlainPassword123');
    expect(upgradedUser.passwordHash).toBeDefined();
    expect(upgradedUser.passwordSalt).toBeDefined();
    expect((upgradedUser as any).password).toBeUndefined();

    // Artık şifrelenmiş hash ile tekrar giriş yapılabilmeli
    const secondLogin = await auth.login('eski@test.com', 'OldPlainPassword123');
    expect(secondLogin.user.id).toBe('legacy_123');
  });

  it('fails login with wrong password without breaking storage', async () => {
    const adapter = new LocalStorageAdapter();
    const auth = new AuthService(adapter);

    await auth.register('Test Kullanıcı', 'test@domain.com', 'DogruSifre123');

    await expect(auth.login('test@domain.com', 'YanlisSifre999')).rejects.toThrow(
      'Girdiğiniz şifre hatalı'
    );

    await expect(auth.login('olmayan@domain.com', 'DogruSifre123')).rejects.toThrow(
      'Bu e-posta adresiyle eşleşen bir hesap bulunamadı'
    );
  });
});
