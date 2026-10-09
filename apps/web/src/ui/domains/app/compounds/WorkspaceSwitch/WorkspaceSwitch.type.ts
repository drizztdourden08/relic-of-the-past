/* @layer renderer-components @kind types */
type Workspace = 'profile' | 'randomizer' | 'data' | 'store';

interface WorkspaceSwitchProps {
  current: Workspace;
  hasProfile: boolean;
  hasRandomizer: boolean;
  onSelect: (workspace: Workspace) => void;
}

export type { Workspace, WorkspaceSwitchProps };
