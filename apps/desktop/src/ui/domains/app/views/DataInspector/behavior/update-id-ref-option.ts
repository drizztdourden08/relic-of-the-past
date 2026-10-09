/* @layer renderer-app @kind logic */
import type { EntityKind } from '@rotp/game-data';
import { dropNarrowed } from './drop-narrowed';
import { optionCache } from './option-cache';
import { optionLabel } from './option-label';
import { optionsFor } from './options-for';

const updateIdRefOption = (kind: EntityKind, id: string): void => {
  const held = optionsFor(kind);
  const label = optionLabel(id);
  optionCache.set(kind, held.map(entry => (entry.value === id ? { ...entry, label } : entry)));
  dropNarrowed(kind);
};

export { updateIdRefOption };
