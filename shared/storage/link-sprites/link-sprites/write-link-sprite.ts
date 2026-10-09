/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { spritePath } from './sprite-path';

const writeLinkSprite = (files: FileStore, name: string, bytes: Uint8Array): Promise<void> =>
  files.writeBytes(spritePath(name), bytes);

export { writeLinkSprite };
