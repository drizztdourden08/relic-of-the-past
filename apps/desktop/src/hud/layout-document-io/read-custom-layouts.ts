/* @layer renderer-lib @kind logic */
import { readJson } from '@drizztdourden08/brock-core';
import { tryLoadLayout, NO_STORED_LAYOUTS } from '@rotp/hud';
import { activeProfileId } from '../active-profile';
import type { StoredLayouts } from '@rotp/hud';
import { layoutFiles } from './layout-files';

const nameOf = (value: unknown, index: number): string => {
  const id = (value as { id?: unknown } | null)?.id;
  return typeof id === 'string' && id ? id : `#${index}`;
};

const readCustomLayouts = async (): Promise<StoredLayouts> => {
  const profileId = await activeProfileId();
  if (!profileId) return NO_STORED_LAYOUTS;
  const stored = await readJson<unknown[]>(layoutFiles.store(), layoutFiles.documentsPath(profileId), []);
  if (!Array.isArray(stored)) return NO_STORED_LAYOUTS;
  const result: StoredLayouts = { documents: [], problems: [] };
  stored.forEach((entry, index) => {
    const loaded = tryLoadLayout(entry);
    if (loaded.ok) result.documents.push(loaded.doc);
    else result.problems.push({ id: nameOf(entry, index), errors: loaded.errors });
  });
  return result;
};

export { readCustomLayouts };
