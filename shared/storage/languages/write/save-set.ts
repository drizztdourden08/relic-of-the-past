/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { LanguageSet } from '@shared/game/language';
import { writeJson } from '@drizztdourden08/brock-core';
import { writeContent } from '../format-2';
import { dialoguePath, textPath } from '../paths';

const saveSet = async (files: FileStore, set: LanguageSet): Promise<void> => {
  await writeContent(files, set);
  await writeJson(files, dialoguePath(set.id), set.dialogue);
  await writeJson(files, textPath(set.id), set.text ?? {});
};

export { saveSet };
