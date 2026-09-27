/* @layer shared-game @kind generated */
/**
 * GENERATED FILE. Do not hand-edit; run `npm run generate`
 * (scripts/generate-from-records.mjs).
 *
 * Source: records/tags, every tag record that applies to a check
 *
 * A check's content is the one check tag family no other record states, so it is stored instead
 * of recomputed on every read.
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
