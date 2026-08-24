/* @layer shared-asset-extraction @kind data */
/**
 * Bank 1 of the room grid: rows 20-39 of the same 16-wide grid, ids 0x140-0x27F.
 *
 * The engine's world is one flat grid where doors and edges are id arithmetic with no
 * ownership, so a dungeon that shares ids with the base game shares its neighbours too. The
 * extra dungeon is relocated a whole bank below instead: every room keeps the cartridge's own
 * relative geometry, in-bank arithmetic never reaches bank 0, and the header's one-byte travel
 * destinations keep working because the engine writes them into the room index's low byte,
 * preserving the bank.
 */

const ROOM_BANK_BASE = 0x140;

/** The cartridge's own id, relocated into the bank; relative geometry unchanged. */
const bankedRoomId = (gbaRoomId: number): number => ROOM_BANK_BASE + gbaRoomId;

export { ROOM_BANK_BASE, bankedRoomId };
