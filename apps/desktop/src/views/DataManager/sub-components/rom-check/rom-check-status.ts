/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { DropZoneStatus } from '@drizztdourden08/tessera/primitives';
import type { RomCheck } from './rom-check.type';

const romCheckStatus = (file: File | null, check: RomCheck | null, t: I18n['t']): DropZoneStatus | undefined => {
  if (file === null) return undefined;
  if (check === null || check.file !== file) return { tone: 'success', message: t('data-manager:rom-check.checking', { name: file.name }) };
  return { tone: check.ok ? 'success' : 'error', message: `${file.name}: ${check.message}` };
};

export { romCheckStatus };
