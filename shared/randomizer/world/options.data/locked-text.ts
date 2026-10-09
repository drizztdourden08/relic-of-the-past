/* @layer shared-game @kind logic */
import type { OptionGroupId, OptionImplementation, OptionSeed } from '../options.type';

const lockedText = (
  key: string, displayName: string, group: OptionGroupId, implementation: OptionImplementation, sourceDefault: string,
): OptionSeed =>
  ({ key, displayName, group, kind: 'text', implementation, sourceDefault, baseline: sourceDefault, locked: true });

export { lockedText };
