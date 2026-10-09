/* @layer shared-game @kind logic */
import { BLUE_SHIFT, BYTE_MAX, CHANNEL_MAX, GREEN_SHIFT } from './highlight-color.constants';

const channel = (hex: string, at: number): number => {
  const value = Number.parseInt(hex.slice(at, at + 2), 16);
  return Math.round(((Number.isNaN(value) ? 0 : value) * CHANNEL_MAX) / BYTE_MAX);
};

const hexToSnes15 = (hex: string): number => {
  const digits = hex.replace(/^#/, '');
  return channel(digits, 0) | (channel(digits, 2) << GREEN_SHIFT) | (channel(digits, 4) << BLUE_SHIFT);
};

export { hexToSnes15 };
