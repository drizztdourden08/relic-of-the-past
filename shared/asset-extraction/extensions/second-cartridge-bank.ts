/* @layer shared-asset-extraction @kind data */
/**
 * The extra dungeon's room bank: one full high-byte page of the grid, ids 0x200-0x2FF.
 *
 * The engine's world is one flat 16-wide grid where doors and edges are id arithmetic with no
 * ownership, so a dungeon that shares ids with the base game shares its neighbours too. The
 * dungeon is relocated a whole page down instead, and the page boundary is not arbitrary: the
 * engine writes every staircase and hole destination into the room index's LOW BYTE, so the
 * high byte is the machine's own bank concept. A base that is a multiple of 0x100 makes every
 * one of those writes bank-preserving with zero changes; anything else straddles pages and
 * byte-truncated destinations escape the dungeon (measured: base 0x140 sent a hub staircase
 * to 0x1E9 instead of 0x229).
 *
 * The cartridge's ids fit the page exactly - they are all below 0x100 - so every room keeps
 * its original relative geometry.
 */

const ROOM_BANK_BASE = 0x200;

/** The cartridge's own id, relocated into the bank; relative geometry unchanged. */
const bankedRoomId = (gbaRoomId: number): number => ROOM_BANK_BASE + gbaRoomId;

export { ROOM_BANK_BASE, bankedRoomId };
