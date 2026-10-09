/* @layer bridge-wasm @kind logic */
import type { SimObservation, SimulatorPort, SimSprite, CombatContext, EngineState } from '@shared/game/simulation';
import type { ItemId } from '@shared/game/data';
import { locationForScreen } from '../screen-location';
import { detectFor } from './detect-for';
import type { DetectCache } from './observe.type';

const combatFor = (port: SimulatorPort, sprites: SimSprite[]): CombatContext => {
  const bySpriteType: Record<number, ReturnType<SimulatorPort['getSpriteCombat']>> = {};
  for (const spriteType of new Set(sprites.map((s) => s.spriteType))) {
    bySpriteType[spriteType] = port.getSpriteCombat(spriteType);
  }
  return { tables: port.getCombatTables(), bySpriteType };
};

const buildObservation = (port: SimulatorPort, state: EngineState, cache: DetectCache, itemReceived?: ItemId): SimObservation => {
  const base = port.observe();
  const loc = locationForScreen(state.virtual.screenId);
  if (!loc) return { ...base, itemReceived };
  const interactables = loc.isIndoors
    ? {
        chests: port.getRoomChests(loc.roomId),
        sprites: port.getRoomSprites(loc.roomId),
        doors: port.getRoomDoors(loc.roomId),
        tags: port.getRoomTags(loc.roomId),
      }
    : { chests: [], sprites: port.getOverworldSprites(loc.owScreenIndex), doors: [] };
  const detected = detectFor(state, cache);
  return {
    ...base,
    grids: port.getScreenGrids(loc),
    interactables,
    itemReceived,
    exits: detected?.exits,
    reached: detected?.reached,
    combat: combatFor(port, interactables.sprites),
    sectionSplit: loc.isIndoors ? port.getRoomSectionSplit() : undefined,
  };
};

export { buildObservation };
