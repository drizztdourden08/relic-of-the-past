import type { ReactNode } from 'react';

type PortalLayer = 'overlay' | 'modal' | 'popover' | 'toast' | 'tooltip';

interface PortalProps {
  layer: PortalLayer;
  children: ReactNode;
}

export type {
  PortalLayer,
  PortalProps,
};
