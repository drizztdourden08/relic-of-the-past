/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Text } from '@drizztdourden08/brock-core/i18n';
import type { GameSettings } from '@rotp/features';

const MODE_LABELS: Record<GameSettings['enableMSU'], Text> = {
  false: msg('settings-controls:audio.msu.off'),
  true: 'MSU',
  deluxe: 'Deluxe',
  opuz: 'OPUZ',
  'deluxe-opuz': 'Deluxe OPUZ',
  msul: 'MSUL',
};

export { MODE_LABELS };
