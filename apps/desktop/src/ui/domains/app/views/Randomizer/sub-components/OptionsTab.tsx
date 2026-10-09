/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box, EmptyState } from '@drizztdourden08/tessera/primitives';
import { normalizeRandomizerOptions } from '@shared/randomizer/options-snapshot';
import { choicesOfSnapshot } from '@app/hooks/randomizer/choices-of-snapshot';
import { RandomizerOptionsPanel } from '../../DataManager/sub-components/profile-manager/RandomizerOptionsPanel';
import { NOT_RANDOMIZED } from '../Randomizer.constants';
import type { OptionsTabProps } from './OptionsTab.type';

const OptionsTab = (props: OptionsTabProps) => {
  const { config, romFile } = props;
  const frozenSnapshot = useMemo(() => normalizeRandomizerOptions(config?.options), [config]);
  const seed = config?.seed ?? '';
  const choices = useMemo(() => choicesOfSnapshot(frozenSnapshot, seed), [frozenSnapshot, seed]);

  if (config === null) return <EmptyState message={NOT_RANDOMIZED} />;

  return (
    <Box className="randomizer-page__options">
      <RandomizerOptionsPanel romFile={romFile ?? ''} seed={seed} value={choices} frozen={frozenSnapshot} />
    </Box>
  );
};

export { OptionsTab };
export type { OptionsTabProps };
