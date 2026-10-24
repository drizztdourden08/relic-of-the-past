/* @layer electron-main @kind logic */
import { FALLBACK_SLOT_NAME, UNSAFE_FILENAME } from './save-files.constants';

const safeFileStem = (name: string): string => name.replace(UNSAFE_FILENAME, '_').trim() || FALLBACK_SLOT_NAME;

export { safeFileStem };
