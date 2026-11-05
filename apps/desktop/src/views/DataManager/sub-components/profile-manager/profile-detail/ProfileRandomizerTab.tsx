/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Box, SegmentedControl, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { buildOptionFactGroups } from './build-option-facts';
import type { OptionScope } from './build-option-facts.type';
import { changedOptions } from './changed-options';
import { buildRunFacts } from './build-run-facts';
import { FactsSection } from './FactsSection';
import { SCOPE_OPTIONS, SCOPE_TITLES } from './ProfileRandomizerTab.constants';
import type { ProfileRandomizerTabProps } from './profile-detail.type';

const ProfileRandomizerTab = ({ randomizer }: ProfileRandomizerTabProps) => {
  const [scope, setScope] = useState<OptionScope>('changed');
  const groups = buildOptionFactGroups(randomizer.options, scope);
  const changed = changedOptions(randomizer.options).length;

  return (
    <Stack gap="lg">
      <FactsSection title="Run" facts={[buildRunFacts(randomizer)]} />
      <Stack gap="sm">
        <Text variant="subtitle">{SCOPE_TITLES[scope]}</Text>
        <Text variant="caption" tone="muted">
          {changed === 0 ? 'Every option is at its default.' : `${changed} option${changed === 1 ? '' : 's'} differ from the default.`}
        </Text>
        <SegmentedControl size="sm" value={scope} options={SCOPE_OPTIONS} onChange={(next) => setScope(next as OptionScope)} />
        <Box className="profile-detail__grid">
          {groups.map(({ title, facts }) => <FactsSection key={title} title={title} facts={[facts]} />)}
        </Box>
      </Stack>
    </Stack>
  );
};

export { ProfileRandomizerTab };
