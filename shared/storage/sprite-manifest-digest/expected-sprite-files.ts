/* @layer shared-storage @kind logic */
import { SPRITE_DEFINITIONS } from '@rotp/game-data';

const expectedSpriteFiles = (): string[] => SPRITE_DEFINITIONS.map(def => `${def.file}.png`);

export { expectedSpriteFiles };
