/* @layer renderer-components @kind component */
import { SvgCircle, SvgGroup, SvgPath, SvgText } from '@drizztdourden08/tessera/primitives';
import { stickCap } from '../behavior/stick-cap';
import { STICK_CAP_RATIO, STICK_MARKS, STICK_TICK_FROM, STICK_TICK_TO, STICK_WELL_GAP } from '../PadOverlay.constants';
import type { PartProps } from '../PadOverlay.type';

const OverlayStick = ({ part, state }: PartProps) => {
  const { x, y, radius, slot } = part;
  const capR = radius * STICK_CAP_RATIO;
  const cap = stickCap(state, radius - capR - radius * STICK_WELL_GAP);
  const tick = `M0 ${-capR * STICK_TICK_FROM} L0 ${-capR * STICK_TICK_TO}`;
  return (
    <SvgGroup className="pad-overlay__part">
      <SvgCircle className="pad-overlay__well" cx={x} cy={y} r={radius} />
      <SvgGroup className="pad-overlay__cap" transform={`translate(${x + cap.dx} ${y + cap.dy})`} data-pressed={state?.pressed ? '' : undefined}>
        <SvgCircle className="pad-overlay__cap-face" cx={0} cy={0} r={capR} />
        {cap.deflected && <SvgPath className="pad-overlay__cap-tick" d={tick} transform={`rotate(${cap.angle})`} />}
        <SvgText className="pad-overlay__cap-mark" x={0} y={0} fontSize={capR} textAnchor="middle" dominantBaseline="central">
          {STICK_MARKS[slot.anchor] ?? ''}
        </SvgText>
      </SvgGroup>
    </SvgGroup>
  );
};

export { OverlayStick };
