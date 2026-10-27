/* @layer website-site @kind component */
import { Box } from '../../design';
import { CenterGem } from './sub-components/CenterGem';
import type { SeparatorProps } from './Separator.type';
import './Separator.css';

const Separator = (props: SeparatorProps) => {
  const { flush = false } = props;

  return (
    <Box className={flush ? 'landing-separator landing-separator--flush' : 'landing-separator'} role="separator">
      <Box className="landing-separator__line landing-separator__line--left" />
      <CenterGem />
      <Box className="landing-separator__line landing-separator__line--right" />
    </Box>
  );
};

export { Separator };
