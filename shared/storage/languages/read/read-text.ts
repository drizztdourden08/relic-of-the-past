/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import type { TextOverrides } from '@shared/game/language';
import { readJson } from '../../json';
import { textPath } from '../paths';

const readText = (files: FileStore, id: string): Promise<TextOverrides> =>
  readJson<TextOverrides>(files, textPath(id), {});

export { readText };
