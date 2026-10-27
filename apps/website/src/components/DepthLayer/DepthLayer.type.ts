/* @layer website-site @kind types */
import type { ReactNode } from 'react';
import type { Depth } from '../../features';

type DepthLayerProps = {
  depth: Depth;
  className?: string;
  children?: ReactNode;
};

export type { DepthLayerProps };
