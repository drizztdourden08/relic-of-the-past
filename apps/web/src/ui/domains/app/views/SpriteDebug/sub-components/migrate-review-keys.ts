/* @layer renderer-components @kind logic */
/**
 * One-shot migration for item-review verdicts saved under the old display-name
 * keys, back when the item catalog had no stable id to key on. Resolved once
 * on load — the next save persists ids only, so a user's data has nothing left
 * to migrate the next time this runs. Dev-tool review data in userData, not
 * dataset content, so an unresolvable legacy key (one of the old orphaned
 * sprite-map entries) is simply dropped rather than preserved.
 */
import { find } from '@shared/game/data';
import type { ReviewData } from '../SpriteDebug.type';

const ID_PATTERN = /^item-\d+$/;

const migrateLegacyReviewKeys = (data: ReviewData): ReviewData => {
  const alreadyMigrated = Object.keys(data).every(key => ID_PATTERN.test(key));
  if (alreadyMigrated) return data;

  const byName = new Map<string, string>();
  for (const item of find('item', () => true)) {
    if (!byName.has(item.randomizerName)) byName.set(item.randomizerName, item.id);
    if (item.vanillaName && !byName.has(item.vanillaName)) byName.set(item.vanillaName, item.id);
  }

  const migrated: ReviewData = {};
  for (const [key, entry] of Object.entries(data)) {
    const id = ID_PATTERN.test(key) ? key : byName.get(key);
    if (id) migrated[id] = entry;
  }
  return migrated;
};

export { migrateLegacyReviewKeys };
