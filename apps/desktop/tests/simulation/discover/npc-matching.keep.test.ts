/* @layer tests @kind test */
import { it, expect } from 'vitest';
import type { SimSprite, SimObservation, PresenceGameState } from '@rotp/navigation';
import { discoverTargets, emptySnapshot } from '@rotp/navigation';
import type { ItemId } from '@rotp/game-data';
import { describeDataset } from '../../dataset-guard';
import { HOUSE_ROOM, PASSAGE_ROOM } from './discover.constants';
import { baseObs } from './base-obs';
import { freshState } from './fresh-state';

const presenceWith = (partial: Partial<PresenceGameState> = {}): PresenceGameState => ({
  progressFlags: 0,
  progressIndicator: 0,
  progressIndicator3: 0,
  followerIndicator: 0,
  inventory: new Set<ItemId>(),
  owEventInfo: [],
  roomState: [],
  ...partial,
});

const spriteObs = (sprite: SimSprite, presenceState: PresenceGameState): SimObservation => ({
  ...baseObs(emptySnapshot()),
  interactables: { chests: [], sprites: [sprite], doors: [] },
  presenceState,
});

const makeSprite = (spriteType: number, kind: SimSprite['kind'], roomId: number): SimSprite => ({
  roomId,
  spriteType,
  tile: { row: 0, col: 0 },
  posKnown: false,
  kind,
});

describeDataset('discoverTargets and NPC room-aware matching', () => {
  it('matches Link\'s Uncle (0x73) in the secret passage room 0x55', () => {
    const obs = spriteObs(makeSprite(0x73, 'npc', PASSAGE_ROOM), presenceWith());
    expect(discoverTargets(freshState(), obs, undefined)).toHaveLength(1);
  });

  it('does NOT match the house uncle (0x73) in Link\'s house room 0x104', () => {
    const obs = spriteObs(makeSprite(0x73, 'npc', HOUSE_ROOM), presenceWith());
    expect(discoverTargets(freshState(), obs, undefined)).toHaveLength(0);
  });
});

describeDataset('discoverTargets and NPC presence gating', () => {
  it('discovers a conditional room-less NPC when its condition holds (King Zora, no Flippers)', () => {
    const obs = spriteObs(makeSprite(0x52, 'npc', 0x181), presenceWith());
    expect(discoverTargets(freshState(), obs, undefined)).toHaveLength(1);
  });

  it('drops a conditional room-less NPC when its condition fails (King Zora, Flippers owned)', () => {
    const obs = spriteObs(makeSprite(0x52, 'npc', 0x181), presenceWith({ inventory: new Set(['item-031' as const]) }));
    expect(discoverTargets(freshState(), obs, undefined)).toHaveLength(0);
  });

  it('discovers the first sage once the pendant is in hand', () => {
    const obs = spriteObs(makeSprite(0x16, 'npc', 0x1ea), presenceWith({ inventory: new Set(['item-056' as const]) }));
    expect(discoverTargets(freshState(), obs, undefined)).toHaveLength(1);
  });

  it('drops the first sage before the pendant, and again once his gift is already held', () => {
    const before = spriteObs(makeSprite(0x16, 'npc', 0x1ea), presenceWith({ progressFlags: 0x10 }));
    expect(discoverTargets(freshState(), before, undefined)).toHaveLength(0);
    const after = spriteObs(makeSprite(0x16, 'npc', 0x1ea),
      presenceWith({ inventory: new Set(['item-056' as const, 'item-076' as const]) }));
    expect(discoverTargets(freshState(), after, undefined)).toHaveLength(0);
  });

  it('ignores a non-check sprite (no NPC config, so no trigger)', () => {
    const obs = spriteObs(makeSprite(0xee, 'other', 0x104), presenceWith());
    expect(discoverTargets(freshState(), obs, undefined)).toHaveLength(0);
  });
});
