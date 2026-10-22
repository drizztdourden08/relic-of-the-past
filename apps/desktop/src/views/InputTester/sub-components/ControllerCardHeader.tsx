/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import bugIcon from '@iconify-icons/lucide/bug';
import { Box, Text, Image, IconButton } from '@drizztdourden08/tessera/primitives';
import { CONTROLLER_ICON_MAP } from './ControllerCard.constants';
import type { ControllerCardHeaderProps } from './ControllerCardHeader.type';

const ControllerCardHeader = ({ deviceKey, resolvedDevice, hasStickCal, onReportDevice }: ControllerCardHeaderProps) => {
  const reportDevice = useCallback(() => onReportDevice?.(deviceKey), [onReportDevice, deviceKey]);
  const controllerIcon = CONTROLLER_ICON_MAP[resolvedDevice.brandLogoKey] ?? null;

  return (
    <Box className="input-cal__card-header">
      {controllerIcon && (
        <Image src={controllerIcon} alt="" draggable={false} className="input-cal__card-icon" />
      )}
      <Text className="input-cal__card-badge">HID</Text>
      <Text className="input-cal__card-name">{resolvedDevice.name}</Text>
      {hasStickCal && (
        <Text className="input-cal__cal-badge">
          Sticks Calibrated
        </Text>
      )}
      <IconButton
        variant="ghost"
        size="sm"
        label="Report this controller as not working"
        className="input-cal__report-bug"
        onClick={reportDevice}
      >
        <IconifyIcon icon={bugIcon} width={14} height={14} />
      </IconButton>
    </Box>
  );
};

export { ControllerCardHeader };
