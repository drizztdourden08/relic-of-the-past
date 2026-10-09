/* @layer shared-input @kind logic */
import { EnvironmentalEvent } from './haptic-events.constants';
import type { HapticPatternId } from '../data/haptics';

const getEnvironmentalPatternId = (subEvent: number): HapticPatternId | null => {
  switch (subEvent) {
    case EnvironmentalEvent.FALL_INTO_PIT: return 'fallIntoPit';
    case EnvironmentalEvent.LAND_FROM_LEDGE: return 'landFromLedge';
    case EnvironmentalEvent.CHEST_OPEN: return 'chestOpen';
    case EnvironmentalEvent.BOMB_EXPLODE: return 'bombExplode';
    case EnvironmentalEvent.ENTER_WATER: return 'enterWater';
    case EnvironmentalEvent.MIRROR_WARP: return 'mirrorWarp';
    case EnvironmentalEvent.QUAKE: return 'quakeEnvironment';
    case EnvironmentalEvent.BOSS_DEFEATED: return 'bossDefeated';
    default: return null;
  }
};

export { getEnvironmentalPatternId };
