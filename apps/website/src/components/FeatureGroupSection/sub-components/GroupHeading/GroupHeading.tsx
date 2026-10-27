/* @layer website-site @kind component */
import { Box, P, Span, Title } from '@drizztdourden08/tessera/primitives';
import { DepthLayer } from '../../../DepthLayer';
import { splitAccent } from './behavior/split-accent';
import type { GroupHeadingProps } from './GroupHeading.type';
import './GroupHeading.css';

const GroupHeading = ({ group }: GroupHeadingProps) => {
  const [lead, accent, tail] = splitAccent(group.title, group.accent);

  return (
    <Box id={group.id} className="group-heading">
      <DepthLayer depth="back" className="group-heading__numeral">
        {group.numeral}
      </DepthLayer>
      <P className="group-heading__kicker">{`${group.numeral} · ${group.kicker}`}</P>
      <Title level={2} id={`${group.id}-title`} tabIndex={-1} className="group-heading__title">
        {lead}
        <Span className="group-heading__accent">{accent}</Span>
        {tail}
      </Title>
      <P className="group-heading__lead">{group.lead}</P>
    </Box>
  );
};

export { GroupHeading };
