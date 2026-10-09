/* @layer shared-game @kind types */
type PromptButton = 'a' | 'b' | 'up' | 'down' | 'left' | 'right';

interface DialogPrompt {
  buttons: PromptButton[];
  label: string;
  hold?: boolean;
}

interface PromptControls {
  fillOnB: boolean;
  holdToAccelerate: boolean;
  speed: number;
  holdSpeed: number;
}

export type { DialogPrompt, PromptButton, PromptControls };
