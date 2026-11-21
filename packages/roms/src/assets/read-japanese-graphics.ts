/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { JAPANESE_GRAPHICS_PATH } from './japanese-graphics-path.constants';

const readJapaneseGraphics = (files: FileStore): Promise<Uint8Array | null> => files.readBytes(JAPANESE_GRAPHICS_PATH);

export { readJapaneseGraphics };
