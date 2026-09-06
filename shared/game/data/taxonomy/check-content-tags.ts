/* @layer shared-game @kind data */
/**
 * Check content tag taxonomy. This is the one CheckTag family that was never a pure
 * duplicate of another record's field (world/location/area/dungeon all were,
 * and were deleted in favor of joining ScreenRecord/AreaRecord/DungeonRecord
 * directly). A check's content, meaning whether it carries a key, the big key,
 * the map/compass or a boss's prize, is derived from name-matching, so it earns
 * a real, stored tag instead of a value recomputed on every read.
 */

type ContentTag = 'content:key' | 'content:big-key' | 'content:map-compass' | 'content:boss-item';

interface ContentTagMetadata {
  id: ContentTag;
  label: string;
  namespace: 'content';
}

const CONTENT_TAG_NAMESPACES: { id: 'content'; label: string }[] = [
  { id: 'content', label: 'Content' },
];

const CONTENT_TAG_METADATA: ContentTagMetadata[] = [
  { id: 'content:key', label: 'Key', namespace: 'content' },
  { id: 'content:big-key', label: 'Big Key', namespace: 'content' },
  { id: 'content:map-compass', label: 'Map/Compass', namespace: 'content' },
  { id: 'content:boss-item', label: 'Boss Item', namespace: 'content' },
];

export { CONTENT_TAG_METADATA, CONTENT_TAG_NAMESPACES };
export type { ContentTag, ContentTagMetadata };
