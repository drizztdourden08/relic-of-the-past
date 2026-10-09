/* @layer renderer-components @kind constants */
import type { GameSettings } from '@shared/types/settings';

const MODE_LABELS: Record<GameSettings['enableMSU'], string> = {
  false: 'Off',
  true: 'MSU',
  deluxe: 'Deluxe',
  opuz: 'OPUZ',
  'deluxe-opuz': 'Deluxe OPUZ',
  msul: 'MSUL',
};

const MSU_ARCHIVE_TYPES = ['.zip', '.7z', '.rar'];

export { MODE_LABELS, MSU_ARCHIVE_TYPES };
