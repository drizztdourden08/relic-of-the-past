/* @layer shared-game @kind logic */
import type { DialogPrompt, PromptControls } from './dialog-prompts.type';
import { INSTANT_SPEED } from './dialog-prompts.constants';

const holdHelps = ({ holdToAccelerate, speed, holdSpeed }: PromptControls): boolean =>
  holdToAccelerate && speed !== INSTANT_SPEED && holdSpeed > speed;

const typingPrompts = (controls: PromptControls): DialogPrompt[] => {
  const prompts: DialogPrompt[] = [];
  if (holdHelps(controls)) prompts.push({ buttons: ['a'], action: 'faster', hold: true });
  if (controls.fillOnB) prompts.push({ buttons: ['b'], action: 'complete' });
  return prompts;
};

export { typingPrompts };
