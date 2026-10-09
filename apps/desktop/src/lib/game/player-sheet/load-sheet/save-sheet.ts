/* @layer renderer-lib @kind logic */
import type { PlayerSheet } from '@shared/game/data/player-sheet/types';
import { writeLinkSprite } from '@app/lib/storage/link-sprites-store';
import { sheetToBytes } from './sheet-to-bytes';

const saveSheet = async (name: string, sheet: PlayerSheet): Promise<void> => {
  await writeLinkSprite(name, await sheetToBytes(name, sheet));
};

export { saveSheet };
