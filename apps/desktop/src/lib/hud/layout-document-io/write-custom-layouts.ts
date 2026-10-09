/* @layer renderer-lib @kind logic */
import { writeJson } from '@shared/storage/json';
import { tryLoadLayout } from '@shared/hud/layouts';
import type { HudLayout } from '@shared/types/hud';
import { activeProfileId } from '../active-profile';
import { layoutFiles } from './layout-files';

const writeCustomLayouts = async (documents: readonly HudLayout[]): Promise<void> => {
  const profileId = await activeProfileId();
  if (!profileId) return;
  const checked = documents.map((doc) => {
    const loaded = tryLoadLayout(doc);
    if (!loaded.ok) throw new Error(`'${doc.id}' cannot be saved:\n  - ${loaded.errors.join('\n  - ')}`);
    return loaded.doc;
  });
  await writeJson(layoutFiles.store(), layoutFiles.documentsPath(profileId), checked);
};

export { writeCustomLayouts };
