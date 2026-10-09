/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import type { LanguageMeta } from '@shared/types/language';
import { readJson } from '../../json';
import { legacyMetaPath } from '../paths';

const readLegacyMeta = (files: FileStore, id: string): Promise<LanguageMeta | null> =>
  readJson<LanguageMeta | null>(files, legacyMetaPath(id), null);

export { readLegacyMeta };
