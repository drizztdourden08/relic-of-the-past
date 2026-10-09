/* @layer shared-game @kind logic */
import type { DialogFrame } from '../dialog-frame.types';
import type { DialogPrompt, PromptControls } from './dialog-prompts.type';
import { CHOOSE_ITEM, CHOOSE_VERTICAL, CONFIRM, TYPING_RENDER_STATE } from './dialog-prompts.constants';
import { typingPrompts } from './typing-prompts';

const promptsFor = (frame: DialogFrame, controls: PromptControls): DialogPrompt[] => {
  const { active, kind, wait, renderState } = frame;
  if (!active || kind === 'story') return [];
  if (kind === 'menu') return [CHOOSE_VERTICAL, CONFIRM];
  if (wait === 'choice') return [CHOOSE_VERTICAL, CONFIRM];
  if (wait === 'item') return [CHOOSE_ITEM, CONFIRM];
  if (wait === 'key') return [{ buttons: ['a'], label: 'Next' }];
  if (wait === 'end') return [{ buttons: ['a'], label: 'Close' }];
  return renderState === TYPING_RENDER_STATE ? typingPrompts(controls) : [];
};

export { promptsFor };
