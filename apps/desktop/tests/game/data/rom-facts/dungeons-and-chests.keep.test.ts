/* @layer tests @kind test */
import { readFileSync } from 'fs';
import { join } from 'path';
import { expect, it } from 'vitest';
import { all } from '@rotp/game-data';
import { censusFindings, readRomCensus } from '@rotp/randomizer';
import { describeRom, usRom } from '../rom-fixture';
import { BOSS_TAGS, CHEST_ROW_EXCEPTIONS, CORE, SPECIAL_SCREENS } from './rom-facts.constants';
import { readRomFacts } from './read-rom-facts';
import { roomOf } from './room-of';

describeRom('native dungeon and chest ids, against the cartridge', () => {
  const { rom, screens } = readRomFacts();

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

  it('agrees with the dungeon map about which rooms belong to which dungeon', () => {
    const wrong: string[] = [];
    for (const screen of screens) {
      const room = screen.gameId.roomIndex;
      const palace = screen.gameId.palaceIndex;
      if (room === undefined || palace === undefined) continue;
      const drawn = rom.palaceOfRoom.get(room);
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
