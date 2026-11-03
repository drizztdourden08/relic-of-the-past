/* @layer renderer-lib @kind logic */
import { updateConfig } from './update-config';

const updateActiveInputProfileId = (id: string, activeInputProfileId: string): Promise<void> =>
  updateConfig(id, (current) => ({ ...current, activeInputProfileId }));

export { updateActiveInputProfileId };
