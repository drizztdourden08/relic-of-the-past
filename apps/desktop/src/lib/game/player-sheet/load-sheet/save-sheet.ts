/* @layer renderer-lib @kind logic */
import type { PlayerSheet } from '@rotp/game-data';
import { writeLinkSprite } from '@app/lib/storage/link-sprites-store';
import { sheetToBytes } from './sheet-to-bytes';

const saveSheet = async (name: string, sheet: PlayerSheet): Promise<void> => {
  await writeLinkSprite(name, await sheetToBytes(name, sheet));
};

export { saveSheet };
