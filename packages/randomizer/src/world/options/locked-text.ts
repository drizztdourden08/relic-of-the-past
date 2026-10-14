/* @layer shared-game @kind logic */
import type { OptionHead, OptionSeed } from '../options.type';

const lockedText = (head: OptionHead, sourceDefault: string): OptionSeed => {
  const { key, displayName, group, implementation } = head;
  return { key, displayName, group, kind: 'text', implementation, sourceDefault, baseline: sourceDefault, locked: true };
};

export { lockedText };
