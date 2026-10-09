/* @layer renderer-app @kind logic */
import type { EntityKind } from '@rotp/game-data';
import type { IdRefOption } from '@drizztdourden08/tessera/composites';
import { buildOptions } from './build-options';
import { optionCache } from './option-cache';

const optionsFor = (kind: EntityKind): readonly IdRefOption[] => {
  const held = optionCache.get(kind);
  if (held) return held;
  const built = buildOptions(kind);
  optionCache.set(kind, built);
  return built;
};

export { optionsFor };
