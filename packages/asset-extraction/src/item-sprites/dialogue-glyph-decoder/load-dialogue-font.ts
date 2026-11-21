/* @layer shared-asset-extraction @kind logic */
import type { SpriteSource } from '../sources';

const loadDialogueFont = (source: SpriteSource): Buffer | null => source.readDialogueFont();

export { loadDialogueFont };
