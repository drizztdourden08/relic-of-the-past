/* @layer renderer-widgets @kind hook */
/**
 * Which cheat categories the core will honour right now, read from the effective gate word.
 * A category that is off draws its surface inert with the reason, instead of offering a
 * control the core silently refuses. The word only moves on a settings change or a game
 * start, so it is re-read on the store's mode changes and on a slow tick.
 */
import { useEffect, useState } from 'react';
import { cheatCategoryAllowed } from '@app/lib/game';
import type { CheatCategory } from '@app/lib/game';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { DISABLED_SETTING_MESSAGES } from '@ds/composites/DisabledOverlay/DisabledOverlay.constants';

const CATEGORIES: CheatCategory[] = ['collision', 'items', 'stats', 'combat'];

const CATEGORY_LABEL: Record<CheatCategory, string> = {
  collision: 'Movement', items: 'Item', stats: 'Stat', combat: 'Combat',
};

/** Slow enough to cost nothing, fast enough that a settings change lands before the next click. */
const RECHECK_MS = 1000;

type CheatGates = {
  /** The master switch. */
  enabled: boolean;
  allowed: Record<CheatCategory, boolean>;
  /** The overlay sentence for a category that is off. */
  reason: (category: CheatCategory) => string;
};

const readGates = (): Record<CheatCategory, boolean> => {
  const allowed = {} as Record<CheatCategory, boolean>;
  for (const category of CATEGORIES) allowed[category] = cheatCategoryAllowed(category);
  return allowed;
};

const sameGates = (a: Record<CheatCategory, boolean>, b: Record<CheatCategory, boolean>): boolean =>
  CATEGORIES.every((category) => a[category] === b[category]);

const useCheatGates = (): CheatGates => {
  const mode = useGameUIStore((s) => s.mode);
  const [allowed, setAllowed] = useState(readGates);

  useEffect(() => {
    const refresh = () => setAllowed((prev) => { const next = readGates(); return sameGates(prev, next) ? prev : next; });
    refresh();
    const timer = setInterval(refresh, RECHECK_MS);
    return () => clearInterval(timer);
  }, [mode]);

  const enabled = CATEGORIES.some((category) => allowed[category]);
  const reason = (category: CheatCategory): string =>
    (enabled ? `${CATEGORY_LABEL[category]} cheats are off for this profile` : DISABLED_SETTING_MESSAGES.cheatsEnabled);

  return { enabled, allowed, reason };
};

export { useCheatGates, CATEGORY_LABEL };
export type { CheatGates };
