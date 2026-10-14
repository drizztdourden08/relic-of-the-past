/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import type { AssetBuilder } from '../asset-builder';
import type { OverworldContext } from './build-overworld-context.type';
import type { SpriteRange } from './build-overworld-sprites.type';

const buildOverworldSprites = (rom: RomData, A: AssetBuilder, ctx: OverworldContext): void => {
  const { isAreaHead, awrite } = ctx;

  const sprOffs = new Array<number>(144 * 3).fill(0);
  const sprData: number[] = [0xff];
  const sprGfx = new Array<number>(256).fill(0);
  const sprPal = new Array<number>(256).fill(0);

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

  const doSpriteRange = (range: SpriteRange): void => {
        const { start, end, baseAddr, stageIdxs, infoStage } = range;
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

  doSpriteRange({ start: 0, end: 64, baseAddr: 0x89c881, stageIdxs: [0], infoStage: 0 });
  doSpriteRange({ start: 0, end: 64, baseAddr: 0x89c901, stageIdxs: [1], infoStage: 1 });
  doSpriteRange({ start: 0, end: 64, baseAddr: 0x89ca21, stageIdxs: [2], infoStage: 2 });
  doSpriteRange({ start: 64, end: 144, baseAddr: 0x89ca21, stageIdxs: [1, 2], infoStage: 3 });

  A.addUint16('kOverworldSpriteOffs', sprOffs);
  A.addUint8('kOverworldSprites', sprData);
  A.addUint8('kOverworldSpriteGfx', sprGfx);
  A.addUint8('kOverworldSpritePalettes', sprPal);
};

export { buildOverworldSprites };
