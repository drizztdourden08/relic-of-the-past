/* @layer renderer-app @kind types */
import type { ReactNode } from 'react';
import type { ScreenWindowProps } from '@drizztdourden08/tessera/composites';

interface FreeWindowProps {
  title: string;
  onClose: () => void;
  size?: ScreenWindowProps['size'];
  scroll?: boolean;
  children: ReactNode;
}

export type { FreeWindowProps };
