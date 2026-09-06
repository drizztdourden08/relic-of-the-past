/* @layer bridge-wasm @kind logic */
/**
 * Substitution-completion bits, TS view — the mirror of the C allocation in
 * core/game-hooks/npc_overrides.c (the single documented source of the byte
 * addresses and bit assignment). Several givers gate on POSSESSION of their
 * vanilla item and write no completion flag, so their record detections are
 * possession proxies — sound on a vanilla profile, false-positive the moment
 * a randomizer seed hands the vanilla item out elsewhere. When a session has
 * physically armed such a check, its completion must be read from the real
 * bit the substitution seam persists, exposed as progress-buffer bytes
 * [21]/[22] (state_queries.c). Keyed by check id; keep in lockstep with the
 * C table's vanilla-item rows.
 */

interface CompletionBit {
  bufferIndex: number;
  mask: number;
}

const SUBSTITUTION_BYTE_0 = 21;
const SUBSTITUTION_BYTE_1 = 22;
const SUBSTITUTION_BYTE_2 = 25;

const COMPLETION_BIT_BY_CHECK: ReadonlyMap<string, CompletionBit> = new Map([
  ['check-019', { bufferIndex: SUBSTITUTION_BYTE_0, mask: 0x01 }], // river king (swim gear)
  ['check-033', { bufferIndex: SUBSTITUTION_BYTE_0, mask: 0x02 }], // first sage (running gear)
  ['check-041', { bufferIndex: SUBSTITUTION_BYTE_0, mask: 0x04 }], // sick child (catching net)
  ['check-060', { bufferIndex: SUBSTITUTION_BYTE_0, mask: 0x08 }], // escorted elder (reflector)
  ['check-077', { bufferIndex: SUBSTITUTION_BYTE_0, mask: 0x10 }], // whirlpool dweller (third medallion)
  ['check-006', { bufferIndex: SUBSTITUTION_BYTE_0, mask: 0x20 }], // standing fungus
  ['check-055', { bufferIndex: SUBSTITUTION_BYTE_0, mask: 0x40 }], // shelved tome
  ['check-008', { bufferIndex: SUBSTITUTION_BYTE_0, mask: 0x80 }], // dug-up instrument
  ['check-080', { bufferIndex: SUBSTITUTION_BYTE_1, mask: 0x01 }], // desert tablet
  ['check-070', { bufferIndex: SUBSTITUTION_BYTE_1, mask: 0x02 }], // mountain tablet
  // The smithy row's own record flag (progress byte 2 bit 4) has NO vanilla
  // writer — a dead invented bit — so its armed completion reads this instead.
  ['check-039', { bufferIndex: SUBSTITUTION_BYTE_1, mask: 0x04 }], // smithy's tempered blade
  // The wish ponds' four gear upgrades (no vanilla completion flag at all).
  ['check-021', { bufferIndex: SUBSTITUTION_BYTE_1, mask: 0x08 }], // wish pond, returning-weapon slot
  ['check-022', { bufferIndex: SUBSTITUTION_BYTE_1, mask: 0x10 }], // wish pond, guard-gear slot
  ['check-266', { bufferIndex: SUBSTITUTION_BYTE_1, mask: 0x20 }], // cursed pond, blade slot
  ['check-267', { bufferIndex: SUBSTITUTION_BYTE_1, mask: 0x40 }], // cursed pond, piercing-shot slot
  // The scripted-grant surfaces with synthetic keys (byte 2 — no vanilla receive id).
  ['check-273', { bufferIndex: SUBSTITUTION_BYTE_2, mask: 0x01 }], // pond capacity, explosives slot
  ['check-274', { bufferIndex: SUBSTITUTION_BYTE_2, mask: 0x02 }], // pond capacity, projectiles slot
  ['check-040', { bufferIndex: SUBSTITUTION_BYTE_2, mask: 0x04 }], // the cave bat's meter upgrade
]);

/**
 * The real completion bit for one check, or undefined when the check's own
 * record detection is already a real fact (everything not in the table).
 */
const completionBitOf = (checkId: string): CompletionBit | undefined =>
  COMPLETION_BIT_BY_CHECK.get(checkId);

export { completionBitOf };
export type { CompletionBit };
