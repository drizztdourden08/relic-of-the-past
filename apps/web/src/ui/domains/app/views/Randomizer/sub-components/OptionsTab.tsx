/* @layer renderer-components @kind component */
/**
 * The Options tab: the profile-creation options panel, drawn read-only from
 * the profile's FROZEN snapshot, never the current baselines. The snapshot is
 * read back as the form's choices so every block draws exactly what it drew
 * when the profile was made, each value as a tag in its control's place. A
 * profile that is not randomized has no options to show.
 */
import { useMemo } from 'react';
import { Box, EmptyState } from '@ds/primitives';
import { normalizeRandomizerOptions } from '@shared/randomizer/options-snapshot';
import { choicesOfSnapshot } from '@app/hooks/randomizer/choices-of-snapshot';
import { RandomizerOptionsPanel } from '../../DataManager/sub-components/profile-manager/RandomizerOptionsPanel';
import { NOT_RANDOMIZED } from '../Randomizer.constants';
import type { ProfileRandomizerConfig } from '@shared/types/profile';

interface OptionsTabProps {
  config: ProfileRandomizerConfig | null;
  /** The profile's ROM; its extracted sprite set illustrates the item pool. */
  romFile: string | null;
}

const OptionsTab = (props: OptionsTabProps) => {
  const { config, romFile } = props;
  const snapshot = useMemo(() => normalizeRandomizerOptions(config?.options), [config]);
  const seed = config?.seed ?? '';
  const choices = useMemo(() => choicesOfSnapshot(snapshot, seed), [snapshot, seed]);

  if (config === null) return <EmptyState message={NOT_RANDOMIZED} />;

  return (
    <Box className="randomizer-page__options">
      <RandomizerOptionsPanel romFile={romFile ?? ''} seed={seed} value={choices} frozen={snapshot} />
    </Box>
  );
};

export { OptionsTab };
export type { OptionsTabProps };
