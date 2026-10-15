/* @layer renderer-components @kind constants */
import type { GameSettings } from '@rotp/features';

const MODE_LABELS: Record<GameSettings['enableMSU'], string> = {
  false: 'Off',
  true: 'MSU',
  deluxe: 'Deluxe',
  opuz: 'OPUZ',
  'deluxe-opuz': 'Deluxe OPUZ',
  msul: 'MSUL',
};

export { MODE_LABELS };
