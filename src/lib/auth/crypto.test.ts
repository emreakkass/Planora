import { describe, it, expect } from 'vitest';
import {
  generateSalt,
  hashPassword,
  verifyPassword,
  calculatePasswordStrength,
} from './crypto';

describe('crypto auth module', () => {
  it('generates a 16-byte random salt as 32 hex characters', () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();

    expect(salt1).toHaveLength(32);
    expect(salt2).toHaveLength(32);
    expect(salt1).not.toBe(salt2);
  });

  it('hashes password with PBKDF2 and verifies valid and invalid passwords correctly', async () => {
    const password = 'GuvenliSifre*2026';
    const salt = generateSalt();

    const hash = await hashPassword(password, salt);
    expect(hash).toBeDefined();
    expect(hash).toHaveLength(64); // 256 bits = 32 bytes = 64 hex chars

    // Doğru şifre doğrulama
    const isValid = await verifyPassword(password, salt, hash);
    expect(isValid).toBe(true);

    // Yanlış şifre red
    const isInvalid = await verifyPassword('YanlisSifre123', salt, hash);
    expect(isInvalid).toBe(false);
  });

  it('calculates password strength scores accurately with Turkish labels', () => {
    // Kısa ve zayıf şifre
    const weak = calculatePasswordStrength('abc');
    expect(weak.score).toBeLessThanOrEqual(1);
    expect(weak.label).toBe('Zayıf');

    // Orta güçte şifre
    const medium = calculatePasswordStrength('Password123');
    expect(medium.score).toBeGreaterThanOrEqual(2);

    // Çok güçlü şifre
    const strong = calculatePasswordStrength('Planora_2026!Proje');
    expect(strong.score).toBe(4);
    expect(strong.label).toBe('Çok Güçlü');
  });
});
