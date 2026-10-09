/* @layer tests @kind test */
import { expect, it } from 'vitest';
import { all, getScreen } from '@shared/game/data';
import type { ConnectionRecord } from '@shared/game/data/types';
import { readRomRoomDoors } from '@shared/randomizer/audit/rom-room-doors';
import { describeRom, usRom } from '../rom-fixture';
import { KEY_GATED_CROSSINGS } from './rom-facts.constants';
import { readRomFacts } from './read-rom-facts';
import { roomOf } from './room-of';

describeRom('native connection ids, against the cartridge', () => {
  const { rom, connections, mouthsById } = readRomFacts();

  it('puts every connection entranceId on a mouth of its own screen area, or in its own room', () => {
    const wrong: string[] = [];
    for (const connection of connections) {
      const id = connection.gameId?.entranceId;
      if (id === undefined) continue;
      const screen = getScreen(connection.screenId);
      const mouths = mouthsById.get(id) ?? [];
      if (screen.kind === 'overworld') {
        const index = screen.gameId.overworldIndex;
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
});
