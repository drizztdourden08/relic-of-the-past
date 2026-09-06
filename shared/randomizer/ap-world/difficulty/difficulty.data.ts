/* @layer shared-game @kind data */
/**
 * The numbers the difficulty setting is built from, each one read off
 * something real rather than invented here.
 *
 * THE COPY MULTIPLES, 1 / 2 / 3. One is the reference pool
 * (Archipelago worlds/alttp/ItemPool.py difficulties['normal']), two is what
 * its easy step does to every tiered family at once, and three is one step
 * past it — as far as the shape stays honest, since a copy past a family's top
 * rung already resolves to a rupee pickup rather than to nothing
 * (core/game-hooks/progressive_grants.c PROGRESSIVE_CAP_ITEM).
 *
 * THE HEART CEILING, 20. The container receipt refuses to raise capacity past
 * 0xa0 — 160 units, eight per heart (core/zelda3/src/ancilla.c 3494) — so
 * twenty is the most the game can hold whatever the pool carries. It is also
 * exactly what the untouched pool adds up to: three to start, one from the
 * fixed container, ten from the boss containers and six more from the
 * twenty-four quarter pieces. Default and maximum are therefore the same
 * number, which is what makes the default row change nothing.
 *
 * THE HEART FLOOR, 3. What a file starts with. Below it there is nothing left
 * to take away.
 */
import { PROGRESSIVE_FAMILIES } from '../progressive/progressive-families.data';
import type { CopyMultiplier, CopyMultiplierSetting, DifficultySetting } from './difficulty.type';

/** The three stops the copies control offers, in the order it offers them. */
const COPY_MULTIPLIERS: readonly CopyMultiplier[] = [1, 2, 3];

/** Short wording for each stop, shared by the control and the catalog row. */
const COPY_MULTIPLIER_LABELS: Readonly<Record<CopyMultiplier, string>> = {
  1: 'Normal',
  2: 'Double',
  3: 'Triple',
};

/** The reference pool's own multiple — the value at which nothing moves. */
const DEFAULT_COPY_MULTIPLIER: CopyMultiplier = 1;

/** ancilla.c 3494: the container receipt stops at 0xa0, which is twenty hearts. */
const MAX_HEART_CAP = 20;

/** What a file begins with, and so the lowest a ceiling can mean anything at. */
const STARTING_HEARTS = 3;

/** Four quarter pieces make one heart (the receipt's own arithmetic). */
const PIECES_PER_HEART = 4;

/** The untouched pool's own total, which is also the game's ceiling. */
const DEFAULT_HEART_CAP = MAX_HEART_CAP;

/** Every family on the reference multiple — what an absent row reads as. */
const DEFAULT_COPY_MULTIPLIERS: CopyMultiplierSetting = Object.fromEntries(
  PROGRESSIVE_FAMILIES.map((family) => [family.id, DEFAULT_COPY_MULTIPLIER]),
) as unknown as CopyMultiplierSetting;

/** The reference seed: every family once over, hearts to the game's own ceiling. */
const DEFAULT_DIFFICULTY: DifficultySetting = {
  copies: DEFAULT_COPY_MULTIPLIERS,
  heartCap: DEFAULT_HEART_CAP,
};

/** A stored number brought back into the three stops the control offers. */
const asCopyMultiplier = (raw: number): CopyMultiplier => {
  const stepped = Math.trunc(raw);
  const found = COPY_MULTIPLIERS.find((step) => step === stepped);
  return found ?? DEFAULT_COPY_MULTIPLIER;
};

/** A stored number brought back inside the range the game can honour. */
const asHeartCap = (raw: number): number =>
  Math.min(MAX_HEART_CAP, Math.max(STARTING_HEARTS, Math.trunc(raw)));

/** True while the whole setting still describes the reference pool. */
const isReferenceDifficulty = (setting: DifficultySetting): boolean =>
  setting.heartCap >= MAX_HEART_CAP
  && PROGRESSIVE_FAMILIES.every((family) => setting.copies[family.id] === DEFAULT_COPY_MULTIPLIER);

export {
  COPY_MULTIPLIERS,
  COPY_MULTIPLIER_LABELS,
  DEFAULT_COPY_MULTIPLIER,
  DEFAULT_COPY_MULTIPLIERS,
  DEFAULT_DIFFICULTY,
  DEFAULT_HEART_CAP,
  MAX_HEART_CAP,
  PIECES_PER_HEART,
  STARTING_HEARTS,
  asCopyMultiplier,
  asHeartCap,
  isReferenceDifficulty,
};
