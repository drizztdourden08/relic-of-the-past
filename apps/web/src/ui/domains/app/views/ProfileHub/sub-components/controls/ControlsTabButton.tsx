/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Pressable } from '@drizztdourden08/tessera/primitives';
import type { ControlsTabButtonProps } from './controls.type';

const ControlsTabButton = ({ tab, active, onTabChange }: ControlsTabButtonProps) => {
  const { id } = tab;
  const handleClick = useCallback(() => onTabChange(id), [onTabChange, id]);
  return (
    <Pressable
      role="tab"
      aria-selected={active}
      disabled={tab.disabled}
      title={tab.disabled ? tab.reason : undefined}
      className={`controls-tabs__tab ${active ? 'controls-tabs__tab--active' : ''}`}
      onClick={handleClick}
    >
      {tab.label}
    </Pressable>
  );
};

export { ControlsTabButton };
