/* @layer renderer-components @kind component */
import { Box } from '../../../../design-system/primitives/Box';
import type { HeroProps } from './Hero.type';
import './Hero.css';

const Hero = (props: HeroProps) => {
  const { ariaLabel, backdrop, art, tools, intro, side, bottom, className } = props;
  return (
    <Box as="section" className={`hero${className ? ` ${className}` : ''}`} aria-label={ariaLabel}>
      <Box className="hero__backdrop">{backdrop}</Box>
      {art}
      <Box className="hero__shade" aria-hidden="true" />
      <Box className="hero__tools">{tools}</Box>
      <Box className="hero__main">
        <Box className="hero__intro">{intro}</Box>
        {side && <Box className="hero__side">{side}</Box>}
      </Box>
      {bottom && <Box className="hero__bottom">{bottom}</Box>}
    </Box>
  );
};

export { Hero };
