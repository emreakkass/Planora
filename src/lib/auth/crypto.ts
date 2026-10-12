import { PasswordStrength } from './types';

/**
 * Web Crypto API kullanarak rastgele güvenli salt üretir (Hex formatında).
 */
export function generateSalt(byteLength: number = 16): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hex string'i Uint8Array'e dönüştürür.
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Uint8Array'i hex string'e dönüştürür.
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Web Crypto API PBKDF2 (SHA-256, 100.000 iterasyon) ile şifreyi tuzlayarak hash'ler.
 * Tarayıcı içinde çalışan endüstri standardı anahtar türetme algoritması.
 */
export async function hashPassword(password: string, saltHex: string): Promise<string> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = hexToBytes(saltHex);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    256 // 256 bits = 32 bytes
  );

  return bytesToHex(new Uint8Array(derivedBits));
}

/**
 * Girilen şifrenin saklanan hash ve salt ile eşleşip eşleşmediğini doğrular.
 */
export async function verifyPassword(
  password: string,
  saltHex: string,
  expectedHashHex: string
): Promise<boolean> {
  const calculatedHash = await hashPassword(password, saltHex);
  // Constant-time karşılaştırma (timing attack önlemi)
  if (calculatedHash.length !== expectedHashHex.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < calculatedHash.length; i++) {
    diff |= calculatedHash.charCodeAt(i) ^ expectedHashHex.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Rastgele oturum belirteci (Session Token) üretir.
 */
export function generateToken(byteLength: number = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

/**
 * Şifre gücünü analiz eder ve Türkçe ipuçları ile puan döner.
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      label: 'Zayıf',
      color: '#94A3B8',
      percent: 0,
      hints: ['En az 8 karakter uzunluğunda olmalı.'],
    };
  }

  let score = 0;
  const hints: string[] = [];

  // Kural 1: Uzunluk
  if (password.length >= 8) {
    score += 1;
  } else {
    hints.push('En az 8 karakter olmalı');
  }

  // Kural 2: Küçük ve büyük harf
  const hasLower = /[a-zğüşıöç]/.test(password);
  const hasUpper = /[A-ZĞÜŞİÖÇ]/.test(password);
  if (hasLower && hasUpper) {
    score += 1;
  } else {
    hints.push('Büyük ve küçük harf içermeli');
  }

  // Kural 3: Rakam
  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    hints.push('En az bir rakam içermeli');
  }

  // Kural 4: Özel karakter veya uzunluk >= 12
  if (/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ]/.test(password) || password.length >= 12) {
    score += 1;
  } else {
    hints.push('Özel karakter içermeli (!@#$%^&*)');
  }

  if (score <= 1) {
    return {
      score: 1,
      label: 'Zayıf',
      color: '#EF4444', // Red-500
      percent: 25,
      hints,
    };
  }

  if (score === 2) {
    return {
      score: 2,
      label: 'Orta',
      color: '#F59E0B', // Amber-500
      percent: 50,
      hints,
    };
  }

  if (score === 3) {
    return {
      score: 3,
      label: 'Güçlü',
      color: '#3B82F6', // Blue-500
      percent: 75,
      hints,
    };
  }

  return {
    score: 4,
    label: 'Çok Güçlü',
    color: '#10B981', // Emerald-500
    percent: 100,
    hints: ['Mükemmel, şifreniz çok güvenli!'],
  };
}
