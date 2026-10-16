/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { ButtonVariant, Hint } from '@drizztdourden08/tessera/primitives';

interface StudioAction {
  id: string;
  label: string;
  hint: Hint;
  variant?: ButtonVariant;
  disabled?: boolean;
  onSelect: () => void | Promise<void>;
}

interface StudioActionGroup {
  id: string;
  label: string;
  actions: readonly StudioAction[];
}

interface StudioToolGroup {
  id: string;
  label: string;
  content: ReactNode;
}

interface StudioPanelSpec {
  title: string;
  content: ReactNode;
  defaultCollapsed?: boolean;
}

interface StudioFrameProps {
  caption: string;
  title: ReactNode;
  status?: ReactNode;
  groups: readonly StudioActionGroup[];
  idleHint: string;
  notices?: ReactNode;
  banner?: ReactNode;
  left?: StudioPanelSpec;
  right?: StudioPanelSpec;
  editorLabel: string;
  toolbar?: readonly StudioToolGroup[];
  children: ReactNode;
  className?: string;
}

interface StudioTopBarProps {
  caption: string;
  title: ReactNode;
  status?: ReactNode;
  groups: readonly StudioActionGroup[];
  idleHint: string;
  notices?: ReactNode;
}

interface StudioActionButtonProps {
  action: StudioAction;
}

interface StudioPanelProps {
  side: 'left' | 'right';
  spec: StudioPanelSpec;
}

interface StudioEditorProps {
  label: string;
  toolbar?: readonly StudioToolGroup[];
  children: ReactNode;
}

interface StudioWellProps {
  children: ReactNode;
  className?: string;
}

export type {
  StudioAction, StudioActionButtonProps, StudioActionGroup, StudioEditorProps, StudioFrameProps, StudioPanelProps,
  StudioPanelSpec, StudioToolGroup, StudioTopBarProps, StudioWellProps,
};
