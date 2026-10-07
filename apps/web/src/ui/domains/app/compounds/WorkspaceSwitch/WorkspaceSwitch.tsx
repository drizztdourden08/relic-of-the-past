/* @layer renderer-components @kind component */
/**
 * Floats on the top edge of the profile window, the Data manager and the Randomizer page, to
 * jump between them. The game side needs a profile, so it is off until one exists, and the
 * Randomizer is offered only for a profile that has a randomizer config, local or Archipelago.
 */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import gamepadIcon from '@iconify-icons/lucide/gamepad-2';
import shuffleIcon from '@iconify-icons/lucide/shuffle';
import databaseIcon from '@iconify-icons/lucide/database';
import { FloatingSwitch } from '../../../../design-system/composites/FloatingSwitch';

type Workspace = 'profile' | 'randomizer' | 'data';

interface WorkspaceSwitchProps {
  current: Workspace;
  hasProfile: boolean;
  /** The active profile is a randomizer profile, so the switch offers its page. */
  hasRandomizer: boolean;
  onSelect: (workspace: Workspace) => void;
}

const WorkspaceSwitch = (props: WorkspaceSwitchProps) => {
  const { current, hasProfile, hasRandomizer, onSelect } = props;
  const items = [
    { id: 'profile', label: 'Game', icon: <IconifyIcon icon={gamepadIcon} />, disabled: !hasProfile },
    ...(hasRandomizer ? [{ id: 'randomizer', label: 'Randomizer', icon: <IconifyIcon icon={shuffleIcon} /> }] : []),
    { id: 'data', label: 'Data', icon: <IconifyIcon icon={databaseIcon} /> },
  ];
  return (
    <FloatingSwitch
      items={items}
      activeId={current}
      onSelect={(id) => onSelect(id as Workspace)}
      label="Switch between the game, its randomizer and data management"
    />
  );
};

export { WorkspaceSwitch };
export type { Workspace, WorkspaceSwitchProps };
