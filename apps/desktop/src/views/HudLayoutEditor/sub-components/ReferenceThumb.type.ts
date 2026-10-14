/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { IconName } from '@drizztdourden08/tessera/primitives';

interface ReferenceThumbProps {
  src?: string;
  placeholder?: IconName;
  specimen?: ReactNode;
}

export type { ReferenceThumbProps };
