/* @layer shared-asset-extraction @kind logic */
/**
 * Extracts a single dungeon room's full data (header, sprites, secrets, chests, layers).
 */
import * as yaml from 'js-yaml';
import type { RomData } from '../rom/rom-types';
import { decodeRoomObjects } from './room-object-decoder';
import * as tables from './data/tables-data';

const extractRoom = (rom: RomData, roomIndex: number, entrances0: Map<number, Record<string, unknown>[]>, entrances1: Map<number, Record<string, unknown>[]>, chestInfo: Map<number, [number, boolean][]>, pitsHurt: Set<number>): string => {

  let p = 0x1f8000 + roomIndex * 3;
  const roomAddr = rom.getByte(p) | (rom.getByte(p + 1) << 8) | (rom.getByte(p + 2) << 16);
  p = 0x40000 | rom.getWord(0x4f502 + roomIndex * 2);
  if (p === 0x4ffef) p = 0x82edc5;

  const floor = rom.getByte(roomAddr);
  const layout = rom.getByte(roomAddr + 1);
  const flags = rom.getByte(p + 0);
  const p7 = rom.getByte(p + 7);
  const p8 = rom.getByte(p + 8);

  let ea = 0x890000 + rom.getWord(0x89d62e + roomIndex * 2);
  const sortSprites = rom.getByte(ea);

  const header: Record<string, unknown> = {
    floor1: floor & 0xf,
    floor2: floor >> 4,
    layout: layout >> 2,
    start_quadrant: layout & 3,
    bg2: tables.kBg2[flags >> 5],
    collision: tables.kCollisionNames[(flags >> 2) & 7],
    lights_out: flags & 1,
    palette: rom.getByte(p + 1),
    blockset: rom.getByte(p + 2),
    enemyblk: rom.getByte(p + 3),
    effect: tables.kEffectNames[rom.getByte(p + 4)],
    tag0: tables.kTagNames[rom.getByte(p + 5)],
    tag1: tables.kTagNames[rom.getByte(p + 6)],
    hole0_dest: [rom.getByte(p + 9), p7 & 3],
    stair0_dest: [rom.getByte(p + 10), (p7 >> 2) & 3],
    stair1_dest: [rom.getByte(p + 11), (p7 >> 4) & 3],
    stair2_dest: [rom.getByte(p + 12), (p7 >> 6) & 3],
    stair3_dest: [rom.getByte(p + 13), p8 & 3],
    tele_msg: rom.getWord(0x87f61d + roomIndex * 2),
    sort_sprites: sortSprites,
    pits_hurt_player: pitsHurt.has(roomIndex),
  };

  // Sprites
  ea = 0x890000 + rom.getWord(0x89d62e + roomIndex * 2) + 1;
  const sprites: unknown[] = [];
  while (rom.getByte(ea) !== 0xff) {
    const sy = rom.getByte(ea);
    const sx = rom.getByte(ea + 1);
    const type = rom.getByte(ea + 2);
    if (type === 0xe4) {
      if (sy === 0xfe || sy === 0xfd) {
        const last = sprites[sprites.length - 1] as unknown[];
        last.push(sy === 0xfe ? 'drop_key' : 'drop_big_key');
        ea += 3;
        continue;
      }
    } else if (sx >= 0xe0) {
      const flr = sy >> 7;
      sprites.push([sx & 0x1f, sy & 0x1f, flr ? 'lower' : 'upper', tables.kSpriteNames[type + 0x100]]);
      ea += 3;
      continue;
    }
    const subtype = (sx >> 5) | (((sy >> 5) & 3) << 3);
    const flr = sy >> 7;
    let name = tables.kSpriteNames[type];
    if (subtype !== 0) {
      const dashIdx = name.indexOf('-');
      name = name.slice(0, dashIdx) + `.${subtype}` + name.slice(dashIdx);
    }
    sprites.push([sx & 0x1f, sy & 0x1f, flr ? 'lower' : 'upper', name]);
    ea += 3;
  }

  // Secrets
  let secretEa = 0x810000 | rom.getWord(0x81db69 + roomIndex * 2);
  const secrets: unknown[] = [];
  while (rom.getWord(secretEa) !== 0xffff) {
    const pos = rom.getWord(secretEa);
    const x = ((pos / 2) | 0) % 64;
    const y = ((pos / 2) | 0) / 64 | 0;
    secrets.push([x, y, tables.kSecretNames[rom.getByte(secretEa + 2)]]);
    secretEa += 3;
  }

  // Chests
  const chests: (number | string)[] = [];
  for (const [data, big] of chestInfo.get(roomIndex) ?? []) {
    chests.push(big ? `${data}!` : data);
  }

  const data: Record<string, unknown> = {
    Header: header,
    Sprites: sprites,
    Secrets: secrets,
    Chests: chests,
  };
  data.Entrances = entrances0.get(roomIndex) ?? [];
  if (entrances1.has(roomIndex)) {
    data.StartingPoints = entrances1.get(roomIndex);
  }

  // Room objects (3 layers)
  let objP = roomAddr + 2;
  const layer1 = decodeRoomObjects(rom, objP);
  data.Layer1 = layer1.objs;
  if (layer1.doors) data['Layer1.doors'] = layer1.doors;
  objP = layer1.end;

  const layer2 = decodeRoomObjects(rom, objP);
  data.Layer2 = layer2.objs;
  if (layer2.doors) data['Layer2.doors'] = layer2.doors;
  objP = layer2.end;

  const layer3 = decodeRoomObjects(rom, objP);
  data.Layer3 = layer3.objs;
  if (layer3.doors) data['Layer3.doors'] = layer3.doors;

  return yaml.dump(data, { flowLevel: -1, sortKeys: false });
};

export { extractRoom };
