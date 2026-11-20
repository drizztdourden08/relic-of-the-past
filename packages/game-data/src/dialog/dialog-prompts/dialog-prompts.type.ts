/* @layer shared-game @kind types */
type PromptButton = 'a' | 'b' | 'up' | 'down' | 'left' | 'right';

type PromptAction = 'choose' | 'confirm' | 'next' | 'close' | 'faster' | 'complete';

interface DialogPrompt {
  buttons: PromptButton[];
  action: PromptAction;
  hold?: boolean;
}

interface PromptControls {
  fillOnB: boolean;
  holdToAccelerate: boolean;
  speed: number;
  holdSpeed: number;
}

export type { DialogPrompt, PromptAction, PromptButton, PromptControls };
