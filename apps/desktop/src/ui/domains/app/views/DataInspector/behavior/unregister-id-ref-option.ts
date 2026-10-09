/* @layer renderer-app @kind logic */
import type { EntityKind } from '@rotp/game-data';
import { dropNarrowed } from './drop-narrowed';
import { optionCache } from './option-cache';
import { optionsFor } from './options-for';

const unregisterIdRefOption = (kind: EntityKind, id: string): void => {
  const held = optionsFor(kind);
  const next = held.filter(entry => entry.value !== id);
  if (next.length === held.length) return;
  optionCache.set(kind, next);
  dropNarrowed(kind);
};

export { unregisterIdRefOption };
