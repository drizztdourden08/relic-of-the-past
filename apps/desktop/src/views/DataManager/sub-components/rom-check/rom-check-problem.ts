/* @layer renderer-components @kind logic */
import type { RomCheck } from './rom-check.type';

const romCheckProblem = (file: File, check: RomCheck | null): string | null => {
  if (check === null || check.file !== file) return 'The ROM is still being checked.';
  return check.ok ? null : check.message;
};

export { romCheckProblem };
