// AuraLink — Password Hashing Utilities (PBKDF2 via Web Crypto)

const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16; // bytes
const HASH_LENGTH = 32; // bytes

/**
 * Hash a password using PBKDF2-SHA256 with a random per-user salt.
 * Returns a string in the format: `base64salt$base64hash`
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    HASH_LENGTH * 8
  );

  const saltB64 = btoa(String.fromCharCode(...salt));
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));

  return `${saltB64}$${hashB64}`;
}

/**
 * Verify a password against a stored hash.
 * Supports both new PBKDF2 format (`salt$hash`) and legacy SHA-256 format.
 */
export async function verifyPassword(password, storedHash) {
  if (storedHash === 'oauth_user') return false;

  // New format: contains '$' separator
  if (storedHash.includes('$')) {
    const [saltB64, hashB64] = storedHash.split('$');
    const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
    const expectedHash = Uint8Array.from(atob(hashB64), c => c.charCodeAt(0));

    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      HASH_LENGTH * 8
    );

    const actualHash = new Uint8Array(hashBuffer);

    // Constant-time comparison
    if (actualHash.length !== expectedHash.length) return false;
    let diff = 0;
    for (let i = 0; i < actualHash.length; i++) {
      diff |= actualHash[i] ^ expectedHash[i];
    }
    return diff === 0;
  }

  // Legacy format: plain SHA-256 hex (for migration)
  const encoder = new TextEncoder();
  const data = encoder.encode('auralink_salt_' + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const legacyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return legacyHash === storedHash;
}

/**
 * Check if a stored hash is in the legacy format and needs rehashing.
 */
export function isLegacyHash(storedHash) {
  return storedHash && storedHash !== 'oauth_user' && !storedHash.includes('$');
}
