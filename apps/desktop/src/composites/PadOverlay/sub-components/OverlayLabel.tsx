/* @layer renderer-components @kind component */
import { SvgGroup, SvgPath, SvgText } from '@drizztdourden08/tessera/primitives';
import { SvgTspan } from '@app/primitives/SvgTspan';
import type { OverlayLabelProps } from '../PadOverlay.type';

const OverlayLabel = ({ placed, detail, active }: OverlayLabelProps) => {
  const { leader, text, side, part } = placed;
  const path = leader.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ');
  return (
    <SvgGroup className="pad-overlay__callout" data-active={active ? '' : undefined}>
      <SvgPath className="pad-overlay__leader" d={path} />
      <SvgText
        className="pad-overlay__label"
        x={text.x}
        y={text.y}
        textAnchor={side === 'left' ? 'end' : 'start'}
        dominantBaseline="central"
      >
        <SvgTspan className="pad-overlay__name">{part.slot.label}</SvgTspan>
        {detail !== undefined && <SvgTspan className="pad-overlay__detail">{` ${detail}`}</SvgTspan>}
      </SvgText>
    </SvgGroup>
  );
};

export { OverlayLabel };
