/* @layer renderer-components @kind component */
import { SvgGroup } from '@drizztdourden08/tessera/primitives';
import { STICK_TRAVEL_RATIO } from '../PadOverlay.constants';
import type { PartProps } from '../PadOverlay.type';
import { OverlayGlyph } from './OverlayGlyph';
import { OverlayHalo } from './OverlayHalo';

const clampAxis = (value: number | undefined): number => Math.min(Math.max(value ?? 0, -1), 1);

const OverlayStick = ({ part, state }: PartProps) => {
  const travel = part.radius * STICK_TRAVEL_RATIO;
  const shift = `translate(${clampAxis(state?.x) * travel} ${-clampAxis(state?.y) * travel})`;
  return (
    <SvgGroup className="pad-overlay__part">
      <OverlayHalo part={part} level={state?.pressed ? 1 : 0} />
      <SvgGroup className="pad-overlay__stick" transform={shift}>
        <OverlayGlyph part={part} />
      </SvgGroup>
    </SvgGroup>
  );
};

export { OverlayStick };
