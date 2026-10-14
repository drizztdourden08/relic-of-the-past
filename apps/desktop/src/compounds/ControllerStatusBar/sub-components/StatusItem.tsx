/* @layer renderer-components @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { StatusItemProps } from '../ControllerStatusBar.type';

const StatusItem = ({ icon, label }: StatusItemProps) => (
  <Box className="controller-status-bar__item" title={label}>
    <IconifyIcon icon={icon} width={14} height={14} />
    <Text>{label}</Text>
  </Box>
);

export { StatusItem };
