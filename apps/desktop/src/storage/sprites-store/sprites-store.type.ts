/* @layer renderer-lib @kind types */
import type { SpriteBuffer } from '@rotp/asset-extraction';

interface SpritesResult {
  buffers: SpriteBuffer[];
  errors: string[];
}

export type { SpritesResult };
