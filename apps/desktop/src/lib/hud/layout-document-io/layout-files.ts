/* @layer renderer-lib @kind logic */
import { getPlatform } from '@drizztdourden08/brock-react';

const layoutFiles = {
  store: () => getPlatform().files,
  documentsPath: (profileId: string): string => `profiles/${profileId}/hud-documents.json`,
};

export { layoutFiles };
