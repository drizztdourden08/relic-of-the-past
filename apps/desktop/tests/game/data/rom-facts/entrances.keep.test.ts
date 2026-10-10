/* @layer tests @kind test */
import { expect, it } from 'vitest';
import { describeRom } from '../rom-fixture';
import { MOUTH_AREA_EXCEPTIONS, MOUTHS_NO_SCREEN_CARRIES, SCRIPTED_ENTRANCES } from './rom-facts.constants';
import { readRomFacts } from './read-rom-facts';

describeRom('native entrance ids, against the cartridge', () => {
  const { rom, screens, mouthsById } = readRomFacts();

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
});
