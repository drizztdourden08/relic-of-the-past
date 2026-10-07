/* @layer electron-main @kind logic */
/**
 * The device token, one file in userData, encrypted with the OS keychain through
 * safeStorage. Without a working safeStorage the token is never written: a plain-text
 * token on disk is worse than asking the person to sign in again next launch.
 */
import { app, safeStorage } from 'electron';
import { readFile, writeFile, rm } from 'fs/promises';
import { join } from 'path';

const TOKEN_FILE = 'sanctuary-device.token';

const tokenPath = (): string => join(app.getPath('userData'), TOKEN_FILE);

const canStore = (): boolean => safeStorage.isEncryptionAvailable();

/** Throws when the keychain is unavailable, so the sign-in reports it instead of pretending. */
const saveToken = async (token: string): Promise<void> => {
  if (!canStore()) throw new Error('This system cannot keep the sign-in encrypted, so it was not stored.');
  await writeFile(tokenPath(), safeStorage.encryptString(token));
};

/** null when no token is stored, or when the stored one can no longer be decrypted. */
const readToken = async (): Promise<string | null> => {
  try {
    const bytes = await readFile(tokenPath());
    return canStore() ? safeStorage.decryptString(bytes) : null;
  } catch {
    return null;
  }
};

const clearToken = async (): Promise<void> => {
  await rm(tokenPath(), { force: true });
};

export { saveToken, readToken, clearToken, canStore };
