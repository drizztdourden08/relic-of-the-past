/* @layer shared-game @kind logic */
/**
 * The button prompts a message box shows, from what the engine is doing and which controls are on.
 * A choice asks for a direction and a confirm. A page that waits asks for the next press. A page that
 * is still typing offers the controls that act on typing: B to complete it and holding A to speed it
 * up, each only when its setting is on and it would change something. The story crawl takes no input,
 * so it never shows any.
 */
import type { DialogFrame } from './dialog-frame.types';

type PromptButton = 'a' | 'b' | 'up' | 'down' | 'left' | 'right';

interface DialogPrompt {
  buttons: PromptButton[];
  label: string;
  /** The button acts while held, so the prompt reads "Hold". */
  hold?: boolean;
}

interface PromptControls {
  fillOnB: boolean;
  holdToAccelerate: boolean;
  /** Text speed stop: 1 is the game's pacing, 0 instant. */
  speed: number;
  holdSpeed: number;
}

/** The engine's pump state while it types (kText_Render[3]). */
const TYPING_RENDER_STATE = 3;

const CHOOSE_VERTICAL: DialogPrompt = { buttons: ['up', 'down'], label: 'Choose' };
const CHOOSE_ITEM: DialogPrompt = { buttons: ['left', 'right'], label: 'Choose' };
const CONFIRM: DialogPrompt = { buttons: ['a'], label: 'Confirm' };

/** Holding A only helps when the held speed beats the typing speed; instant has nothing left to speed up. */
const holdHelps = ({ holdToAccelerate, speed, holdSpeed }: PromptControls): boolean =>
  holdToAccelerate && speed !== 0 && holdSpeed > speed;

const typingPrompts = (controls: PromptControls): DialogPrompt[] => {
  const prompts: DialogPrompt[] = [];
  if (holdHelps(controls)) prompts.push({ buttons: ['a'], label: 'Faster', hold: true });
  if (controls.fillOnB) prompts.push({ buttons: ['b'], label: 'Complete' });
  return prompts;
};

const promptsFor = (frame: DialogFrame, controls: PromptControls): DialogPrompt[] => {
  const { active, kind, wait, renderState } = frame;
  if (!active || kind === 'story') return [];
  // The game-over menu has written its lines and waits on the fairy cursor.
  if (kind === 'menu') return [CHOOSE_VERTICAL, CONFIRM];
  if (wait === 'choice') return [CHOOSE_VERTICAL, CONFIRM];
  if (wait === 'item') return [CHOOSE_ITEM, CONFIRM];
  if (wait === 'key') return [{ buttons: ['a'], label: 'Next' }];
  if (wait === 'end') return [{ buttons: ['a'], label: 'Close' }];
  return renderState === TYPING_RENDER_STATE ? typingPrompts(controls) : [];
};

export { promptsFor };
export type { DialogPrompt, PromptButton, PromptControls };
