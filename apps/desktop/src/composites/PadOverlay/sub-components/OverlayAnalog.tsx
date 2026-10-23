/* @layer renderer-components @kind component */
import { SvgGroup } from '@drizztdourden08/tessera/primitives';
import type { PartProps } from '../PadOverlay.type';
import { OverlayGlyph } from './OverlayGlyph';
import { OverlayHalo } from './OverlayHalo';

const OverlayAnalog = ({ part, state }: PartProps) => (
  <SvgGroup className="pad-overlay__part">
    <OverlayHalo part={part} level={Math.min(Math.max(state?.value ?? 0, 0), 1)} />
    <OverlayGlyph part={part} />
  </SvgGroup>
);

export { OverlayAnalog };
