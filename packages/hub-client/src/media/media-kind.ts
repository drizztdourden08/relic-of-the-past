/* @layer site-kit @kind logic */
import type { MediaKind } from './media-kind.type';

const mediaKindOf = (contentType: string): MediaKind | null => {
  const type = contentType.toLowerCase();
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  return null;
};

export { mediaKindOf };
export type { MediaKind } from './media-kind.type';
