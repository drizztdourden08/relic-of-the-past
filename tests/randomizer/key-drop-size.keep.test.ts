/* @layer tests @kind test */
/**
 * The core matches a drop override on (room, drop size), so a key drop armed at the wrong
 * size never fires and the vanilla key is granted. Every key drop whose vanilla item is its
 * dungeon's Big Key must be armed large, every other one small, and no two armed drops may
 * share a room and a size.
 */
import { describe, expect, it } from 'vitest';
import { getCheck, getDungeon } from '@shared/game/data';
import { generatePlacement } from '@shared/randomizer/world/fill/generate';
import { buildOptionsSnapshot } from '@shared/randomizer/options-snapshot';
import { KEY_DROP_LOCATIONS } from '@shared/randomizer/world/scope-tables';
import type { CheckId } from '@shared/game/data';

// The bridge chain pulls in log-bus, which wires window handlers at import
// time; this suite runs in node, so a stand-in goes in before the dynamic import.
(globalThis as { window?: unknown }).window ??= { addEventListener: () => undefined };
const { buildPhysicalPlan } = await import('@app/lib/game/randomizer-client/placement-bridge');

const vanillaIsBigKey = (checkId: CheckId): boolean => {
  const { dungeonId, vanillaItemIds } = getCheck(checkId);
  return dungeonId !== undefined && vanillaItemIds[0] === getDungeon(dungeonId).items.bigKey;
};

describe('key drops are armed at their real drop size', () => {
  const placement = generatePlacement('key-drop-size', buildOptionsSnapshot({ key_drop_shuffle: true }));
  const drops = buildPhysicalPlan(placement).entries.filter((entry) => entry.planClass === 'override-drop');

  it('arms every key drop location', () => {
    const armed = new Set(drops.map((entry) => entry.location));
    expect([...KEY_DROP_LOCATIONS.keys()].filter((location) => !armed.has(location))).toEqual([]);
  });

  it('arms a Big Key drop large and every other drop small', () => {
    const wrong = drops.filter((entry) =>
      entry.dropOverride?.big !== vanillaIsBigKey(entry.location as CheckId));
    expect(wrong.map((entry) => entry.location)).toEqual([]);
    expect(drops.filter((entry) => entry.dropOverride?.big).map((entry) => entry.location))
      .toEqual(['check-111']);
  });

  it('never arms two drops on one room and size', () => {
    const keys = drops.map((entry) => `${entry.dropOverride?.roomId}:${entry.dropOverride?.big}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
