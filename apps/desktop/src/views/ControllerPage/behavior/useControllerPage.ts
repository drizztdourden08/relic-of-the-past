/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import { usePadState } from '@drizztdourden08/brock-input/renderer';
import { controllerCardInfo, resolveDeviceFromEntry } from '@rotp/input-mapping';
import { CONTROLLER_ICON_MAP } from '@app/input/controller-families/controller-icon-map.constants';
import { useControllerDevices } from '@app/hooks/useControllerDevices';
import { padDisplayName } from '@app/input/controller-names/pad-display-name';
import type { ControllerPageModel } from '../ControllerPage.type';
import { padToOverlayState } from './pad-to-overlay-state';
import { useControllerCalibration } from './useControllerCalibration';
import { useControllerInputState } from './useControllerInputState';
import { useOverlaySlots } from './useOverlaySlots';

const useControllerPage = (deviceKey: string): ControllerPageModel | null => {
  const { entries, groups, addMapping } = useControllerDevices();
  const pad = usePadState(deviceKey);
  const state = useControllerInputState(deviceKey);
  const calibration = useControllerCalibration(deviceKey);

  const entry = useMemo(() => entries.find((candidate) => candidate.deviceKey === deviceKey), [entries, deviceKey]);
  const resolved = useMemo(
    () => (entry?.status === 'ready' ? resolveDeviceFromEntry(entry) : null),
    [entry],
  );
  const overlay = useOverlaySlots(entry, resolved);
  const overlayState = useMemo(() => padToOverlayState(pad, overlay?.slots ?? []), [pad, overlay]);
  const adapterPort = useMemo(() => {
    const group = groups.find((candidate) => candidate.ports.some((port) => port.deviceKey === deviceKey));
    return group?.isAdapter ? (group.ports.find((port) => port.deviceKey === deviceKey)?.portNumber ?? null) : null;
  }, [groups, deviceKey]);

  return useMemo(() => {
    if (!entry) return null;
    const info = controllerCardInfo(entry);
    return {
      deviceKey, entry, resolved, state, pad, overlay, overlayState, calibration, addMapping, adapterPort,
      name: padDisplayName(entry),
      idLabel: `${info.vendorId}:${info.productId}`,
      brandIcon: CONTROLLER_ICON_MAP[info.deviceFamily] ?? null,
    };
  }, [deviceKey, entry, resolved, state, pad, overlay, overlayState, calibration, addMapping, adapterPort]);
};

export { useControllerPage };
