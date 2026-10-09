/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { getCheck, getDungeon } from '@rotp/game-data';
import { generatePlacement } from '@rotp/randomizer';
import { buildOptionsSnapshot } from '@rotp/randomizer';
import { KEY_DROP_LOCATIONS } from '@rotp/randomizer';
import type { CheckId } from '@rotp/game-data';

(globalThis as { window?: unknown }).window ??= { addEventListener: () => undefined };
const { buildPhysicalPlan } = await import('../../packages/randomizer/src/client/placement-bridge');

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
