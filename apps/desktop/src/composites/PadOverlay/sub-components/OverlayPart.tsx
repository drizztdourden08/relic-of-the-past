/* @layer renderer-components @kind component */
import type { PartProps } from '../PadOverlay.type';
import { PART_OF_KIND } from './OverlayPart.constants';

const OverlayPart = ({ part, state }: PartProps) => {
  const Part = PART_OF_KIND[part.slot.kind];
  return <Part part={part} state={state} />;
};

export { OverlayPart };
