/* @layer renderer-lib @kind logic */
import { deleteLinkSprite } from '@app/lib/storage/link-sprites-store';
import { listProfiles, readConfig, writeConfig } from '@app/lib/storage/profile-store';
import { getProfileId } from '../wasm-bridge';
import { setLinkSpriteData } from '../lifecycle';
import { clearPlayerSprite } from '../player-sprite';

const deleteSprite = async (name: string): Promise<string[]> => {
  await deleteLinkSprite(name);

  const profiles = await listProfiles();
  const cleared: string[] = [];
  for (const profile of profiles) {
    const config = await readConfig(profile.id);
    if (!config || config.linkSprite !== name) continue;
    await writeConfig(profile.id, { ...config, linkSprite: null });
    cleared.push(profile.id);
  }

  const active = getProfileId();
  if (active && cleared.includes(active)) {
    setLinkSpriteData(null);
    clearPlayerSprite();
  }

  return cleared;
};

export { deleteSprite };
