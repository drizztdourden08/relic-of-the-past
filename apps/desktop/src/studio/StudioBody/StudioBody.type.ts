/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { SidePanelProps, SidePanelSide } from '@drizztdourden08/tessera/composites';

type StudioSide = Pick<SidePanelProps, 'title' | 'width' | 'minWidth' | 'maxWidth'> & {
  storageKey: string;
  content: ReactNode;
};

interface StudioBodyProps {
  editorLabel: string;
  toolbar?: ReactNode;
  start?: StudioSide;
  end?: StudioSide;
  children: ReactNode;
}

interface StudioSidePanelProps {
  side: SidePanelSide;
  panel: StudioSide;
}

export type { StudioBodyProps, StudioSidePanelProps };
