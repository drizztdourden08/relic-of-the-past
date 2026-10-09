/* @layer renderer-components @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import gamepadIcon from '@iconify-icons/lucide/gamepad-2';
import shuffleIcon from '@iconify-icons/lucide/shuffle';
import databaseIcon from '@iconify-icons/lucide/database';
import storeIcon from '@iconify-icons/lucide/store';
import { FloatingSwitch } from '@drizztdourden08/tessera/composites';
import type { Workspace, WorkspaceSwitchProps } from './WorkspaceSwitch.type';

const WorkspaceSwitch = (props: WorkspaceSwitchProps) => {
  const { current, hasProfile, hasRandomizer, onSelect } = props;
  const items = [
    { id: 'profile', label: 'Game', icon: <IconifyIcon icon={gamepadIcon} />, disabled: !hasProfile },
    ...(hasRandomizer ? [{ id: 'randomizer', label: 'Randomizer', icon: <IconifyIcon icon={shuffleIcon} /> }] : []),
    { id: 'data', label: 'Data', icon: <IconifyIcon icon={databaseIcon} /> },
    { id: 'store', label: 'Hookshop', icon: <IconifyIcon icon={storeIcon} /> },
  ];
  return (
    <FloatingSwitch
      items={items}
      activeId={current}
      onSelect={(id) => onSelect(id as Workspace)}
      label="Switch between the game, its randomizer, data management and the Hookshop"
    />
  );
};

export { WorkspaceSwitch };
export type { Workspace, WorkspaceSwitchProps };
