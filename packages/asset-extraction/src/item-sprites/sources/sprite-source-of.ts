/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../../rom/rom-types';
import { createJaSpriteSource } from './ja-sprite-source';
import type { SpriteSource } from './sprite-source.type';
import { createUsSpriteSource } from './us-sprite-source';

const spriteSourceOf = (rom: RomData): SpriteSource =>
  rom.language === 'ja' ? createJaSpriteSource(rom) : createUsSpriteSource(rom);

export { spriteSourceOf };
