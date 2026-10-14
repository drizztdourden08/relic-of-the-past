/* @layer renderer-hud @kind logic */
import type { DialogFrame } from '@rotp/game-data';
import type { DialogBoxSettings } from '../../../stores/dialog-settings-store';
import { INTRO_TELEPATHY_MESSAGES, STORY_LEGEND_MESSAGE } from '../DialogView.constants';
import type { DialogChrome, Grounding } from '../DialogView.type';

const groundingOf = (frame: DialogFrame, look: DialogBoxSettings, chrome: DialogChrome): Grounding => {
  const floatingGround = INTRO_TELEPATHY_MESSAGES.has(chrome.openingMessage) ? look.introTelepathyGround : look.floatingGround;
  const sceneGround = frame.kind === 'story' && frame.messageId !== STORY_LEGEND_MESSAGE;
  return {
    grounded: frame.kind === 'box' || sceneGround || (frame.kind === 'floating' && floatingGround),
    feathered: sceneGround || chrome.spawnPicker || look.groundFade,
  };
};

export { groundingOf };
