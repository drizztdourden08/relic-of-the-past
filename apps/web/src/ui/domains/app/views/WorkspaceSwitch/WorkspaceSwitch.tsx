/* @layer renderer-components @kind component */
/**
 * Floats on the top edge of the profile window and the Data manager, to jump
 * between them. The game side needs a profile, so it is off until one exists.
 */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import gamepadIcon from '@iconify-icons/lucide/gamepad-2';
import databaseIcon from '@iconify-icons/lucide/database';
import { FloatingSwitch } from '../../../../design-system/composites/FloatingSwitch';

type Workspace = 'profile' | 'data';

interface WorkspaceSwitchProps {
  current: Workspace;
  hasProfile: boolean;
  onSelect: (workspace: Workspace) => void;
}

const WorkspaceSwitch = (props: WorkspaceSwitchProps) => {
  const { current, hasProfile, onSelect } = props;
  const items = [
    { id: 'profile', label: 'Game', icon: <IconifyIcon icon={gamepadIcon} />, disabled: !hasProfile },
    { id: 'data', label: 'Data', icon: <IconifyIcon icon={databaseIcon} /> },
  ];
  return (
    <FloatingSwitch
      items={items}
      activeId={current}
      onSelect={(id) => onSelect(id as Workspace)}
      label="Switch between the game and data management"
    />
  );
};

export { WorkspaceSwitch };
export type { Workspace, WorkspaceSwitchProps };
