/* @layer renderer-components @kind types */
import type { ControllerDeviceListProps } from './ControllerDeviceList.type';

interface ControllersSectionProps extends ControllerDeviceListProps {
  connectedCount: number;
}

export type { ControllersSectionProps };
