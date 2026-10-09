/* @layer renderer-hooks @kind logic */
import { getActiveProfileId } from '@app/game';
import { readConfig } from '@app/storage/profile-store';

const isLiveSelection = async (name: string): Promise<boolean> => {
  const id = getActiveProfileId();
  if (!id) return false;
  const config = await readConfig(id);
  return config?.linkSprite === name;
};

export { isLiveSelection };
