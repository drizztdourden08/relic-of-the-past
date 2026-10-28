/* @layer renderer-components @kind component */
import { Box, Small, Span } from '@drizztdourden08/tessera/primitives';
import type { RatioHeaderProps } from './RatioHeader.type';

const RatioHeader = (props: RatioHeaderProps) => {
  const { label, description } = props;
  return (
    <Box className="aspect-ratio-control__header">
      <Span className="aspect-ratio-control__label">{label}</Span>
      {description !== undefined && <Small tone="dim">{description}</Small>}
    </Box>
  );
};

export { RatioHeader };
