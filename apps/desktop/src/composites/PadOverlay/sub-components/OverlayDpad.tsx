/* @layer renderer-components @kind component */
import { DpadCross, IDLE_DPAD } from '../../DpadCross';
import type { PartProps } from '../PadOverlay.type';

const OverlayDpad = ({ part, state }: PartProps) => (
  <DpadCross cx={part.x} cy={part.y} size={part.radius * 2} state={state?.dpad ?? IDLE_DPAD} />
);

export { OverlayDpad };
