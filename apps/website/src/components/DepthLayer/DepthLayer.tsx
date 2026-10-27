/* @layer website-site @kind component */
import { Box } from '../../design';
import type { DepthLayerProps } from './DepthLayer.type';
import './DepthLayer.css';

const DepthLayer = ({ depth, className, children }: DepthLayerProps) => (
  <Box
    className={className ? `depth depth--${depth} ${className}` : `depth depth--${depth}`}
    aria-hidden={depth === 'back' ? true : undefined}
  >
    {children}
  </Box>
);

export { DepthLayer };
