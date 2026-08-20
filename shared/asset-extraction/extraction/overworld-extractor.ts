/* @layer shared-asset-extraction @kind logic */
/**
 * Overworld area extraction — ROM → YAML data for all 160 overworld areas.
 * ROM metadata readers live in overworld-rom-tables.ts.
 *
 * Ported from: upstream's extract_resources.py (overworld portion)
 */
import * as yaml from 'js-yaml';
import type { RomData } from '../rom/rom-types';
import * as tables from './data/tables-data';
import { getExitDatas, getOwTravelInfos, getOwEntranceInfo, getHoleInfos } from './overworld-rom-tables';

const extractOverworldArea = (rom: RomData, overworldArea: number, exitDatas: Map<number, Record<string, unknown>[]>, travelInfos: Map<number, Record<string, unknown>[]>, entranceInfo: Map<number, Record<string, unknown>[]>, holeInfos: Map<number, Record<string, unknown>[]>): string => {
  const isSmall = rom.getBytes(0x82f88d, 192);

  const getMusic = (ambient: boolean): Record<string, string> => {
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
      };

  const getItems = (): unknown[] => {
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
      };

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

  const decodeSprites = (baseAddr: number): unknown[] => {
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
      };

  const getInfo = (stage: number): Record<string, number> => {
        if (overworldArea >= 128) return {};
        const s = overworldArea >= 64 ? 3 : stage;
        return {
          gfx: rom.getByte(0x80fa41 + (overworldArea & 63) + s * 64),
          palette: rom.getByte(0x80fb41 + (overworldArea & 63) + s * 64),
        };
      };

  if (overworldArea < 64) {
    y['Sprites.Beginning'] = { info: getInfo(0), sprites: decodeSprites(0x89c881) };
    y['Sprites.FirstPart'] = { info: getInfo(1), sprites: decodeSprites(0x89c901) };
    y['Sprites.SecondPart'] = { info: getInfo(2), sprites: decodeSprites(0x89ca21) };
  } else if (overworldArea < 144) {
    y.Sprites = { info: getInfo(2), sprites: decodeSprites(0x89ca21) };
  }

  return yaml.dump(y, { flowLevel: -1, sortKeys: false });
};

const extractAllOverworldAreas = (rom: RomData): Map<string, string> => {
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
};

export { extractAllOverworldAreas };
