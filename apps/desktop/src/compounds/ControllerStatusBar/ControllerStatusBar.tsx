/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { statusItemsOf } from './behavior/status-items';
import type { ControllerStatusBarProps } from './ControllerStatusBar.type';
import { StatusItem } from './sub-components/StatusItem';
import './ControllerStatusBar.css';

const ControllerStatusBar = (props: ControllerStatusBarProps) => {
  const { idLabel } = props;
  const items = statusItemsOf(props);

  if (items.length === 0 && !idLabel) return null;

  return (
    <Box className="controller-status-bar">
      {items.map((item) => <StatusItem key={item.label} {...item} />)}
      {idLabel && (
        <Text className="controller-status-bar__id">{idLabel}</Text>
      )}
    </Box>
  );
};

export { ControllerStatusBar };
