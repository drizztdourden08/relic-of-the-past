/* @layer website-site @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { DepthLayer } from '../DepthLayer';
import { FeatureRow } from './sub-components/FeatureRow';
import { GroupHeading } from './sub-components/GroupHeading';
import type { FeatureGroupSectionProps } from './FeatureGroupSection.type';
import './FeatureGroupSection.css';

const FeatureGroupSection = ({ group }: FeatureGroupSectionProps) => (
  <Box as="section" aria-labelledby={`${group.id}-title`} className="feature-group" data-glow={group.glow}>
    <DepthLayer depth="back" className="feature-group__glow" />
    <GroupHeading group={group} />
    {group.features.map((feature, index) => (
      <FeatureRow key={feature.id} feature={feature} figure={`${group.numeral}.${index + 1}`} />
    ))}
  </Box>
);

export { FeatureGroupSection };
