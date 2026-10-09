/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import type { SidebarProfileButtonProps } from './controls.type';

const SidebarProfileButton = ({ profile, active, onSelect }: SidebarProfileButtonProps) => {
  const handleClick = useCallback(() => onSelect(profile), [onSelect, profile]);
  return (
    <IconButton variant="ghost" active={active} label={profile.name} onClick={handleClick}>
      <Icon name={profile.deviceType === 'keyboard' ? 'keyboard' : 'gamepad-2'} />
    </IconButton>
  );
};

export { SidebarProfileButton };
