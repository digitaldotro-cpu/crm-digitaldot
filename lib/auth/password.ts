import { hash, verify } from '@node-rs/argon2';

const HASH_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1
};

export async function hashPassword(password: string): Promise<string> {
  return hash(password, {
    ...HASH_OPTIONS,
    algorithm: 2
  });
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return verify(passwordHash, password);
}
