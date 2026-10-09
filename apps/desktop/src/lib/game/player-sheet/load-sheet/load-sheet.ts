/* @layer renderer-lib @kind logic */
import type { PlayerSheet, SheetPalette } from '@rotp/game-data';
import { readLinkSprite } from '@app/lib/storage/link-sprites-store';
import { parseRsp, isRspName } from '@shared/storage/link-sprites/parse-rsp';
import { parseZspr } from '../../zspr';

const loadSheet = async (name: string, stockPalette?: SheetPalette): Promise<PlayerSheet | null> => {
  const bytes = await readLinkSprite(name);
  if (!bytes) return null;
  return isRspName(name) ? parseRsp(bytes) : parseZspr(bytes, stockPalette);
};

export { loadSheet };
