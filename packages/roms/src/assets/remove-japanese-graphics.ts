/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { JAPANESE_GRAPHICS_PATH } from './japanese-graphics-path.constants';

const removeJapaneseGraphics = (files: FileStore): Promise<void> => files.remove(JAPANESE_GRAPHICS_PATH);

export { removeJapaneseGraphics };
