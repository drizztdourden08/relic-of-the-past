/* @layer tests @kind test */
import { it, expect } from 'vitest';
import type { SimSprite } from '@rotp/navigation';
import { planTrigger, planSpriteTrigger } from '@rotp/navigation';
import { find } from '@rotp/game-data';
import { describeDataset } from '../dataset-guard';
import { required } from '../required';

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
    const found = find('check', c => c.gameId.spriteType === KING_ZORA_TYPE)[0]?.gameId;
    expect(found).toBeDefined();
    const cfg = required(found, 'King Zora check gameId');

    const action = planSpriteTrigger(owSprite(KING_ZORA_TYPE, 'npc'));
    expect(action).toEqual({
      type: 'npc',
      flagType: cfg.flagType,
      flagMask: cfg.flagMask,
      itemId: cfg.itemId,
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
