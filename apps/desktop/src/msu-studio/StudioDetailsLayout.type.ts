/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { ToolGroup } from '@drizztdourden08/tessera/primitives';

interface StudioDetailsLayoutProps {
  editorLabel: string;
  toolbar: ToolGroup[];
  detail: ReactNode;
  children: ReactNode;
}

export type { StudioDetailsLayoutProps };
