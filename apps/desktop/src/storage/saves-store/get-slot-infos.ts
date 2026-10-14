/* @layer renderer-lib @kind logic */
import type { QuickSaveSlotInfo } from '@rotp/game-core';
import { quickSlotInfos } from '../save-files';
import { platformFiles } from '../platform-files';

const getSlotInfos = (p: string): Promise<QuickSaveSlotInfo[]> => quickSlotInfos(platformFiles(), p);

export { getSlotInfos };
