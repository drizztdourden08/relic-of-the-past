/* @layer renderer-lib @kind logic */
import type { QuickSaveSlotInfo } from '@rotp/game-core';
import { saves } from '@rotp/game-core';
import { platformFiles } from '../platform-files';

const getSlotInfos = (p: string): Promise<QuickSaveSlotInfo[]> => saves.getSlotInfos(platformFiles(), p);

export { getSlotInfos };
