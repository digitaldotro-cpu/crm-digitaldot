import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

function getEncryptionKey(): Buffer {
  const key = process.env.SECRETS_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('SECRETS_ENCRYPTION_KEY is missing.');
  }

  const buffer = Buffer.from(key, 'base64');
  if (buffer.length !== 32) {
    throw new Error('SECRETS_ENCRYPTION_KEY must be a base64 encoded 32-byte key.');
  }

  return buffer;
}

export function encryptSecret(value: string) {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedValue: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64')
  };
}

export function decryptSecret(input: { encryptedValue: string; iv: string; authTag: string }) {
  const key = getEncryptionKey();
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(input.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(input.authTag, 'base64'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(input.encryptedValue, 'base64')),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
}
