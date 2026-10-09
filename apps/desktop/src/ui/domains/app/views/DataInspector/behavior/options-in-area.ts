/* @layer renderer-app @kind logic */
import { locationsInArea } from '@rotp/game-data';
import type { EntityKind } from '@rotp/game-data';
import type { IdRefOption } from '@drizztdourden08/tessera/composites';
import { narrowedOptionCache } from './narrowed-option-cache';
import { optionsFor } from './options-for';

const optionsInArea = (kind: EntityKind, areaId: string): readonly IdRefOption[] => {
  const key = `${kind}|${areaId}`;
  const held = narrowedOptionCache.get(key);
  if (held) return held;
  const inside = new Set(locationsInArea(areaId).map(location => String(location.id)));
  const built = optionsFor(kind).filter(option => inside.has(option.value));
  narrowedOptionCache.set(key, built);
  return built;
};

export { optionsInArea };
