/* @layer renderer-app @kind logic */
import type { EntityKind } from '@rotp/game-data';
import type { IdRefOption } from '@drizztdourden08/tessera/composites';
import { dropNarrowed } from './drop-narrowed';
import { optionCache } from './option-cache';
import { optionsFor } from './options-for';

const registerIdRefOption = (kind: EntityKind, option: IdRefOption): void => {
  const held = optionsFor(kind);
  if (held.some(entry => entry.value === option.value)) return;
  optionCache.set(kind, [...held, option]);
  dropNarrowed(kind);
};

export { registerIdRefOption };
