/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { spritePath } from './sprite-path';

const deleteLinkSprite = (files: FileStore, name: string): Promise<void> => files.remove(spritePath(name));

export { deleteLinkSprite };
