/* @layer shared-storage @kind logic */
import { getSet, duplicateSet, assertValidSetId, pickFreeSetId, saveSet } from '@rotp/languages';
import type { DuplicateInstalled } from './duplicate.type';

const duplicateLanguage: DuplicateInstalled = async (files, installedName, basedOn) => {
  assertValidSetId(installedName);
  const source = await getSet(files, installedName);
  if (!source) throw new Error(`The language set "${installedName}" was not found.`);
  const id = await pickFreeSetId(files, `${installedName}-copy`);
  const copy = await duplicateSet(files, installedName, id, `${source.name} copy`);
  await saveSet(files, { ...copy, basedOn });
  return { name: id };
};

export { duplicateLanguage };
