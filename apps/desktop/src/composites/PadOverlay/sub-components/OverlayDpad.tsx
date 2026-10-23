/* @layer renderer-components @kind component */
import { DpadWedges, IDLE_DPAD } from '../../DpadWedges';
import type { PartProps } from '../PadOverlay.type';

const OverlayDpad = ({ part, state }: PartProps) => (
  <DpadWedges cx={part.x} cy={part.y} size={part.radius * 2} state={state?.dpad ?? IDLE_DPAD} />
);

export { OverlayDpad };
