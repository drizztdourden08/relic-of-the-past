/* @layer shared-game @kind types */

type ContentTag = 'content:key' | 'content:big-key' | 'content:map-compass' | 'content:boss-item';

interface ContentTagMetadata {
  id: ContentTag;
  label: string;
  namespace: 'content';
}

export type { ContentTag, ContentTagMetadata };
