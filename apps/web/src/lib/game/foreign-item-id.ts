/* @layer bridge-wasm @kind logic */
/**
 * The core's foreign-item sentinel (foreign_item.c): the id an override arms at a location
 * whose item belongs to another player in a multiworld. The plan carries the mirrored number
 * (foreign-item-sentinel.ts); a setter asks the core itself, so a core that disagrees refuses
 * the arm instead of taking an id it would read as something else.
 */
import { isGrantableReceiveId } from '@shared/game/data';
import { getModule } from './wasm-bridge';
import { FOREIGN_ITEM_ID, isForeignIconId } from './foreign-item-sentinel';

/** The core's own answer; the mirrored number from a core built before the export existed. */
const foreignItemId = (): number => {
  const mod = getModule() as unknown as Record<string, unknown> | null;
  if (mod === null || typeof mod._WasmForeignItemId !== 'function') return FOREIGN_ITEM_ID;
  try {
    const id = getModule()?.ccall('WasmForeignItemId', 'number', [], []);
    return typeof id === 'number' && id > 0 ? id : FOREIGN_ITEM_ID;
  } catch {
    return FOREIGN_ITEM_ID;
  }
};

/** Whether the running core knows the icon ids (a core built before them does not). */
const coreHasForeignIcons = (): boolean => {
  const mod = getModule() as unknown as Record<string, unknown> | null;
  return mod !== null && typeof mod._WasmForeignIconFirstId === 'function';
};

/**
 * Whether an override setter may arm |id|: a native grant, the foreign sentinel, or one of its
 * icon ids when the core knows them. The core refuses those itself unless kFeatures5_ApOnline
 * is set, so outside an online session they reach exactly the code they reached before.
 */
const isArmableOverrideId = (id: number): boolean =>
  isGrantableReceiveId(id) || id === foreignItemId() || (isForeignIconId(id) && coreHasForeignIcons());

export { coreHasForeignIcons, isArmableOverrideId };
