/* @layer renderer-lib @kind logic */
import { newId } from '@drizztdourden08/brock-core';
import { msg } from '@drizztdourden08/brock-core/i18n';
import { GENERIC_PACK_ID } from '@rotp/input-mapping';
import type { GlyphPack } from '@rotp/input-mapping';
import { textOf } from '@app/shell/text-bridge';
import { upsertPack } from './upsert-pack';

const createCustomPack = async (name: string, fallbackPack = GENERIC_PACK_ID): Promise<GlyphPack> =>
  upsertPack({
    id: `glyphs-${newId()}`,
    name: name.trim() || textOf(msg('hud-editing:glyph-pack.default-name', { n: 1 })),
    builtIn: false,
    glyphs: {},
    fallbackPack,
  });

export { createCustomPack };
