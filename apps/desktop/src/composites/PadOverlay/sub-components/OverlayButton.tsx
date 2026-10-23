/* @layer renderer-components @kind component */
import { SvgGroup } from '@drizztdourden08/tessera/primitives';
import type { PartProps } from '../PadOverlay.type';
import { OverlayGlyph } from './OverlayGlyph';
import { OverlayHalo } from './OverlayHalo';

const OverlayButton = ({ part, state }: PartProps) => (
  <SvgGroup className="pad-overlay__part">
    <OverlayHalo part={part} level={state?.pressed ? 1 : 0} />
    <OverlayGlyph part={part} />
  </SvgGroup>
);

export { OverlayButton };
