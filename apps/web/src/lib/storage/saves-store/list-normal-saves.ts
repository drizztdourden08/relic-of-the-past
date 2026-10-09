/* @layer renderer-lib @kind logic */
import type { NormalSaveInfo } from '@shared/types/saves';
import * as saves from '@shared/storage/saves';
import { platformFiles } from '../platform-files';

const listNormalSaves = (p: string): Promise<NormalSaveInfo[]> => saves.listNormalSaves(platformFiles(), p);

export { listNormalSaves };
