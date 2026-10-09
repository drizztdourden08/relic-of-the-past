/* @layer renderer-lib @kind logic */
import type { PlayerSheet } from '@rotp/game-data';
import { isRspName } from '@shared/storage/link-sprites/parse-rsp';
import { toZsprBytes } from '../../zspr-write';
import { toRspBytes } from '../../rsp';

const sheetToBytes = async (name: string, sheet: PlayerSheet): Promise<Uint8Array> =>
  isRspName(name) ? toRspBytes(sheet) : toZsprBytes(sheet);

export { sheetToBytes };
