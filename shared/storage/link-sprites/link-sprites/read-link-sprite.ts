/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { spritePath } from './sprite-path';

const readLinkSprite = (files: FileStore, name: string): Promise<Uint8Array | null> =>
  files.readBytes(spritePath(name));

export { readLinkSprite };
