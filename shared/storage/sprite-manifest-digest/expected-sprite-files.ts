/* @layer shared-storage @kind logic */
import { SPRITE_DEFINITIONS } from '../../game/data/sprite-manifest/manifest';

const expectedSpriteFiles = (): string[] => SPRITE_DEFINITIONS.map(def => `${def.file}.png`);

export { expectedSpriteFiles };
