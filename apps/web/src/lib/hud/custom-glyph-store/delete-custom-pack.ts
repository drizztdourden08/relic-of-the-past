/* @layer renderer-lib @kind logic */
import { activeProfileId } from '../active-profile';
import { glyphFiles } from './glyph-files';
import { glyphUrlCache } from './glyph-url-cache';
import { readCustomPacks } from './read-custom-packs';
import { writeCustomPacks } from './write-custom-packs';

const deleteCustomPack = async (packId: string): Promise<void> => {
  const profileId = await activeProfileId();
  const packs = await readCustomPacks();
  const pack = packs.find((p) => p.id === packId);
  if (pack && profileId) {
    for (const source of Object.values(pack.glyphs)) {
      if (source?.kind !== 'custom') continue;
      glyphUrlCache.drop(source.fileKey);
      await glyphFiles.store().remove(glyphFiles.imagePath(profileId, source.fileKey));
    }
  }
  await writeCustomPacks(packs.filter((p) => p.id !== packId));
};

export { deleteCustomPack };
