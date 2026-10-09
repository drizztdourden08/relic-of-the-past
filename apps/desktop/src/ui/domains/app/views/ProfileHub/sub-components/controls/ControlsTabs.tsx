/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { ControlsTabButton } from './ControlsTabButton';
import type { ControlsTabsProps } from './controls.type';
import './ControlsTabs.css';

const ControlsTabs = ({ tabs, activeTab, onTabChange }: ControlsTabsProps) => {
  const blocked = tabs.find((tab) => tab.disabled && tab.reason);

  return (
    <Box className="controls-tabs">
      <Box className="controls-tabs__strip" role="tablist">
        {tabs.map((tab) => (
          <ControlsTabButton key={tab.id} tab={tab} active={activeTab === tab.id} onTabChange={onTabChange} />
        ))}
      </Box>
      {blocked && <Text variant="caption" className="controls-tabs__reason">{blocked.reason}</Text>}
    </Box>
  );
};

export { ControlsTabs };
export type { ControlsTabItem } from './controls.type';
