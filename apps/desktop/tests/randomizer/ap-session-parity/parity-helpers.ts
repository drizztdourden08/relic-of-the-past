/* @layer tests @kind helper */
import { expect } from 'vitest';
import { isShopSlotLocation } from '@rotp/randomizer';
import { stripHighlight } from '@rotp/game-core';
import type { LocationKey } from '@rotp/randomizer';
import { WORD_5 } from './parity-cases.data';

const SETTLE_TICKS = 400;

const settle = async (): Promise<void> => {
  for (let i = 0; i < SETTLE_TICKS; i += 1) await Promise.resolve();
};

const armedSet = (calls: readonly string[], armed: readonly string[]): { rest: string[]; word5: number[] } => {
  const word5: number[] = [];
  const rest: string[] = [];
  for (const call of [...calls, ...armed].map(stripHighlight)) {
    const match = WORD_5.exec(call);
    if (match === null) rest.push(call);
    else word5.push(Number(match[1]));
  }
  return { rest: rest.sort(), word5 };
};

const expectForeignSpots = (spots: readonly LocationKey[]): void => {
  expect(spots.filter((spot) => spot.startsWith('slot-pond-capacity')).length).toBeGreaterThan(0);
  expect(spots.filter((spot) => /^slot-pond-(wishing|cursed)/.test(spot)).length).toBeGreaterThan(0);
  expect(spots.some((spot) => isShopSlotLocation(spot))).toBe(true);
};

export { armedSet, expectForeignSpots, settle };
