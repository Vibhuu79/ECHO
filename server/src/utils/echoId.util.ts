import crypto from 'crypto';

/**
 * Generates a unique 6-character EchoID (e.g. '#A8KD2F')
 */
export const generateEchoId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const randomBytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return `#${result}`;
};
