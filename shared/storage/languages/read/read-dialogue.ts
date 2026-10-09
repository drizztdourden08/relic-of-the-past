/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import type { DialogueEntry } from '@shared/game/language';
import { readJson } from '../../json';
import { dialoguePath } from '../paths';

const readDialogue = (files: FileStore, id: string): Promise<DialogueEntry[]> =>
  readJson<DialogueEntry[]>(files, dialoguePath(id), []);

export { readDialogue };
