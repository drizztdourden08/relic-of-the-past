/* @layer renderer-lib @kind logic */
import type { KeyboardBinding } from '@rotp/game-data';
import { formatKeyCode } from './format-key-code';

const formatKeyBinding = (b: KeyboardBinding): string => {
  const parts: string[] = [];
  if (b.modifiers?.ctrl) parts.push('Ctrl');
  if (b.modifiers?.shift) parts.push('Shift');
  if (b.modifiers?.alt) parts.push('Alt');
  parts.push(b.label ?? formatKeyCode(b.code));
  return parts.join(' + ');
};

export { formatKeyBinding };
