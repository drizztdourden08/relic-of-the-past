/* @layer renderer-lib @kind logic */
import { newId } from '@drizztdourden08/brock-core';
import { GENERIC_PACK_ID } from '@shared/input/glyphs';
import type { GlyphPack } from '@shared/types/hud';
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
