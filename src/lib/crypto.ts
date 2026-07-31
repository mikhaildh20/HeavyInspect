import { createHmac, randomBytes } from 'crypto';

const SECRET = process.env.ENCRYPTION_KEY || 'fallback-dev-key-change-in-production';

/**
 * Encrypt a numeric ID into a URL-safe token.
 * Format: base64url(id:hex_signature)
 * Example: 42 → "NDI6a..."
 */
export function encryptId(id: number): string {
  const payload = String(id);
  const signature = createHmac('sha256', SECRET).update(payload).digest('hex');
  const token = `${payload}:${signature}`;
  return Buffer.from(token).toString('base64url');
}

/**
 * Decrypt a URL-safe token back to the original numeric ID.
 * Returns null if the token is invalid or tampered.
 */
export function decryptId(token: string): number | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const colonIndex = decoded.lastIndexOf(':');
    if (colonIndex === -1) return null;

    const payload = decoded.substring(0, colonIndex);
    const receivedSig = decoded.substring(colonIndex + 1);

    const expectedSig = createHmac('sha256', SECRET).update(payload).digest('hex');

    if (receivedSig !== expectedSig) return null;

    const id = Number(payload);
    if (isNaN(id) || !Number.isInteger(id) || id <= 0) return null;

    return id;
  } catch {
    return null;
  }
}
