/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { LanguageSet } from '../../messages';
import { writeJson } from '@drizztdourden08/brock-core';
import { setMetaPath } from '../paths';
import { asStructure } from './as-structure';
import { SET_FORMAT } from './format-2.constants';
import { readHeader } from './read-header';

const writeHeader = async (files: FileStore, set: LanguageSet): Promise<void> => {
  const { id, name, base, origin, version, author, basedOn } = set;
  const previous = await readHeader(files, id);
  await writeJson(files, setMetaPath(id), {
    ...previous,
    id,
    name,
    base,
    origin,
    version,
    author,
    ...(basedOn ? { basedOn } : {}),
    format: SET_FORMAT,
    structure: asStructure(set.structure),
  });
};

export { writeHeader };
