/* @layer sanctuary-site @kind logic */
/** Which files the site can show in place: images and videos, told apart by content type. */

type MediaKind = 'image' | 'video';

const mediaKindOf = (contentType: string): MediaKind | null => {
  const type = contentType.toLowerCase();
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  return null;
};

export { mediaKindOf };
export type { MediaKind };
