/* @layer tests @kind test */
import { expect, it } from 'vitest';
import type { ScreenRecord } from '@rotp/game-data';
import { required } from '../../../required';
import { describeRom } from '../rom-fixture';
import { MOUTH_AREA_EXCEPTIONS, MOUTHS_NO_SCREEN_CARRIES, SCRIPTED_ENTRANCES } from './rom-facts.constants';
import type { RomFacts } from './rom-facts.type';
import { readRomFacts } from './read-rom-facts';

type LandingCase = { screen: ScreenRecord; mouthCount: number; scripted: boolean; room: number | undefined };

const landingReason = ({ screen, mouthCount, scripted, room }: LandingCase): string | null => {
  if (mouthCount === 0 && !scripted) return 'no overworld mouth carries this entrance id';
  if (room !== screen.gameId.roomIndex) {
    return `the entrance lands in room 0x${required(room, 'entrance room').toString(16)}, not 0x${(screen.gameId.roomIndex ?? 0).toString(16)}`;
  }
  return null;
};

const entranceLandingMismatches = ({ rom, screens, mouthsById }: RomFacts) => screens
  .filter((screen) => screen.gameId.entranceId !== undefined)
  .map((screen) => {
    const id = screen.gameId.entranceId as number;
    const mouths = mouthsById.get(id) ?? [];
    const room = rom.entranceRooms[id];
    const scripted = SCRIPTED_ENTRANCES.includes(id);
    return { screen: screen.id, reason: landingReason({ screen, mouthCount: mouths.length, scripted, room }) };
  })
  .filter((row) => row.reason !== null);

const interiorAreaMismatches = ({ screens, mouthsById }: RomFacts) => {
  const areaOfScreen = (index: number): string | undefined =>
    screens.find((screen) => screen.gameId.overworldIndex === index)?.areaId;
  const areasOfDoors = (entranceId: number): Set<string> => new Set((mouthsById.get(entranceId) ?? [])
    .map((mouth) => areaOfScreen(mouth.screen))
    .filter((area): area is string => area !== undefined));
  return screens
    .filter((screen) => screen.kind === 'interior' && screen.gameId.entranceId !== undefined)
    .filter((screen) => !MOUTH_AREA_EXCEPTIONS.includes(screen.id))
    .map((screen) => {
      const areas = areasOfDoors(screen.gameId.entranceId as number);
      return areas.size === 0 || areas.has(screen.areaId) ? null
        : `${screen.id}: filed under ${screen.areaId}, its doors stand in ${[...areas].join('/')}`;
    })
    .filter((row) => row !== null);
};

const overclaimedMouths = ({ screens, mouthsById }: RomFacts): string[] => {
  const claims = new Map<number, string[]>();
  for (const screen of screens) {
    const id = screen.gameId.entranceId;
    if (id === undefined || SCRIPTED_ENTRANCES.includes(id)) continue;
    claims.set(id, [...(claims.get(id) ?? []), screen.id]);
  }
  return [...claims]
    .filter(([id, list]) => list.length > (mouthsById.get(id) ?? []).length)
    .map(([id, list]) => `entrance ${id}: ${list.join(', ')}`);
};

const roomsWithoutDoorScreen = ({ rom, screens }: RomFacts): string[] => {
  const entrancesOfRoom = new Map<number, Set<number>>();
  for (const mouth of rom.mouths) {
    const room = required(rom.entranceRooms[mouth.entranceId], `room of entrance ${mouth.entranceId}`);
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
  return missing;
};

const lostMouths = ({ rom, screens }: RomFacts): string[] => MOUTHS_NO_SCREEN_CARRIES.filter((id) => {
  const room = rom.entranceRooms[id];
  return !screens.some((screen) => screen.gameId.roomIndex === room && screen.gameId.entranceId !== undefined);
}).map((id) => `entrance ${id} lands in room 0x${required(rom.entranceRooms[id], `room of entrance ${id}`).toString(16)}, which no door-carrying screen holds`);

const overclaimedRooms = ({ rom, screens }: RomFacts): string[] => {
  const doorsOfRoom = new Map<number, number>();
  for (const mouth of rom.mouths) {
    const room = required(rom.entranceRooms[mouth.entranceId], `room of entrance ${mouth.entranceId}`);
    doorsOfRoom.set(room, (doorsOfRoom.get(room) ?? 0) + 1);
  }
  const over: string[] = [];
  for (const [room, doors] of doorsOfRoom) {
    const claiming = screens.filter((screen) => screen.gameId.roomIndex === room
      && screen.gameId.entranceId !== undefined
      && !SCRIPTED_ENTRANCES.includes(screen.gameId.entranceId));
    if (claiming.length > doors) {
      over.push(`room 0x${room.toString(16)}: ${claiming.length} screens carry a door, the cartridge has ${doors}`);
    }
  }
  return over;
};

describeRom('native entrance ids, against the cartridge', () => {
  const facts = readRomFacts();
  const { rom, screens } = facts;

  it('reads the tables at their documented sizes', () => {
    expect(rom.areaHeads).toHaveLength(64);
    expect(rom.entranceRooms).toHaveLength(133);
    expect(rom.entrancePalaces).toHaveLength(133);
    expect(rom.mouths.filter((m) => m.table === 'entrance')).toHaveLength(129);
    expect(rom.mouths.filter((m) => m.table === 'hole')).toHaveLength(19);
    expect(rom.exits).toHaveLength(79);
  });

  it('gives every screen entranceId a mouth that lands in that screen room', () => {
    expect(entranceLandingMismatches(facts)).toEqual([]);
  });

  it('keeps an interior in the area its own door stands in', () => {
    expect(interiorAreaMismatches(facts)).toEqual([]);
  });

  it('never gives one mouth to more screens than the cartridge has slots for it', () => {
    expect(overclaimedMouths(facts)).toEqual([]);
  });

  it('gives every room a door opens into a screen that carries one of its doors', () => {
    expect(roomsWithoutDoorScreen(facts)).toEqual([]);
  });

  it('gives every mouth of the cartridge a screen, or a room a door already holds', () => {
    const carried = new Set(screens.map((screen) => screen.gameId.entranceId).filter((id) => id !== undefined));
    const uncarried = [...new Set(rom.mouths.map((mouth) => mouth.entranceId))]
      .filter((id) => !carried.has(id) && !SCRIPTED_ENTRANCES.includes(id));
    expect(uncarried.sort((a, b) => a - b)).toEqual([...MOUTHS_NO_SCREEN_CARRIES].sort((a, b) => a - b));
    expect(lostMouths(facts)).toEqual([]);
  });

  it('never claims a room with more doors than the cartridge reaches it by', () => {
    expect(overclaimedRooms(facts)).toEqual([]);
  });

  it('keeps a dungeon screen entranceId on an entrance that enters that dungeon', () => {
    const wrong = screens
      .filter((screen) => screen.gameId.entranceId !== undefined && screen.gameId.palaceIndex !== undefined)
      .filter((screen) => rom.entrancePalaces[screen.gameId.entranceId as number] !== screen.gameId.palaceIndex)
      .map((screen) => `${screen.id}: entrance ${screen.gameId.entranceId} belongs to palace ${rom.entrancePalaces[screen.gameId.entranceId as number]}, the screen to ${screen.gameId.palaceIndex}`);
    expect(wrong).toEqual([]);
  });
});
