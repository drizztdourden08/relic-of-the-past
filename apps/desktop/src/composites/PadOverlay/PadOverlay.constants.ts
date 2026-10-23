/* @layer renderer-components @kind constants */
import { CONTROLLER_SILHOUETTE_VIEW_BOX } from '@drizztdourden08/tessera/composites';
import type { LabelSide, OverlayBox } from './PadOverlay.type';

const SILHOUETTE_WIDTH = Number(CONTROLLER_SILHOUETTE_VIEW_BOX.split(' ')[2]);

const OVERLAY_BOX: OverlayBox = {
  width: 760, height: 300, gutter: 180, top: 20, lineH: 24, minLineH: 12, centreBand: 24, elbow: 12, textGap: 4,
};

const OVERLAY_VIEW_BOX = `0 0 ${OVERLAY_BOX.width} ${OVERLAY_BOX.height}`;

const LABEL_SIDES: readonly LabelSide[] = ['left', 'right'];

const DIRECTION_NAMES = { up: 'Up', right: 'Right', down: 'Down', left: 'Left' } as const;

const STICK_TRAVEL_RATIO = 0.5;
const STICK_ACTIVE_DEFLECTION = 0.15;
const HALO_PAD = 3;
const LEADER_GAP = 2;
const DETAIL_DECIMALS = 2;

export {
  DETAIL_DECIMALS, DIRECTION_NAMES, HALO_PAD, LABEL_SIDES, LEADER_GAP, OVERLAY_BOX, OVERLAY_VIEW_BOX,
  SILHOUETTE_WIDTH, STICK_ACTIVE_DEFLECTION, STICK_TRAVEL_RATIO,
};
