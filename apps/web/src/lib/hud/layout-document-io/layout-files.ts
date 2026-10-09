/* @layer renderer-lib @kind logic */
import { getPlatform } from '@app/platform/get-platform';

const layoutFiles = {
  store: () => getPlatform().files,
  documentsPath: (profileId: string): string => `profiles/${profileId}/hud-documents.json`,
};

export { layoutFiles };
