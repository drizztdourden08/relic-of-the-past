/* @layer shared-asset-extraction @kind logic */
/** ROM readers for overworld area metadata (exits, travel, entrances, holes). */
import type { RomData } from '../rom/rom-types';

const getExitDatas = (rom: RomData): Map<number, Record<string, unknown>[]> => {
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
};

const getOwTravelInfos = (rom: RomData): Map<number, Record<string, unknown>[]> => {
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
};

const getOwEntranceInfo = (rom: RomData): Map<number, Record<string, unknown>[]> => {
  const r = new Map<number, Record<string, unknown>[]>();
  for (let i = 0; i < 129; i++) {
    const area = rom.getWord(0x9bb96f + i * 2);
    const pos = rom.getWord(0x9bba71 + i * 2);
    const entranceId = rom.getByte(0x9bbb73 + i);
    if (!r.has(area)) r.set(area, []);
    r.get(area)!.push({ index: i, x: (pos >> 1) & 0x3f, y: (pos >> 7) & 0x3f, entrance_id: entranceId });
  }
  return r;
};

const getHoleInfos = (rom: RomData): Map<number, Record<string, unknown>[]> => {
  const r = new Map<number, Record<string, unknown>[]>();
  for (let i = 0; i < 19; i++) {
    const pos = rom.getWord(0x9bb800 + i * 2) + 0x400;
    const area = rom.getWord(0x9bb826 + i * 2);
    const entranceId = rom.getByte(0x9bb84c + i);
    if (!r.has(area)) r.set(area, []);
    r.get(area)!.push({ x: (pos >> 1) & 0x3f, y: (pos >> 7) & 0x3f, entrance_id: entranceId });
  }
  return r;
};

export { getExitDatas, getOwTravelInfos, getOwEntranceInfo, getHoleInfos };
