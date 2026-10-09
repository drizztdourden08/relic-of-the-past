/* @layer shared-game @kind data */
import type { ContentTagMetadata } from './check-content-tags.generated.type';

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
