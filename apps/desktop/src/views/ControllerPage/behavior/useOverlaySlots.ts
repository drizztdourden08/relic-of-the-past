/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import type { ResolvedDevice } from '@rotp/input-mapping';
import { layoutFamilyOf } from '@app/input/controller-families/layout-family-of';
import { resolveOverlay } from '@app/input/pad-overlay/resolve-overlay';
import { CONTROLLER_SILHOUETTE_ANCHORS, CONTROLLER_SILHOUETTE_PATHS } from '@app/input/pad-overlay/silhouette.constants';
import { vidPidKey } from '@app/input/pad-overlay/vid-pid-key';
import type { PadOverlayModel } from '../ControllerPage.type';
import { slotViewsOf } from './slot-views';

const useOverlaySlots = (entry: DeviceEntry | undefined, resolved: ResolvedDevice | null): PadOverlayModel | null =>
  useMemo(() => {
    if (!entry || !resolved) return null;
    const positions = new Set<string>(resolved.controls.map((control) => control.position));
    const family = layoutFamilyOf(entry.family, positions);
    const { variant, slots } = resolveOverlay(family, vidPidKey(entry.vendorId, entry.productId), positions);
    return {
      outline: CONTROLLER_SILHOUETTE_PATHS[variant],
      anchors: CONTROLLER_SILHOUETTE_ANCHORS[variant],
      slots: slotViewsOf(slots),
    };
  }, [entry, resolved]);

export { useOverlaySlots };
