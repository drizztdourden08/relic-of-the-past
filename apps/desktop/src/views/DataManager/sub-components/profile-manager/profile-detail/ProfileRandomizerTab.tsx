/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { useState } from 'react';
import { Box, SegmentedControl, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { buildOptionFactGroups } from './build-option-facts';
import type { OptionScope } from './build-option-facts.type';
import { changedOptions } from './changed-options';
import { buildRunFacts } from './build-run-facts';
import { FactsSection } from './FactsSection';
import { scopeOptions, scopeTitles } from './ProfileRandomizerTab.constants';
import type { ProfileRandomizerTabProps } from './profile-detail.type';

const ProfileRandomizerTab = ({ randomizer }: ProfileRandomizerTabProps) => {
  const t = useT();
  const [scope, setScope] = useState<OptionScope>('changed');
  const groups = buildOptionFactGroups(randomizer.options, scope);
  const changed = changedOptions(randomizer.options).length;

  return (
    <Stack gap="lg">
      <FactsSection title={t('data-manager:profile-manager.profile-randomizer-tab.run')} facts={[buildRunFacts(randomizer, t)]} />
      <Stack gap="sm">
        <Text variant="subtitle">{scopeTitles(t)[scope]}</Text>
        <Text variant="caption" tone="muted">
          {changed === 0 ? t('data-manager:profile-detail.randomizer.all-default') : t('data-manager:profile-detail.randomizer.differ', { count: changed })}
        </Text>
        <SegmentedControl size="sm" value={scope} options={scopeOptions(t)} onChange={(next) => setScope(next as OptionScope)} />
        <Box className="profile-detail__grid">
          {groups.map(({ title, facts }) => <FactsSection key={title} title={title} facts={[facts]} />)}
        </Box>
      </Stack>
    </Stack>
  );
};

export { ProfileRandomizerTab };
