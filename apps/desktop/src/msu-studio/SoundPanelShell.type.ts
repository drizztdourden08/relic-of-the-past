/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { ToolGroup } from '@drizztdourden08/tessera/primitives';
import type { SoundListHeaderProps } from './SoundListHeader.type';

interface SoundPanelShellProps {
  editorLabel: string;
  toolbar: ToolGroup[];
  detail: ReactNode;
  header: SoundListHeaderProps;
  children: ReactNode;
}

export type { SoundPanelShellProps };
