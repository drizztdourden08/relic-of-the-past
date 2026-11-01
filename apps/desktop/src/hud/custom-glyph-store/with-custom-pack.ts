/* @layer renderer-lib @kind logic */
import type { GlyphPack } from '@rotp/input-mapping';
import { activeProfileId } from '../active-profile';
import type { PackEditSession } from './pack-edit-session.type';
import { readCustomPacks } from './read-custom-packs';

const withCustomPack = async (
  packId: string,
  run: (session: PackEditSession) => Promise<GlyphPack | null>,
): Promise<GlyphPack | null> => {
  const profileId = await activeProfileId();
  if (!profileId) return null;
  const pack = (await readCustomPacks()).find((p) => p.id === packId);
  if (!pack) return null;
  return run({ profileId, pack });
};

export { withCustomPack };
