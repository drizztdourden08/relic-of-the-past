/* @layer renderer-lib @kind logic */
import { writeJson } from '@drizztdourden08/brock-core';
import type { GlyphPack } from '@rotp/input-mapping';
import { activeProfileId } from '../active-profile';
import { glyphFiles } from './glyph-files';

const writeCustomPacks = async (packs: readonly GlyphPack[]): Promise<void> => {
  const profileId = await activeProfileId();
  if (!profileId) return;
  await writeJson(glyphFiles.store(), glyphFiles.packsPath(profileId), packs);
};

export { writeCustomPacks };
