/* @layer shared-asset-extraction @kind logic */
/**
 * Recovers each room's object stream from its baked tilemaps, through the engine itself.
 *
 * The second cartridge shipped its rooms pre-expanded, losing the drawing program the engine
 * runs for every other room. This inverts that: the probe asks the engine what every object
 * draws, and the solver searches for a stream whose replay reproduces the baked maps. The
 * result is not byte-exact — a little decorative texture uses arrangements the object language
 * cannot express — but everything structural reproduces, and everything drawing registers
 * (doors, staircases, collision, priority) comes back for free.
 */
import { EXTRA_DUNGEON_DOORS } from '../../../extensions/second-cartridge-doors';
import { MEASURED_STAIR_SLOTS } from '../../../extensions/second-cartridge-stair-slots';
import { orderStairsToMeasuredSlots } from './stair-slots';
import { readFloorPatterns } from './base-map';
import { createEngineProbe } from './probe-host';
import { buildBytes } from './room-attempt';
import { solveRoom } from './solve-room';
import { WORD_MASK, buildDoorCatalogue, buildStampCatalogue, buildTemplates } from './stamp-catalogue';
import type { DungeonRoomRecord } from '../../../dungeon/model';
import type { DoorPlacement } from './room-attempt';
import type { EngineBundle, ProbeCell } from './probe.type';

/** Words the port used as filler on cells the original authors never meant. */
const LOWER_BLANK = [0x1c15 & WORD_MASK];
const UPPER_BLANK = [0x01ec & WORD_MASK, 0x01eb & WORD_MASK, 0x01e9 & WORD_MASK];
/** Floor/layout combinations tried per room, from the ranked list's head. */
const COMBO_TRIES = 3;
/** Header bytes 10-13 name the four staircase destinations. */
const FIRST_STAIR_BYTE = 10;

interface SolvedStreams {
  /** The recovered stream per room id, as the bytes the engine reads. */
  streams: Map<number, Buffer>;
  /** Residual cell count per room id — cells the stream cannot reproduce, for the log. */
  residuals: Map<number, number>;
}

const roomTargets = (room: DungeonRoomRecord): { tw: Uint16Array; care: Uint8Array } => {
  const tw = new Uint16Array(8192);
  const care = new Uint8Array(8192).fill(1);
  for (let i = 0; i < 4096; i++) {
    tw[i] = room.layers[0].snesWords[i] & WORD_MASK;
    tw[4096 + i] = room.layers[1].snesWords[i] & WORD_MASK;
    if (LOWER_BLANK.includes(tw[i])) care[i] = 0;
    if (UPPER_BLANK.includes(tw[4096 + i])) care[4096 + i] = 0;
  }
  return { tw, care };
};

const doorPlacements = (roomId: number, doorCatalogue: Map<string, ProbeCell[]>): DoorPlacement[] =>
  (EXTRA_DUNGEON_DOORS[roomId] ?? []).map(word => {
    const cells = doorCatalogue.get(`${word >> 8}/${(word >> 4) & 0xf}/${word & 3}`);
    if (!cells) throw new Error(`No door stamp for record 0x${word.toString(16)} in room 0x${roomId.toString(16)}`);
    return { word, cells: cells.map((c): [number, number] => [c.layer * 4096 + c.cell, c.word & WORD_MASK]) };
  });

const stairSlotsWanted = (room: DungeonRoomRecord, dungeonRooms: ReadonlySet<number>): number => {
  let last = -1;
  for (let slot = 0; slot < 4; slot++) {
    if (dungeonRooms.has(room.header.nativeBytes[FIRST_STAIR_BYTE + slot])) last = slot;
  }
  return last + 1;
};

/**
 * Solve every room. The engine bundle is the game's own build; the base container is the one
 * just compiled from the player's cartridge, so the probe draws with the player's own tiles.
 */
const solveGbaRoomStreams = async (
  bundle: EngineBundle,
  baseContainer: Buffer,
  rooms: DungeonRoomRecord[],
): Promise<SolvedStreams> => {
  const probe = await createEngineProbe(bundle, baseContainer);
  const st = buildStampCatalogue(probe);
  const doorCatalogue = buildDoorCatalogue(probe);
  const templates = buildTemplates(probe);
  const floors = readFloorPatterns(baseContainer);
  const dungeonRooms: ReadonlySet<number> = new Set(rooms.map(room => room.id));

  const streams = new Map<number, Buffer>();
  const residuals = new Map<number, number>();
  for (const room of rooms) {
    const { tw, care } = roomTargets(room);
    const solved = solveRoom({
      st, floors, templates, tw, care,
      doors: doorPlacements(room.id, doorCatalogue),
      stairSlotsWanted: stairSlotsWanted(room, dungeonRooms),
      tries: COMBO_TRIES,
    });
    // Where hardware measurements pin the staircase slots, re-order and re-type the stair
    // objects until the engine's own derivation, replayed over the candidate stream, hands
    // each staircase the slot the measurements demand.
    const spec = MEASURED_STAIR_SLOTS[room.id];
    if (spec) {
      const ordered = orderStairsToMeasuredSlots(
        probe, st, floors, templates, solved.combo, tw, care, solved.sections, spec,
        candidate => Uint8Array.from(buildBytes(st, solved.combo, candidate)));
      if (!ordered) throw new Error(`Room 0x${room.id.toString(16)}: no stair configuration satisfies the measured slots`);
      solved.sections = ordered.sections;
      solved.mism = ordered.mism;
    }
    streams.set(room.id, Buffer.from(buildBytes(st, solved.combo, solved.sections)));
    residuals.set(room.id, solved.mism);
  }
  return { streams, residuals };
};

export { solveGbaRoomStreams };
export type { SolvedStreams };
