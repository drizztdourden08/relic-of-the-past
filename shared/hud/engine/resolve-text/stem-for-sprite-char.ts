/* @layer shared-hud @kind logic */
import type { HudTextSpriteSet } from '../../../types/hud/hud-text';

const stemForSpriteChar = (set: HudTextSpriteSet, char: string): string | null => {
  if (set === 'hud-digits') return /^[0-9]$/.test(char) ? `font-digit-${char}` : null;
  if (char === '&') return 'font-symbol-ampersand';
  const upper = char.toUpperCase();
  if (/^[A-Z]$/.test(upper)) return `font-letter-${upper.toLowerCase()}`;
  if (/^[0-9]$/.test(upper)) return `font-digit-${upper}`;
  return null;
};

export { stemForSpriteChar };
