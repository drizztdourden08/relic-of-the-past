/* @layer shared-storage @kind logic */
import { IN_GAME_BINARY_FILES } from '@shared/asset-extraction/item-sprites/in-game-binaries';

const extractedFileNames = (defs: readonly { file: string }[]): string[] =>
  [...defs.map((def) => `${def.file}.png`), ...IN_GAME_BINARY_FILES];

export { extractedFileNames };
