/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import type { SimSprite } from '../../shared/game/simulation/types';
import { planTrigger, planSpriteTrigger } from '../../shared/game/simulation/trigger/trigger-plans';
import { CHECK_NPC_FLAGS } from '../../shared/game/checks/flags';

// ─── Overworld sprite → TriggerAction mapping ────────────────────────────────
// Outdoor discovery routes every screen sprite through the same kind-based
// dispatch the indoor path uses: NPC-kind sprites resolve their flag/item payload
// from CHECK_NPC_FLAGS; anything else is not derivable data-free yet and maps to
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

describe('planSpriteTrigger — outdoor sprites', () => {
  it('maps an overworld NPC sprite to its npc trigger via CHECK_NPC_FLAGS', () => {
    const cfg = Object.values(CHECK_NPC_FLAGS).find(c => c.spriteType === KING_ZORA_TYPE);
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

  it('returns null for an NPC-kind sprite with no matching CHECK_NPC_FLAGS config', () => {
    expect(planSpriteTrigger(owSprite(0xfe, 'npc'))).toBeNull();
  });

  it('dispatches an outdoor sprite through planTrigger by shape', () => {
    expect(planTrigger(owSprite(0x00, 'other'))).toBeNull();
  });
});
