/* @layer renderer-lib @kind logic */
import type { AutoSaveInfo } from '@shared/types/saves';
import * as saves from '@shared/storage/saves';
import { platformFiles } from '../platform-files';

const listAutoSaves = (p: string): Promise<AutoSaveInfo[]> => saves.listAutoSaves(platformFiles(), p);

export { listAutoSaves };
