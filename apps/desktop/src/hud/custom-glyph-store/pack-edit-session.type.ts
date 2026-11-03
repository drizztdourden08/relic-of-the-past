/* @layer renderer-lib @kind types */
import type { GlyphPack } from '@rotp/input-mapping';

interface PackEditSession {
  profileId: string;
  pack: GlyphPack;
}

export type { PackEditSession };
