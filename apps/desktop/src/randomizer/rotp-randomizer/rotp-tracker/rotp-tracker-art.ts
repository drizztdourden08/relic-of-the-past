/* @layer renderer-app @kind logic */
import { getItem, getItemSprite, getSpritesBase, resolveItemSprite } from '@rotp/game-data';
import type { ItemId } from '@rotp/game-data';
import { EVENT_MARK } from '@app/compounds/ChecksTracker/ChecksTracker.constants';
import { trackerCheckOf } from './rotp-tracker-check-of';
import { TRACKER_EVENT_KIND } from './rotp-tracker.constants';
import { NOTHING_HELD, SLOTS } from './rotp-tracker-art.constants';

const spriteUrlOf = (file: string): string => `${getSpritesBase()}${file}.png`;

const tierArt = (key: string): string | null => {
  const slot = SLOTS.find((candidate) => candidate.trackerItemIds.includes(key as ItemId));
  return slot === undefined ? null : spriteUrlOf(resolveItemSprite(slot, new Set([key as ItemId])).sprite);
};

const slotArt = (key: string): string | null => {
  const slot = SLOTS.find((candidate) => candidate.displayName.toLowerCase() === key.toLowerCase());
  return slot === undefined ? null : spriteUrlOf(resolveItemSprite(slot, NOTHING_HELD).sprite);
};

const itemArt = (key: string): string | null => {
  try {
    getItem(key);
  } catch {
    return null;
  }
  return getItemSprite(key as ItemId) ?? null;
};

const rotpArtOf = (key: string): string | null => {
  if (trackerCheckOf(key)?.kind === TRACKER_EVENT_KIND) return EVENT_MARK;
  return tierArt(key) ?? slotArt(key) ?? itemArt(key);
};

export { rotpArtOf };
