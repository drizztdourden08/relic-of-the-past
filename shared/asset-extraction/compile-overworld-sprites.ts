/* @layer shared-asset-extraction @kind logic */
/**
 * Overworld sprite data compilation.
 */
import type { RomData } from './rom/rom-types';
import type { AssetBuilder } from './asset-builder';
import type { OverworldContext } from './compile-overworld-utils';

const buildOverworldSprites = (rom: RomData, A: AssetBuilder, ctx: OverworldContext): void => {
  const { isAreaHead, awrite } = ctx;

  const sprOffs = new Array(144 * 3).fill(0);
  const sprData: number[] = [0xff];
  const sprGfx = new Array(256).fill(0);
  const sprPal = new Array(256).fill(0);

  const readAndAppendSprites = (baseAddr: number, area: number, stageIdxs: number[]): void => {
        let ea = 0x890000 + rom.getWord(baseAddr + area * 2);
        if (rom.getByte(ea) === 0xff) return;
        const off = sprData.length;
        for (const stage of stageIdxs) {
          sprOffs[stage * 144 + area] = off;
        }
        while (rom.getByte(ea) !== 0xff) {
          sprData.push(rom.getByte(ea), rom.getByte(ea + 1), rom.getByte(ea + 2));
          ea += 3;
        }
        sprData.push(0xff);
      };

  const doSpriteRange = (start: number, end: number, baseAddr: number, stageIdxs: number[], infoStage: number): void => {
        for (let i = 0; i < 160; i++) {
          if (!isAreaHead(i)) continue;
          if (i < start || i >= end) continue;
          if (i < 128) {
            awrite(sprGfx, i, (i & 63) + infoStage * 64, rom.getByte(0x80fa41 + (i & 63) + infoStage * 64));
            awrite(sprPal, i, (i & 63) + infoStage * 64, rom.getByte(0x80fb41 + (i & 63) + infoStage * 64));
          }
          readAndAppendSprites(baseAddr, i, stageIdxs);
        }
      };

  doSpriteRange(0, 64, 0x89c881, [0], 0);
  doSpriteRange(0, 64, 0x89c901, [1], 1);
  doSpriteRange(0, 64, 0x89ca21, [2], 2);
  doSpriteRange(64, 144, 0x89ca21, [1, 2], 3);

  A.addUint16('kOverworldSpriteOffs', sprOffs);
  A.addUint8('kOverworldSprites', sprData);
  A.addUint8('kOverworldSpriteGfx', sprGfx);
  A.addUint8('kOverworldSpritePalettes', sprPal);
};

export { buildOverworldSprites };
