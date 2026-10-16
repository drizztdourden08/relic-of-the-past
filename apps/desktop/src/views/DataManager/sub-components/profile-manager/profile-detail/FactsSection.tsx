/* @layer renderer-components @kind component */
import { Stack, SectionHeader, Text } from '@drizztdourden08/tessera/primitives';
import { FactsPanel } from '@drizztdourden08/tessera/composites';
import type { FactsSectionProps } from './profile-detail.type';

const FactsSection = ({ title, hint, facts }: FactsSectionProps) => (
  <Stack gap="sm" className="profile-detail__section">
    <SectionHeader title={title} level={4} />
    {hint && <Text variant="caption" tone="muted">{hint}</Text>}
    <FactsPanel groups={facts} layout="rows" label={title} />
  </Stack>
);

export { FactsSection };
