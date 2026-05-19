import type { ReactNode } from 'react';

interface FullScreenLayerProps {
  children: ReactNode;
  onClose: () => void;
  hidden?: boolean;
}

export type {
  FullScreenLayerProps,
};
