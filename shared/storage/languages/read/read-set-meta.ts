/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import type { LanguageSetMeta } from '@shared/game/language';
import { readJson } from '../../json';
import { setMetaPath } from '../paths';

const readSetMeta = async (files: FileStore, id: string): Promise<LanguageSetMeta | null> => {
  const raw = await readJson<LanguageSetMeta | null>(files, setMetaPath(id), null);
  if (!raw) return null;
  const { name, base, origin, version, author, basedOn } = raw;
  return { id: raw.id, name, base, origin, version, author, ...(basedOn ? { basedOn } : {}) };
};

export { readSetMeta };
