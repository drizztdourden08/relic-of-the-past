/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Button } from '@drizztdourden08/tessera/primitives';
import type { SidebarProfileButtonProps } from './controls.type';

const SidebarProfileButton = ({ profile, active, onSelect }: SidebarProfileButtonProps) => {
  const handleClick = useCallback(() => onSelect(profile), [onSelect, profile]);
  return (
    <Button
      variant="bare"
      className={`controls-settings__sidebar-icon-btn ${active ? 'controls-settings__sidebar-icon-btn--active' : ''}`}
      onClick={handleClick}
      title={profile.name}
    >
      {profile.deviceType === 'keyboard' ? '⌨️' : '🎮'}
    </Button>
  );
};

export { SidebarProfileButton };
