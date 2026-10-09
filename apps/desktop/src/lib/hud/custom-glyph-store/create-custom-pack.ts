/* @layer renderer-lib @kind logic */
import { newId } from '@drizztdourden08/brock-core';
import { GENERIC_PACK_ID } from '@rotp/input-mapping';
import type { GlyphPack } from '@rotp/input-mapping';
import { upsertPack } from './upsert-pack';

const createCustomPack = async (name: string, fallbackPack = GENERIC_PACK_ID): Promise<GlyphPack> =>
  upsertPack({
    id: `glyphs-${newId()}`,
    name: name.trim() || 'My glyphs',
    builtIn: false,
    glyphs: {},
    fallbackPack,
  });

export { createCustomPack };
