/* @layer website-site @kind component */
import { Box, P, Title } from '@drizztdourden08/tessera/primitives';
import { ROMAN_NUMERALS } from './GroupHeading.constants';
import type { GroupHeadingProps } from './GroupHeading.type';
import './GroupHeading.css';

const GroupHeading = ({ group, index }: GroupHeadingProps) => (
  <Box className="group-heading">
    <P className="group-heading__kicker">{`${ROMAN_NUMERALS[index]} \u00b7 ${group.kicker}`}</P>
    <Title level={2} tone="primary" id={`${group.id}-title`} className="group-heading__title">
      {group.title}
    </Title>
    <P className="group-heading__lead">{group.lead}</P>
  </Box>
);

export { GroupHeading };
