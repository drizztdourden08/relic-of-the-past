/* @layer renderer-lib @kind logic */
import { readJson } from '@drizztdourden08/brock-core';
import type { GlyphPack } from '@rotp/input-mapping';
import { activeProfileId } from '../active-profile';
import { glyphFiles } from './glyph-files';

const readCustomPacks = async (): Promise<GlyphPack[]> => {
  const profileId = await activeProfileId();
  if (!profileId) return [];
  const stored = await readJson<GlyphPack[]>(glyphFiles.store(), glyphFiles.packsPath(profileId), []);
  return Array.isArray(stored) ? stored.filter((p) => Boolean(p) && typeof p.id === 'string') : [];
};

export { readCustomPacks };
