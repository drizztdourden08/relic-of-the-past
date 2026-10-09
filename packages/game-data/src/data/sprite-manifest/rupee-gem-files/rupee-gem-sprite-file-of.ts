/* @layer shared-game @kind logic */
import { RUPEE_GEM_SPRITE_FILES } from './rupee-gem-sprite-files';

const rupeeGemSpriteFileOf = (receiveItemId: number | undefined): string | undefined =>
  receiveItemId === undefined ? undefined : RUPEE_GEM_SPRITE_FILES[receiveItemId];

export { rupeeGemSpriteFileOf };
