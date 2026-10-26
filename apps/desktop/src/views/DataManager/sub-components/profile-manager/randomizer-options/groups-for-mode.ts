/* @layer renderer-components @kind logic */
import type { LockedOptionGroup } from '@app/compounds/RandomizerOptionRow';
import { ONLINE_ONLY_KEYS } from './groups-for-mode.constants';
import type { ProfileRandomizerConfig } from '@app/profiles/types';

const groupsForMode = (
  groups: readonly LockedOptionGroup[], mode: ProfileRandomizerConfig['mode'] | undefined,
): readonly LockedOptionGroup[] => {
  if (mode !== 'local') return groups;
  return groups.map(({ group, options }) => ({ group, options: options.filter((option) => !ONLINE_ONLY_KEYS.has(option.key)) }));
};

export { groupsForMode };
