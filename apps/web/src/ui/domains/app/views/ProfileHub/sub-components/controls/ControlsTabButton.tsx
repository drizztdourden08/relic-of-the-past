/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Button } from '../../../../../../design-system/primitives/Button';
import type { ControlsTabButtonProps } from './controls.type';

const ControlsTabButton = ({ tab, active, onTabChange }: ControlsTabButtonProps) => {
  const { id } = tab;
  const handleClick = useCallback(() => onTabChange(id), [onTabChange, id]);
  return (
    <Button
      variant="bare"
      role="tab"
      aria-selected={active}
      disabled={tab.disabled}
      title={tab.disabled ? tab.reason : undefined}
      className={`controls-tabs__tab ${active ? 'controls-tabs__tab--active' : ''}`}
      onClick={handleClick}
    >
      {tab.label}
    </Button>
  );
};

export { ControlsTabButton };
