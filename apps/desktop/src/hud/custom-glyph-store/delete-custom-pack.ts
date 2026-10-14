/* @layer renderer-lib @kind logic */
import { activeProfileId } from '../active-profile';
import { customFileKeys } from './custom-file-keys';
import { glyphFiles } from './glyph-files';
import { glyphUrlCache } from './glyph-url-cache';
import { readCustomPacks } from './read-custom-packs';
import { writeCustomPacks } from './write-custom-packs';

const deleteCustomPack = async (packId: string): Promise<void> => {
  const profileId = await activeProfileId();
  const packs = await readCustomPacks();
  const pack = packs.find((p) => p.id === packId);
  if (pack && profileId) {
    for (const fileKey of customFileKeys(pack)) {
      glyphUrlCache.drop(fileKey);
      await glyphFiles.store().remove(glyphFiles.imagePath(profileId, fileKey));
    }
  }
  await writeCustomPacks(packs.filter((p) => p.id !== packId));
};

export { deleteCustomPack };
