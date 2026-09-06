/* @layer renderer-widgets @kind hook */
/**
 * Builds the stat table the Stats tab renders from. Every player property the cheats can write is
 * described here (bounds, formatting and the write itself) so the controls stay generic and a new
 * property is one entry, not another hand-built row.
 *
 * Bounds that the game can raise (health capacity, bomb and arrow caps) come from the live HUD
 * state, so a slider never offers a value the engine would refuse.
 */
import { useMemo } from 'react';
import {
  cheatSetHealth, cheatSetMaxHealth, cheatSetMagic, cheatSetRupees,
  cheatSetBombs, cheatSetMaxBombs, cheatSetArrows, cheatSetMaxArrows,
} from '@app/lib/game';
import { useGameUIStore } from '@app/stores/game-ui-store';
import {
  ARROW_CAPACITY, BOMB_CAPACITY, HEART_UNITS, MAGIC_FULL, MAGIC_STEP, MAX_HEALTH, MIN_HEALTH,
} from '../StatsTab.constants';
import type { StatGroup } from '../StatsTab.type';

const asHearts = (value: number): string => `${value / HEART_UNITS}♥`;
const asPercent = (value: number): string => `${Math.round((value / MAGIC_FULL) * 100)}%`;
const asCount = (value: number): string => `${value}`;

const useStatSpecs = (): StatGroup[] => {
  const { healthCapacity, maxRupees, maxBombs, maxArrows } = useGameUIStore(s => s.hud);

  // Before the game reports its first HUD frame the capacity reads 0, which would collapse the
  // health slider to a single point and turn its Full button into a kill. One heart is the engine's
  // own floor, and the core clamps the request down to the real capacity anyway.
  const healthMax = Math.max(healthCapacity, MIN_HEALTH);

  return useMemo<StatGroup[]>(() => [
    {
      id: 'health',
      title: 'Health',
      stats: [
        {
          id: 'health-current', label: 'Health', min: 0, max: healthMax, step: HEART_UNITS,
          format: asHearts, apply: cheatSetHealth,
        },
        {
          id: 'health-max', label: 'Maximum', min: MIN_HEALTH, max: MAX_HEALTH, step: HEART_UNITS,
          format: asHearts, apply: cheatSetMaxHealth,
        },
      ],
    },
    {
      id: 'magic',
      title: 'Magic',
      stats: [
        {
          id: 'magic-current', label: 'Magic', min: 0, max: MAGIC_FULL, step: MAGIC_STEP,
          format: asPercent, apply: cheatSetMagic,
        },
      ],
    },
    {
      id: 'bombs',
      title: 'Bombs',
      stats: [
        {
          id: 'bombs-current', label: 'Bombs', min: 0, max: maxBombs, step: 1,
          format: asCount, apply: cheatSetBombs,
        },
        {
          id: 'bombs-max', label: 'Maximum', ...BOMB_CAPACITY,
          format: asCount, apply: cheatSetMaxBombs,
        },
      ],
    },
    {
      id: 'arrows',
      title: 'Arrows',
      stats: [
        {
          id: 'arrows-current', label: 'Arrows', min: 0, max: maxArrows, step: 1,
          format: asCount, apply: cheatSetArrows,
        },
        {
          id: 'arrows-max', label: 'Maximum', ...ARROW_CAPACITY,
          format: asCount, apply: cheatSetMaxArrows,
        },
      ],
    },
    {
      id: 'rupees',
      title: 'Rupees',
      stats: [
        {
          id: 'rupees-current', label: 'Rupees', min: 0, max: maxRupees, step: 1,
          format: asCount, apply: cheatSetRupees,
        },
      ],
    },
  ], [healthMax, maxRupees, maxBombs, maxArrows]);
};

export { useStatSpecs };
