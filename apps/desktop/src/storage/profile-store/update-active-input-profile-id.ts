/* @layer renderer-lib @kind logic */
import { readConfig, writeConfig } from '@drizztdourden08/brock-react';

const updateActiveInputProfileId = async (id: string, activeInputProfileId: string): Promise<void> => {
  const current = (await readConfig(id)) ?? {};
  await writeConfig(id, { ...current, activeInputProfileId });
};

export { updateActiveInputProfileId };
