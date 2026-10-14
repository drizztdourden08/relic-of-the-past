/* @layer renderer-components @kind component */
import { controllerCardInfo } from '@rotp/input-mapping';
import { DeviceCard } from './DeviceCard';
import { AdapterDeviceCard } from './AdapterDeviceCard';
import { firstPort } from './first-port';
import type { AdapterDeviceCardProps } from './controls.type';

const ControllerGroupCard = ({ group, onAssign, onAddMapping }: AdapterDeviceCardProps) => {
  if (group.isAdapter) {
    return <AdapterDeviceCard group={group} onAssign={onAssign} onAddMapping={onAddMapping} />;
  }

  const { entry, deviceKey } = firstPort(group);
  const info = controllerCardInfo(entry);
  return (
    <DeviceCard
      id={deviceKey}
      displayName={info.displayName}
      deviceFamily={info.deviceFamily}
      sdlType={info.sdlType}
      vendorId={info.vendorId}
      productId={info.productId}
      status={entry.status}
      busType={entry.busType}
      hasRumble={entry.hasRumble}
      hasGyro={entry.hasGyro}
      onAssign={onAssign}
      onAddMapping={onAddMapping}
    />
  );
};

export { ControllerGroupCard };
