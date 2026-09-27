/* @layer tests @kind test */
/**
 * Every native id on a record, held against the cartridge.
 *
 * A `gameId` number is the game's own, so nothing here transcribes one: the suite reads the
 * tables out of a US ROM and asserts the records agree. Without a ROM the whole suite skips,
 * so a clone that has none stays green (`rom-fixture.ts`).
 *
 * The two hand tables these ids will generate are checked here too, so the day they are
 * generated the numbers are already proven: `kBossRoomByPalace` in story_events.c and the
 * area heads in event_areas.h.
 */
import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import { expect, it } from 'vitest';
import { all, getScreen } from '@shared/game/data';
import type { ConnectionRecord, ScreenRecord } from '@shared/game/data/types';
import { censusFindings, readRomCensus } from '@shared/randomizer/audit/rom-census';
import { readRomNativeTables } from '@shared/randomizer/audit/rom-native-tables';
import { readRomRoomDoors } from '@shared/randomizer/audit/rom-room-doors';
import { describeRom, usRom } from './rom-fixture';

const CORE = resolve(__dirname, '..', '..', '..', 'core', 'game-hooks', 'events');
const STORY_EVENTS = resolve(__dirname, '..', '..', '..', 'core', 'game-hooks', 'story_events.c');
const SPECIAL_SCREENS = [0x80, 0x81];
/** The room header tags a boss room carries: "kill enemy to clear level", or Agahnim's own. */
const BOSS_TAGS = [37, 56];
/**
 * The chest game's chests are room objects, not rows of the native chest table, so no
 * (roomId, chestIndex) pair can name its prize and this row cannot be made to resolve.
 *
 * dungeon.c:5834 `OpenMiniGameChest` is the whole mechanic: it spends a credit, then picks a
 * prize by a random index. Two rooms read a rupee table by the room's low byte (0x00 and 0x18);
 * every other minigame room draws index 0..7 from `kDungeon_MinigameChestPrizes1`, refuses the
 * index it handed out last, and treats index 7 as a one-time keepsake guarded by bit 0x4000 of
 * that room's `dung_savegame_state_bits`. So the truthful key for this check is a room plus that
 * mask, the shape the event rows already use, never a chest slot.
 *
 * The row's own screen now carries room 0x106, which the four overworld doors of the chest game
 * and the brewery share, so the room agrees and only the slot is left unresolvable.
 */
const CHEST_ROW_EXCEPTIONS = ['check-270'];

/**
 * The entrance ids the overworld offers no door for.
 *
 * Entrance 0 is the opening room, which the game enters from the intro script and never from a
 * doorway, so no slot of the 129 carries it. `kEntranceData_rooms` still names its room, which
 * is what the record is held against.
 */
const SCRIPTED_ENTRANCES = [0];

/**
 * The list of rooms a door opens into that no screen holds is GONE, because every one is held.
 *
 * The four that stood here were the East Death Mountain caves, and the exit table and the room
 * headers settled them: Paradox Cave took rooms 0xDF, 0xEF and 0xFF, Spiral Cave 0xEE and 0xFE,
 * Fairy Ascension Cave 0xED and 0xFD, and the Bumper Cave the two dark-world rooms 0xEB and 0xFB
 * the dataset had lent to the first two. Do not bring the list back; fix the room instead.
 *
 * The entrance ids no screen carries, and why each is safe to leave.
 *
 * Both are fall-hole mouths whose landing room a door already reaches, so the room is held by
 * the screen that carries that door and the hole is a second reading of the same place:
 * entrance 118 drops into room 0x58, whose door is entrance 42, and entrance 121 drops into
 * room 0x56, whose door is entrance 40. Every other one of the 129 slots is carried by a screen.
 */
const MOUTHS_NO_SCREEN_CARRIES = [118, 121];

/**
 * Every interior now agrees with the area its own door stands in.
 *
 * The one exception was the dark-world lumberjack shop, whose door stands on overworld screen
 * 0x42 while our record for 0x42 carried the mountain's area. That screen is the clearing east
 * of Skull Woods and now carries Skull Woods' area, which is the shop's own, so the exception
 * is gone. Keep the list empty: a new entry means an area is wrong, not that the test is.
 */
const MOUTH_AREA_EXCEPTIONS: readonly string[] = [];

/**
 * The dungeon crossings whose own side the cartridge locks, which is where a key requirement
 * comes from. `Dungeon_ProcessTorchesAndDoors` (dungeon.c:5069-5094) reads the door type of the
 * room the player stands in, so one doorway can ask for a key one way and the big key the other,
 * and the count is of SIDES, not doorways.
 */
const KEY_GATED_CROSSINGS = 59;

const roomOf = (screenId: string): number | undefined => getScreen(screenId).gameId.roomIndex;

describeRom('native ids, against the cartridge', () => {
  const rom = readRomNativeTables(usRom());
  const screens = all('screen') as readonly ScreenRecord[];
  const connections = all('connection') as readonly ConnectionRecord[];
  const mouthsById = new Map<number, typeof rom.mouths[number][]>();
  for (const mouth of rom.mouths) {
    mouthsById.set(mouth.entranceId, [...(mouthsById.get(mouth.entranceId) ?? []), mouth]);
  }

  it('reads the tables at their documented sizes', () => {
    expect(rom.areaHeads).toHaveLength(64);
    expect(rom.entranceRooms).toHaveLength(133);
    expect(rom.entrancePalaces).toHaveLength(133);
    expect(rom.mouths.filter((m) => m.table === 'entrance')).toHaveLength(129);
    expect(rom.mouths.filter((m) => m.table === 'hole')).toHaveLength(19);
    expect(rom.exits).toHaveLength(79);
  });

  it('gives every screen entranceId a mouth that lands in that screen room', () => {
    const wrong = screens
      .filter((screen) => screen.gameId.entranceId !== undefined)
      .map((screen) => {
        const id = screen.gameId.entranceId as number;
        const mouths = mouthsById.get(id) ?? [];
        const room = rom.entranceRooms[id];
        const scripted = SCRIPTED_ENTRANCES.includes(id);
        return {
          screen: screen.id,
          reason: mouths.length === 0 && !scripted ? 'no overworld mouth carries this entrance id'
            : room !== screen.gameId.roomIndex ? `the entrance lands in room 0x${room.toString(16)}, not 0x${(screen.gameId.roomIndex ?? 0).toString(16)}`
              : null,
        };
      })
      .filter((row) => row.reason !== null);
    expect(wrong).toEqual([]);
  });

  it('keeps an interior in the area its own door stands in', () => {
    const areaOfScreen = (index: number): string | undefined =>
      screens.find((screen) => screen.gameId.overworldIndex === index)?.areaId;
    const wrong = screens
      .filter((screen) => screen.kind === 'interior' && screen.gameId.entranceId !== undefined)
      .filter((screen) => !MOUTH_AREA_EXCEPTIONS.includes(screen.id))
      .map((screen) => {
        const areas = new Set((mouthsById.get(screen.gameId.entranceId as number) ?? [])
          .map((mouth) => areaOfScreen(mouth.screen))
          .filter((area): area is string => area !== undefined));
        return areas.size === 0 || areas.has(screen.areaId) ? null
          : `${screen.id}: filed under ${screen.areaId}, its doors stand in ${[...areas].join('/')}`;
      })
      .filter((row) => row !== null);
    expect(wrong).toEqual([]);
  });

  it('puts a chest check on the screen that holds its room', () => {
    const wrong: string[] = [];
    for (const check of all('check')) {
      const room = (check.gameId as { roomId?: number }).roomId;
      if (check.kind !== 'chest' || room === undefined || !check.screenId) continue;
      if (CHEST_ROW_EXCEPTIONS.includes(check.id)) continue;
      if (roomOf(check.screenId) !== room) {
        wrong.push(`${check.id}: chest in room 0x${room.toString(16)}, screen ${check.screenId}`);
      }
    }
    expect(wrong).toEqual([]);
  });

  it('never gives one mouth to more screens than the cartridge has slots for it', () => {
    const claims = new Map<number, string[]>();
    for (const screen of screens) {
      const id = screen.gameId.entranceId;
      if (id === undefined || SCRIPTED_ENTRANCES.includes(id)) continue;
      claims.set(id, [...(claims.get(id) ?? []), screen.id]);
    }
    const over = [...claims]
      .filter(([id, list]) => list.length > (mouthsById.get(id) ?? []).length)
      .map(([id, list]) => `entrance ${id}: ${list.join(', ')}`);
    expect(over).toEqual([]);
  });

  it('gives every room a door opens into a screen that carries one of its doors', () => {
    const entrancesOfRoom = new Map<number, Set<number>>();
    for (const mouth of rom.mouths) {
      const room = rom.entranceRooms[mouth.entranceId];
      entrancesOfRoom.set(room, (entrancesOfRoom.get(room) ?? new Set()).add(mouth.entranceId));
    }
    const missing: string[] = [];
    for (const [room, entrances] of entrancesOfRoom) {
      const held = screens.filter((screen) => screen.gameId.roomIndex === room);
      if (held.length === 0) { missing.push(`room 0x${room.toString(16)}: no screen at all`); continue; }
      if (!held.some((screen) => screen.gameId.entranceId !== undefined && entrances.has(screen.gameId.entranceId))) {
        missing.push(`room 0x${room.toString(16)}: ${held.map((s) => s.id).join('/')} carry no door of it`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('gives every mouth of the cartridge a screen, or a room a door already holds', () => {
    const carried = new Set(screens.map((screen) => screen.gameId.entranceId).filter((id) => id !== undefined));
    const uncarried = [...new Set(rom.mouths.map((mouth) => mouth.entranceId))]
      .filter((id) => !carried.has(id) && !SCRIPTED_ENTRANCES.includes(id));
    expect(uncarried.sort((a, b) => a - b)).toEqual([...MOUTHS_NO_SCREEN_CARRIES].sort((a, b) => a - b));
    // Each one lands in a room a screen holds by a door of its own, so nothing is lost by it.
    const lost = MOUTHS_NO_SCREEN_CARRIES.filter((id) => {
      const room = rom.entranceRooms[id];
      return !screens.some((screen) => screen.gameId.roomIndex === room && screen.gameId.entranceId !== undefined);
    }).map((id) => `entrance ${id} lands in room 0x${rom.entranceRooms[id].toString(16)}, which no door-carrying screen holds`);
    expect(lost).toEqual([]);
  });

  it('never claims a room with more doors than the cartridge reaches it by', () => {
    const doorsOfRoom = new Map<number, number>();
    for (const mouth of rom.mouths) {
      const room = rom.entranceRooms[mouth.entranceId];
      doorsOfRoom.set(room, (doorsOfRoom.get(room) ?? 0) + 1);
    }
    const over: string[] = [];
    for (const [room, doors] of doorsOfRoom) {
      // A screen with no entrance id of its own is a variant of a room, never a claim on a door.
      const claiming = screens.filter((screen) => screen.gameId.roomIndex === room
        && screen.gameId.entranceId !== undefined
        && !SCRIPTED_ENTRANCES.includes(screen.gameId.entranceId));
      if (claiming.length > doors) {
        over.push(`room 0x${room.toString(16)}: ${claiming.length} screens carry a door, the cartridge has ${doors}`);
      }
    }
    expect(over).toEqual([]);
  });

  it('keeps a dungeon screen entranceId on an entrance that enters that dungeon', () => {
    const wrong = screens
      .filter((screen) => screen.gameId.entranceId !== undefined && screen.gameId.palaceIndex !== undefined)
      .filter((screen) => rom.entrancePalaces[screen.gameId.entranceId as number] !== screen.gameId.palaceIndex)
      .map((screen) => `${screen.id}: entrance ${screen.gameId.entranceId} belongs to palace ${rom.entrancePalaces[screen.gameId.entranceId as number]}, the screen to ${screen.gameId.palaceIndex}`);
    expect(wrong).toEqual([]);
  });

  it('puts every connection entranceId on a mouth of its own screen area, or in its own room', () => {
    const wrong: string[] = [];
    for (const connection of connections) {
      const id = connection.gameId?.entranceId;
      if (id === undefined) continue;
      const screen = getScreen(connection.screenId);
      const mouths = mouthsById.get(id) ?? [];
      if (screen.kind === 'overworld') {
        const index = screen.gameId.overworldIndex;
        // A screen the dataset places by name only has no native index to hold the mouth against.
        if (index === undefined) continue;
        if (!mouths.some((mouth) => mouth.area === rom.headOf(index))) {
          wrong.push(`${connection.id}: entrance ${id} has no mouth in area 0x${rom.headOf(index).toString(16)}`);
        }
      } else if (rom.entranceRooms[id] !== screen.gameId.roomIndex) {
        wrong.push(`${connection.id}: entrance ${id} lands in room 0x${rom.entranceRooms[id].toString(16)}, the screen is 0x${(screen.gameId.roomIndex ?? 0).toString(16)}`);
      }
    }
    expect(wrong).toEqual([]);
  });

  it('puts every connection exitId on the room that exit leaves', () => {
    const wrong: string[] = [];
    for (const connection of connections) {
      const id = connection.gameId?.exitId;
      if (id === undefined) continue;
      expect(id).toBeLessThan(rom.exits.length);
      const room = roomOf(connection.screenId);
      if (rom.exits[id].room !== room) {
        wrong.push(`${connection.id}: exit ${id} leaves room 0x${rom.exits[id].room.toString(16)}, the screen is 0x${(room ?? 0).toString(16)}`);
      }
    }
    expect(wrong).toEqual([]);
  });

  it('puts every connection holeIndex on a fall hole that drops into the other end room', () => {
    const holes = rom.mouths.filter((mouth) => mouth.table === 'hole');
    const wrong: string[] = [];
    for (const connection of connections) {
      const index = connection.gameId?.holeIndex;
      if (index === undefined) continue;
      const slot = holes.find((mouth) => mouth.slot === index);
      if (!slot) { wrong.push(`${connection.id}: no fall-hole slot ${index}`); continue; }
      const other = connections.find((candidate) => candidate.id === connection.toConnectionId);
      const ends = [getScreen(connection.screenId), other ? getScreen(other.screenId) : undefined];
      const landing = rom.entranceRooms[slot.entranceId];
      if (!ends.some((end) => end?.gameId.roomIndex === landing)) {
        wrong.push(`${connection.id}: slot ${index} drops into room 0x${landing.toString(16)}, neither end holds it`);
      }
      const outside = ends.find((end) => end?.gameId.overworldIndex !== undefined);
      if (outside && rom.headOf(outside.gameId.overworldIndex as number) !== rom.headOf(slot.area)) {
        wrong.push(`${connection.id}: slot ${index} sits in area 0x${rom.headOf(slot.area).toString(16)}, the screen in 0x${rom.headOf(outside.gameId.overworldIndex as number).toString(16)}`);
      }
    }
    expect(wrong).toEqual([]);
  });

  it('agrees with the dungeon map about which rooms belong to which dungeon', () => {
    const wrong: string[] = [];
    for (const screen of screens) {
      const room = screen.gameId.roomIndex;
      const palace = screen.gameId.palaceIndex;
      if (room === undefined || palace === undefined) continue;
      const drawn = rom.palaceOfRoom.get(room);
      // A room the map leaves out is an off-map room, which says nothing either way.
      if (drawn !== undefined && drawn !== palace) {
        wrong.push(`${screen.id}: room 0x${room.toString(16)} is drawn under palace ${drawn}, the screen claims ${palace}`);
      }
    }
    expect(wrong).toEqual([]);
  });

  it('gives every room the dungeon map draws a screen of that dungeon', () => {
    const held = new Set(screens.map((screen) => `${screen.gameId.palaceIndex}:${screen.gameId.roomIndex}`));
    const missing = [...rom.palaceOfRoom]
      .filter(([room, palace]) => !held.has(`${palace}:${room}`))
      .map(([room, palace]) => `palace ${palace} room 0x${room.toString(16)}`);
    expect(missing).toEqual([]);
  });

  it('points every connection stairIndex at the room header slot that travels there', () => {
    const wrong: string[] = [];
    for (const connection of connections) {
      const index = connection.gameId?.stairIndex;
      if (index === undefined) continue;
      const from = roomOf(connection.screenId);
      const other = connections.find((candidate) => candidate.id === connection.toConnectionId);
      const to = other ? roomOf(other.screenId) : undefined;
      if (from === undefined || to === undefined) { wrong.push(`${connection.id}: an end carries no roomIndex`); continue; }
      const travel = rom.roomTravel(from).stairDest;
      if (travel[index] !== to) {
        wrong.push(`${connection.id}: room 0x${from.toString(16)} staircase ${index} travels to 0x${travel[index].toString(16)}, not 0x${to.toString(16)}`);
      }
    }
    expect(wrong).toEqual([]);
  });

  it('gives every dungeon a bossRoomId the cartridge marks as a boss room', () => {
    const wrong: string[] = [];
    for (const dungeon of all('dungeon')) {
      const room = dungeon.gameId.bossRoomId;
      if (room === undefined) continue;
      const tags = rom.roomTravel(room).tags;
      if (!tags.some((tag) => BOSS_TAGS.includes(tag))) {
        wrong.push(`${dungeon.id}: room 0x${room.toString(16)} carries tags ${tags.join('/')}, none of them a boss tag`);
      }
    }
    expect(wrong).toEqual([]);
  });

  it('agrees with the hand table bossRoomId will generate', () => {
    const source = readFileSync(STORY_EVENTS, 'utf-8');
    const body = source.match(/kBossRoomByPalace\[14\] = \{([^}]*)\}/)?.[1] ?? '';
    const table = body.split(',').map((part) => part.trim()).filter((part) => part.length > 0).map(Number);
    expect(table).toHaveLength(14);
    const wrong: string[] = [];
    for (const dungeon of all('dungeon')) {
      const room = dungeon.gameId.bossRoomId;
      if (room === undefined || dungeon.gameId.palaceIndex === undefined) continue;
      const held = table[dungeon.gameId.palaceIndex / 2];
      if (held !== room) wrong.push(`${dungeon.id}: the C table holds 0x${held.toString(16)}, the record 0x${room.toString(16)}`);
    }
    expect(wrong).toEqual([]);
  });

  it('backs every key requirement on a dungeon crossing with a lock in that same room', () => {
    const doorsByRoom = readRomRoomDoors(usRom());
    const keyGates = new Map<string, string>();
    for (const dungeon of all('dungeon')) {
      if (dungeon.items.smallKey) keyGates.set(dungeon.items.smallKey, 'small-key');
      if (dungeon.items.bigKey) keyGates.set(dungeon.items.bigKey, 'big-key');
    }
    const asks = (connection: ConnectionRecord): string | undefined => {
      const requirement = connection.requirements;
      if (requirement === undefined || !('itemId' in requirement)) return undefined;
      return keyGates.get(requirement.itemId);
    };
    const gated = connections.filter((connection) => asks(connection) !== undefined);
    expect(gated).toHaveLength(KEY_GATED_CROSSINGS);
    const wrong: string[] = [];
    for (const connection of gated) {
      const room = roomOf(connection.screenId);
      const doors = room === undefined ? [] : doorsByRoom.get(room) ?? [];
      if (!doors.some((door) => door.gate === asks(connection))) {
        wrong.push(`${connection.id}: room 0x${room?.toString(16)} declares no ${asks(connection)} lock`);
      }
    }
    expect(wrong).toEqual([]);
  });

  it('resolves every chest check in the native chest table', () => {
    const findings = censusFindings(readRomCensus(usRom()), all('check'), all('item'));
    expect(findings.chestMismatches.map((row) => row.checkId)).toEqual(CHEST_ROW_EXCEPTIONS);
    expect(findings.vanillaItemDiffs).toEqual([]);
  });

  it('keeps every area-head event on an area that is its own head', () => {
    const source = readFileSync(join(CORE, 'event_areas.h'), 'utf-8');
    const heads = [...source.matchAll(/\{\s*(0x[0-9A-Fa-f]{2}),\s*kEvent_Area_/g)].map((match) => Number(match[1]));
    expect(heads.length).toBeGreaterThan(50);
    const wrong = heads
      .filter((head) => !SPECIAL_SCREENS.includes(head) && !rom.isAreaHead(head))
      .map((head) => `0x${head.toString(16)} heads to 0x${rom.headOf(head).toString(16)}`);
    expect(wrong).toEqual([]);
  });
});
