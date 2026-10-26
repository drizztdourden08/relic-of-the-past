/* @layer website-site @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { FeatureTrack } from './sub-components/FeatureTrack';
import { GroupHeading } from './sub-components/GroupHeading';
import { GroupProgress } from './sub-components/GroupProgress';
import { ParallaxBackdrop } from './sub-components/ParallaxBackdrop';
import type { FeatureGroupSectionProps } from './FeatureGroupSection.type';
import './FeatureGroupSection.css';

const FeatureGroupSection = ({ group, index }: FeatureGroupSectionProps) => (
  <Box
    as="section"
    id={group.id}
    aria-labelledby={`${group.id}-title`}
    className={`feature-group feature-group--cards-${group.features.length}`}
  >
    <Box className="feature-group__stage">
      {group.backdrop && !group.backdrop.pending ? <ParallaxBackdrop shot={group.backdrop} /> : null}
      <GroupHeading group={group} index={index} />
      <Box className="feature-group__cards">
        <FeatureTrack features={group.features} />
        <GroupProgress />
      </Box>
    </Box>
  </Box>
);

export { FeatureGroupSection };
