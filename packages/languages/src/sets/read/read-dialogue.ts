/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { DialogueEntry } from '../../messages';
import { readJson } from '@drizztdourden08/brock-core';
import { dialoguePath } from '../paths';

const readDialogue = (files: FileStore, id: string): Promise<DialogueEntry[]> =>
  readJson<DialogueEntry[]>(files, dialoguePath(id), []);

export { readDialogue };
