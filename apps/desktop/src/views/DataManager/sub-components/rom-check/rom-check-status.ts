/* @layer renderer-components @kind logic */
import type { DropZoneStatus } from '@drizztdourden08/tessera/primitives';
import type { RomCheck } from './rom-check.type';

const romCheckStatus = (file: File | null, check: RomCheck | null): DropZoneStatus | undefined => {
  if (file === null) return undefined;
  if (check === null || check.file !== file) return { tone: 'success', message: `${file.name}: checking the ROM...` };
  return { tone: check.ok ? 'success' : 'error', message: `${file.name}: ${check.message}` };
};

export { romCheckStatus };
