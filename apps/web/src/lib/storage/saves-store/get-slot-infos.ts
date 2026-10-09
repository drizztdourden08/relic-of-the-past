/* @layer renderer-lib @kind logic */
import type { QuickSaveSlotInfo } from '@shared/types/saves';
import * as saves from '@shared/storage/saves';
import { platformFiles } from '../platform-files';

const getSlotInfos = (p: string): Promise<QuickSaveSlotInfo[]> => saves.getSlotInfos(platformFiles(), p);

export { getSlotInfos };
