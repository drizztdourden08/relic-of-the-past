/* @layer renderer-lib @kind logic */
import { MIME_BY_EXT } from './custom-glyph-store.constants';
import { glyphFiles } from './glyph-files';

const urlCache = new Map<string, string>();

const load = async (profileId: string, fileKey: string): Promise<string | null> => {
  const cached = urlCache.get(fileKey);
  if (cached) return cached;
  const bytes = await glyphFiles.store().readBytes(glyphFiles.imagePath(profileId, fileKey));
  if (!bytes) return null;
  const type = MIME_BY_EXT[glyphFiles.extensionOf(fileKey)] ?? 'image/png';
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type }));
  urlCache.set(fileKey, url);
  return url;
};

const drop = (fileKey: string): void => {
  const url = urlCache.get(fileKey);
  if (!url) return;
  URL.revokeObjectURL(url);
  urlCache.delete(fileKey);
};

const glyphUrlCache = {
  get: (fileKey: string): string | null => urlCache.get(fileKey) ?? null,
  load,
  drop,
};

export { glyphUrlCache };
