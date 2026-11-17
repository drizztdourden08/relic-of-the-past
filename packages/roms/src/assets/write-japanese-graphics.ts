/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { JAPANESE_GRAPHICS_PATH } from './japanese-graphics-path.constants';

const writeJapaneseGraphics = (files: FileStore, bytes: Uint8Array): Promise<void> =>
  files.writeBytes(JAPANESE_GRAPHICS_PATH, bytes);

export { writeJapaneseGraphics };
