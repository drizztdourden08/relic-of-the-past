/* @layer shared-asset-extraction @kind logic */
import { extractSpriteBuffers } from './extract-items';
import { resolveDefs } from './resolve-defs';
import { writeAndPrune } from './write-and-prune';
import type { RomData } from '../rom/rom-types';
import type { SpriteDef } from './extract-items';
import type { ExtractionResult } from './extract-items-node.type';

const extractAllItemSpritesFromRom = (rom: RomData, outputDir: string, defsOrPath: string | SpriteDef[]): ExtractionResult =>
  writeAndPrune(outputDir, extractSpriteBuffers(rom, resolveDefs(defsOrPath)));

export { extractAllItemSpritesFromRom };
