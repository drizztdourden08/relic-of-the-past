/* @layer shared-game @kind logic */
import type { OptionHead, OptionRange, OptionSeed } from '../options.type';

const lockedRange = (
  head: OptionHead, range: OptionRange, sourceDefault: number, baseline: number = sourceDefault,
): OptionSeed => {
  const { key, displayName, group, implementation } = head;
  return { key, displayName, group, kind: 'range', implementation, range, sourceDefault, baseline, locked: true };
};

export { lockedRange };
