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

const NO_PACK_LINE = 'None. No pack assigned to this profile. Assign one in Data Manager.';

export { MODE_LABELS, NO_PACK_LINE };
