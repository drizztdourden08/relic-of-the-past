/* @layer shared-asset-extraction @kind logic */
import type { DungeonRoomRecord } from '../dungeon/model';
import { occluderCells } from '../extensions/second-cartridge-occluders';
import { OCCLUDER_TOP_LAYER } from './compile-resources-gba-alttp.constants';
import { wordsToBuffer } from './words-to-buffer';

const roomLayersWithOccludersOnTop = (room: DungeonRoomRecord): Buffer[] => {
  const occluders = occluderCells(room);
  return room.layers.map((layer, n) => {
    if (n !== OCCLUDER_TOP_LAYER || occluders.size === 0) return wordsToBuffer(layer.snesWords);
    const words = Uint16Array.from(layer.snesWords);
    for (const cell of occluders) words[cell] = room.layers[0].snesWords[cell];
    return wordsToBuffer(words);
  });
};

export { roomLayersWithOccludersOnTop };
