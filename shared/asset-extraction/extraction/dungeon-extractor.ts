/**
 * Dungeon extraction orchestration — extracts all 320 rooms, defaults, overlays, and map32 data.
 *
 * Ported from: core/zelda3/assets/extract_resources.py (dungeon portion)
 */
import * as yaml from 'js-yaml';
import type { RomData } from '../rom/rom-types';
import { getChestInfo, pitsHurtPlayer } from './chest-pit-extractor';
import { getEntranceInfo } from './entrance-extractor';
import { decodeRoomObjects } from './room-object-decoder';
import type { RoomObject } from './room-object-decoder';
import { extractRoom } from './room-extractor';

/**
 * Extract all 320 dungeon rooms from ROM.
 * @returns Map of filename → YAML content
 */
function extractAllDungeonRooms(rom: RomData): Map<string, string> {
  const entrances0 = getEntranceInfo(rom, 0);
  const entrances1 = getEntranceInfo(rom, 1);
  const chestInfoMap = getChestInfo(rom);
  const pitsHurt = pitsHurtPlayer(rom);

  const results = new Map<string, string>();
  for (let i = 0; i < 320; i++) {
    results.set(`dungeon/dungeon-${i}.yaml`, extractRoom(rom, i, entrances0, entrances1, chestInfoMap, pitsHurt));
  }
  return results;
}

/**
 * Extract default rooms (8 entries).
 */
function extractDefaultRooms(rom: RomData): string {
  const defaultRooms: Record<string, RoomObject[]> = {};
  for (let i = 0; i < 8; i++) {
    const p = 0x84ef2f + i * 3;
    const roomAddr = rom.getByte(p) | (rom.getByte(p + 1) << 8) | (rom.getByte(p + 2) << 16);
    const { objs } = decodeRoomObjects(rom, roomAddr);
    defaultRooms[`Default${i}`] = objs;
  }
  return yaml.dump(defaultRooms, { flowLevel: -1, sortKeys: false });
}

/**
 * Extract overlay rooms (19 entries).
 */
function extractOverlayRooms(rom: RomData): string {
  const overlayRooms: Record<string, RoomObject[]> = {};
  for (let i = 0; i < 19; i++) {
    const p = 0x84ecc0 + i * 3;
    const roomAddr = rom.getByte(p) | (rom.getByte(p + 1) << 8) | (rom.getByte(p + 2) << 16);
    const { objs } = decodeRoomObjects(rom, roomAddr);
    overlayRooms[`Overlay${i}`] = objs;
  }
  return yaml.dump(overlayRooms, { flowLevel: -1, sortKeys: false });
}

/**
 * Extract map32_to_map16 data.
 */
function extractMap32ToMap16(rom: RomData): string {
  const lines: string[] = [];
  const getit = (ea: number): number[] => {
    const ov = [0, 1, 2, 3, 4, 5].map(j => rom.getByte(ea + j));
    return [
      ov[0] | ((ov[4] >> 4) << 8),
      ov[1] | ((ov[4] & 0xf) << 8),
      ov[2] | ((ov[5] >> 4) << 8),
      ov[3] | ((ov[5] & 0xf) << 8),
    ];
  };
  for (let i = 0; i < 2218; i++) {
    const t0 = getit(0x838000 + i * 6);
    const t1 = getit(0x83b400 + i * 6);
    const t2 = getit(0x848000 + i * 6);
    const t3 = getit(0x84b400 + i * 6);
    for (let j = 0; j < 4; j++) {
      lines.push(`${String(i * 4 + j).padStart(5)}: ${String(t0[j]).padStart(4)}, ${String(t1[j]).padStart(4)}, ${String(t2[j]).padStart(4)}, ${String(t3[j]).padStart(4)}`);
    }
  }
  return lines.join('\n') + '\n';
}

export {
  extractAllDungeonRooms,
  extractDefaultRooms,
  extractMap32ToMap16,
  extractOverlayRooms
};
