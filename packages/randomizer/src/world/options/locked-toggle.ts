/* @layer shared-game @kind logic */
import type { OptionHead, OptionSeed } from '../options.type';

const lockedToggle = (head: OptionHead, sourceDefault = false, baseline = sourceDefault): OptionSeed => {
  const { key, displayName, group, implementation } = head;
  return { key, displayName, group, kind: 'toggle', implementation, sourceDefault, baseline, locked: true };
};

export { lockedToggle };
