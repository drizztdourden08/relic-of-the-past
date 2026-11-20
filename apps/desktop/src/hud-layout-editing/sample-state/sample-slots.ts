/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { ModernSlot } from '@rotp/game-data';
import { sampleSlot } from './sample-slot';

const sampleSlots = (t: I18n['t']): readonly ModernSlot[] => [
  sampleSlot(1, 'NORTH', t('hud-editing:sample.north')),
  sampleSlot(2, 'WEST', t('hud-editing:sample.west')),
  sampleSlot(3, 'EAST', t('hud-editing:sample.east')),
  sampleSlot(4, 'SOUTH', t('hud-editing:sample.south')),
  sampleSlot(5, 'DPAD_UP', t('hud-editing:sample.up')),
  sampleSlot(6, 'DPAD_LEFT', t('hud-editing:sample.left')),
  sampleSlot(7, 'DPAD_RIGHT', t('hud-editing:sample.right')),
  sampleSlot(8, 'DPAD_DOWN', t('hud-editing:sample.down')),
];

export { sampleSlots };
