/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import type { SimSprite } from '../../shared/game/simulation/types';
import { planTrigger, planSpriteTrigger } from '../../shared/game/simulation/trigger/trigger-plans';
import { find } from '../../shared/game/data';
import { describeDataset } from '../dataset-guard';

// Overworld sprite → TriggerAction mapping. Outdoor discovery uses the same
// kind-based dispatch as indoors: NPC-kind sprites resolve their flag/item
// payload from the check records' gameId by spriteType; anything else maps to
// null so the engine skips it (no invented overworld mask).

const KING_ZORA_TYPE = 0x52;
const ZORAS_DOMAIN_SCREEN = 0x0f;

const owSprite = (spriteType: number, kind: SimSprite['kind']): SimSprite => ({
  roomId: ZORAS_DOMAIN_SCREEN,
  spriteType,
  tile: { row: 10, col: 20 },
  posKnown: true,
  kind,
});

describeDataset('planSpriteTrigger on outdoor sprites', () => {
  it("maps an overworld NPC sprite to its npc trigger via the check's own gameId", () => {
    const cfg = find('check', c => c.gameId.spriteType === KING_ZORA_TYPE)[0]?.gameId;
    expect(cfg).toBeDefined();

    const action = planSpriteTrigger(owSprite(KING_ZORA_TYPE, 'npc'));
    expect(action).toEqual({
      type: 'npc',
      flagType: cfg!.flagType,
      flagMask: cfg!.flagMask,
      itemId: cfg!.itemId,
    });
  });

  it('returns null for an unknown outdoor sprite (kind "other")', () => {
    expect(planSpriteTrigger(owSprite(0x00, 'other'))).toBeNull();
  });

  it('returns null for an NPC-kind sprite with no matching check record', () => {
    expect(planSpriteTrigger(owSprite(0xfe, 'npc'))).toBeNull();
  });

  it('dispatches an outdoor sprite through planTrigger by shape', () => {
    expect(planTrigger(owSprite(0x00, 'other'))).toBeNull();
  });
});
