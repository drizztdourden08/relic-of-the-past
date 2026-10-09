/* @layer renderer-lib @kind logic */
import * as store from '@shared/storage/profiles';
import { platformFiles } from '../platform-files';

const updateActiveInputProfileId = async (id: string, activeInputProfileId: string): Promise<void> => {
  const current = (await store.readConfig(platformFiles(), id)) ?? {};
  await store.writeConfig(platformFiles(), id, { ...current, activeInputProfileId });
};

export { updateActiveInputProfileId };
