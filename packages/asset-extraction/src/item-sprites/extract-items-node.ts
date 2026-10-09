/* @layer shared-asset-extraction @kind logic */
import { loadRom } from '../rom/load-rom-file';
import { extractSpriteBuffers } from './extract-items';
import { resolveDefs } from './resolve-defs';
import { writeAndPrune } from './write-and-prune';
import type { SpriteDef } from './extract-items';
import type { ExtractionResult } from './extract-items-node.type';

const extractAllItemSprites = (romPath: string, outputDir: string, defsOrPath?: string | SpriteDef[]): ExtractionResult =>
  writeAndPrune(outputDir, extractSpriteBuffers(loadRom(romPath), resolveDefs(defsOrPath)));

export { extractAllItemSprites };
