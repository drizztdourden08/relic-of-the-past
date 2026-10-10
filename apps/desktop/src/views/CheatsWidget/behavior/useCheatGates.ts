/* @layer renderer-widgets @kind hook */
import { useEffect, useState } from 'react';
import { cheatCategoryAllowed } from '@app/game';
import type { CheatCategory } from '@app/game';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { DISABLED_SETTING_MESSAGES } from '@app/settings-controls/disabled-setting-messages.constants';
import { CATEGORIES, CATEGORY_LABEL, GATES_RECHECK_MS } from '../CheatsWidget.constants';
import type { CheatGates } from '../CheatsWidget.type';

const cheatsOffMessage = (): string => {
  const message = DISABLED_SETTING_MESSAGES.cheatsEnabled;
  if (message === undefined) throw new Error('cheatsEnabled has no disabled-setting message');
  return message;
};

const readGates =(): Record<CheatCategory, boolean> => {
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
    const timer = setInterval(refresh, GATES_RECHECK_MS);
    return () => clearInterval(timer);
  }, [mode]);

  const enabled = CATEGORIES.some((category) => allowed[category]);
  const reason = (category: CheatCategory): string =>
    (enabled ? `${CATEGORY_LABEL[category]} cheats are off for this profile` : cheatsOffMessage());

  return { enabled, allowed, reason };
};

export { useCheatGates };
