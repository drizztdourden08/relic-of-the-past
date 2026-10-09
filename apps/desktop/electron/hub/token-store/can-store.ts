/* @layer electron-main @kind logic */
import { safeStorage } from 'electron';

const canStore = (): boolean => safeStorage.isEncryptionAvailable();

export { canStore };
