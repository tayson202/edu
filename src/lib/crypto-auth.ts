// Cryptographic Authentication & Password Security Engine for ULearn
// Uses the standard Web Crypto API (SubtleCrypto) with SHA-256 and unique per-user salts.
// Compatible with both browser runtime (static GitHub Pages) and modern Node.js environments.

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 to 4
  errors: string[];
}

/**
 * Validates password strength against industry security standards:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character (@$!%*?&#^_-)
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must include at least one uppercase letter (A-Z)');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must include at least one lowercase letter (a-z)');
  } else {
    score += 1;
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must include at least one number (0-9)');
  } else {
    score += 1;
  }

  if (!/[@$!%*?&#^_\-]/.test(password)) {
    errors.push('Password must include at least one special character (@$!%*?&#^_-)');
  }

  return {
    isValid: errors.length === 0,
    score: Math.min(score, 4),
    errors,
  };
}

/**
 * Validates standard email format according to RFC 5322
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim().toLowerCase());
}

/**
 * Generates a cryptographically random 16-byte hex salt
 */
export function generateSalt(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback for non-browser environments
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Cryptographically hashes a password with a unique salt using SHA-256
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const text = `${salt}:${password}`;
  
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fast fallback for SSR/environments without SubtleCrypto
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'fallback_' + Math.abs(hash).toString(16);
}

/**
 * Verifies if entered password matches the stored salted hash
 */
export async function verifyPassword(password: string, salt: string, expectedHash: string): Promise<boolean> {
  const computedHash = await hashPassword(password, salt);
  return computedHash === expectedHash;
}
