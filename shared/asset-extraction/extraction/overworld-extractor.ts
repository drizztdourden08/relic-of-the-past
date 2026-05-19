/**
 * Overworld area extraction — ROM → YAML data for all 160 overworld areas.
 *
 * Ported from: core/zelda3/assets/extract_resources.py (overworld portion)
 */
import * as yaml from 'js-yaml';
import type { RomData } from '../rom/rom-types';
import * as tables from './tables-data';

// ─── Helper functions ───

function getExitDatas(rom: RomData): Map<number, Record<string, unknown>[]> {
  const r = new Map<number, Record<string, unknown>[]>();
  for (let i = 0; i < 79; i++) {
    const room = rom.getWord(0x82dd8a + i * 2);
    const screenIndex = rom.getByte(0x82de28 + i);
    const loadOffs = rom.getWord(0x82de77 + i * 2);
    const scrollY = rom.getWord(0x82df15 + i * 2);
    const scrollX = rom.getWord(0x82dfb3 + i * 2);
    const posY = rom.getWord(0x82e051 + i * 2);
    const posX = rom.getWord(0x82e0ef + i * 2);
    const cameraY = rom.getWord(0x82e18d + i * 2);
    const cameraX = rom.getWord(0x82e22b + i * 2);
    const unk1 = rom.getInt8(0x82e2c9 + i);
    const unk3 = rom.getInt8(0x82e318 + i);
    const ndoor = rom.getWord(0x82e367 + i * 2);
    const fdoor = rom.getWord(0x82e405 + i * 2);
    const baseX = (screenIndex & 7) << 9;
    const baseY = (screenIndex & 56) << 6;

    const y: Record<string, unknown> = {
      index: i,
      room,
      xy: [posX - baseX, posY - baseY],
      scroll_xy: [scrollX - baseX, scrollY - baseY],
      camera_xy: [cameraX - baseX, cameraY - baseY],
    };
    const scrollXy = y.scroll_xy as number[];
    y.load_xy = [((loadOffs >> 1) - (scrollXy[0] >> 4)) & 0x3f, (loadOffs >> 7) - (scrollXy[1] >> 4) & 0x3f];
    y.unk = [unk1, unk3];

    // Special exit info
    if (room >= 0x180 && room < 0x190) {
      const ri = room - 0x180;
      y.special_exit = {
        dir: rom.getByte(0x82e801 + ri) >> 1,
        spr_gfx: rom.getByte(0x82e811 + ri),
        aux_gfx: rom.getByte(0x82e821 + ri),
        pal_bg: rom.getByte(0x82e831 + ri),
        pal_spr: rom.getByte(0x82e841 + ri),
        top: rom.getWord(0x82e6e1 + ri * 2),
        bottom: rom.getWord(0x82e701 + ri * 2),
        left: rom.getWord(0x82e721 + ri * 2),
        right: rom.getWord(0x82e741 + ri * 2),
        left_edge_of_map: rom.getWord(0x82e7e1 + ri * 2),
        unk4: rom.getInt16(0x82e761 + ri * 2),
        unk6: rom.getInt16(0x82e781 + ri * 2),
        unk5: rom.getInt16(0x82e7a1 + ri * 2),
        unk7: rom.getInt16(0x82e7c1 + ri * 2),
      };
    }

    if (ndoor !== 0) {
      y.door = [ndoor & 0x8000 ? 'bombable' : 'wooden', (ndoor & 0x7e) >> 1, (ndoor & 0x3f80) >> 7];
    }
    if (fdoor !== 0) {
      y.door = [fdoor & 0x8000 ? 'palace' : 'sanctuary', (fdoor & 0x7e) >> 1, (fdoor & 0x3f80) >> 7];
    }

    if (!r.has(screenIndex)) r.set(screenIndex, []);
    r.get(screenIndex)!.push(y);
  }
  return r;
}

function getOwTravelInfos(rom: RomData): Map<number, Record<string, unknown>[]> {
  const r = new Map<number, Record<string, unknown>[]>();
  for (let i = 0; i < 17; i++) {
    const screenIndex = rom.getWord(0x82eae5 + i * 2);
    const loadOffs = rom.getWord(0x82eb07 + i * 2);
    const scrollY = rom.getWord(0x82eb29 + i * 2);
    const scrollX = rom.getWord(0x82eb4b + i * 2);
    const posY = rom.getWord(0x82eb6d + i * 2);
    const posX = rom.getWord(0x82eb8f + i * 2);
    const cameraY = rom.getWord(0x82ebb1 + i * 2);
    const cameraX = rom.getWord(0x82ebd3 + i * 2);
    const unk1 = rom.getInt8(0x82ebf5 + i * 2);
    const unk3 = rom.getInt8(0x82ec17 + i * 2);
    const baseX = (screenIndex & 7) << 9;
    const baseY = (screenIndex & 56) << 6;

    const y: Record<string, unknown> = {};
    if (i < 9) {
      y.bird_travel_id = i;
    } else {
      y.whirlpool_src_area = rom.getWord(0x82ecf8 + (i - 9) * 2);
    }
    y.xy = [posX - baseX, posY - baseY];
    y.scroll_xy = [scrollX - baseX, scrollY - baseY];
    y.camera_xy = [cameraX - baseX, cameraY - baseY];
    const scrollXy = y.scroll_xy as number[];
    y.load_xy = [((loadOffs >> 1) - (scrollXy[0] >> 4)) & 0x3f, (loadOffs >> 7) - (scrollXy[1] >> 4) & 0x3f];
    y.unk = [unk1, unk3];

    if (!r.has(screenIndex)) r.set(screenIndex, []);
    r.get(screenIndex)!.push(y);
  }
  return r;
}

function getOwEntranceInfo(rom: RomData): Map<number, Record<string, unknown>[]> {
  const r = new Map<number, Record<string, unknown>[]>();
  for (let i = 0; i < 129; i++) {
    const area = rom.getWord(0x9bb96f + i * 2);
    const pos = rom.getWord(0x9bba71 + i * 2);
    const entranceId = rom.getByte(0x9bbb73 + i);
    if (!r.has(area)) r.set(area, []);
    r.get(area)!.push({ index: i, x: (pos >> 1) & 0x3f, y: (pos >> 7) & 0x3f, entrance_id: entranceId });
  }
  return r;
}

function getHoleInfos(rom: RomData): Map<number, Record<string, unknown>[]> {
  const r = new Map<number, Record<string, unknown>[]>();
  for (let i = 0; i < 19; i++) {
    const pos = rom.getWord(0x9bb800 + i * 2) + 0x400;
    const area = rom.getWord(0x9bb826 + i * 2);
    const entranceId = rom.getByte(0x9bb84c + i);
    if (!r.has(area)) r.set(area, []);
    r.get(area)!.push({ x: (pos >> 1) & 0x3f, y: (pos >> 7) & 0x3f, entrance_id: entranceId });
  }
  return r;
}

function extractOverworldArea(
  rom: RomData,
  overworldArea: number,
  exitDatas: Map<number, Record<string, unknown>[]>,
  travelInfos: Map<number, Record<string, unknown>[]>,
  entranceInfo: Map<number, Record<string, unknown>[]>,
  holeInfos: Map<number, Record<string, unknown>[]>,
): string {
  const isSmall = rom.getBytes(0x82f88d, 192);

  function getMusic(ambient: boolean): Record<string, string> {
    const fn = (x: number) => ambient ? tables.kAmbientSoundName[x >> 4] : tables.kMusicNames[x & 0xf];
    if (overworldArea < 64) {
      return {
        beginning: fn(rom.getByte(0x82c303 + overworldArea)),
        zelda: fn(rom.getByte(0x82c303 + overworldArea + 64)),
        sword: fn(rom.getByte(0x82c303 + overworldArea + 128)),
        agahnim: fn(rom.getByte(0x82c303 + overworldArea + 192)),
      };
    } else {
      return { agahnim: fn(rom.getByte(0x82c403 + overworldArea - 64)) };
    }
  }

  function getItems(): unknown[] {
    if (overworldArea >= 128) return [];
    let ea = 0x9b0000 | rom.getWord(0x9bc2f9 + overworldArea * 2);
    const xs: unknown[] = [];
    while (rom.getWord(ea) !== 0xffff) {
      const pos = rom.getWord(ea);
      const x = (pos / 2 | 0) % 64;
      const y = (pos / 2 | 0) / 64 | 0;
      xs.push([x, y, tables.kSecretNames[rom.getByte(ea + 2)]]);
      ea += 3;
    }
    return xs;
  }

  const header: Record<string, unknown> = {
    name: tables.kAreaNames[overworldArea],
    size: isSmall[overworldArea] ? 'small' : 'big',
    gfx: overworldArea < 128 ? rom.getByte(0x80fc9c + overworldArea) : -1,
    palette: overworldArea < 136 ? rom.getByte(0x80fd1c + overworldArea) : -1,
    sign_text: overworldArea < 128 ? rom.getWord(0x87f51d + overworldArea * 2) : -1,
    music: getMusic(false),
    ambient: getMusic(true),
  };

  const y: Record<string, unknown> = {};
  y.Header = header;
  y.Travel = travelInfos.get(overworldArea) ?? [];
  y.Entrances = entranceInfo.get(overworldArea) ?? [];
  if (holeInfos.has(overworldArea)) {
    y.Holes = holeInfos.get(overworldArea);
  }
  y.Exits = exitDatas.get(overworldArea) ?? [];
  y.Items = getItems();

  function decodeSprites(baseAddr: number): unknown[] {
    const r: unknown[] = [];
    let ea = 0x890000 + rom.getWord(baseAddr + overworldArea * 2);
    while (rom.getByte(ea) !== 0xff) {
      const sy = rom.getByte(ea);
      const sx = rom.getByte(ea + 1);
      const w = rom.getByte(ea + 2);
      r.push([sx, sy, tables.kSpriteNames[w]]);
      ea += 3;
    }
    return r;
  }

  function getInfo(stage: number): Record<string, number> {
    if (overworldArea >= 128) return {};
    const s = overworldArea >= 64 ? 3 : stage;
    return {
      gfx: rom.getByte(0x80fa41 + (overworldArea & 63) + s * 64),
      palette: rom.getByte(0x80fb41 + (overworldArea & 63) + s * 64),
    };
  }

  if (overworldArea < 64) {
    y['Sprites.Beginning'] = { info: getInfo(0), sprites: decodeSprites(0x89c881) };
    y['Sprites.FirstPart'] = { info: getInfo(1), sprites: decodeSprites(0x89c901) };
    y['Sprites.SecondPart'] = { info: getInfo(2), sprites: decodeSprites(0x89ca21) };
  } else if (overworldArea < 144) {
    y.Sprites = { info: getInfo(2), sprites: decodeSprites(0x89ca21) };
  }

  return yaml.dump(y, { flowLevel: -1, sortKeys: false });
}

/**
 * Extract all overworld areas from ROM.
 * @returns Map of filename → YAML content
 */
function extractAllOverworldAreas(rom: RomData): Map<string, string> {
  const exitDatas = getExitDatas(rom);
  const travelInfos = getOwTravelInfos(rom);
  const entranceInfo = getOwEntranceInfo(rom);
  const holeInfos = getHoleInfos(rom);
  const areaHeads = rom.getBytes(0x82a5ec, 64);

  const results = new Map<string, string>();
  for (let i = 0; i < 160; i++) {
    if (i >= 128 || areaHeads[i & 63] === (i & 63)) {
      const content = extractOverworldArea(rom, i, exitDatas, travelInfos, entranceInfo, holeInfos);
      results.set(`overworld/overworld-${i}.yaml`, content);
    }
  }
  return results;
}

export { extractAllOverworldAreas };
