/* @layer renderer-components @kind component */
import { SvgGroup, SvgPath, SvgText } from '@drizztdourden08/tessera/primitives';
import { SvgTspan } from '@app/primitives/SvgTspan';
import type { OverlayLabelProps } from '../PadOverlay.type';

const OverlayLabel = ({ placed, detail, active }: OverlayLabelProps) => {
  const { leader, text, side, part, detailDy } = placed;
  const path = leader.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ');
  const anchor = side === 'left' ? 'end' : 'start';
  const stacked = detailDy > 0 && detail !== undefined;
  const nameY = stacked ? text.y - detailDy / 2 : text.y;

  return (
    <SvgGroup className="pad-overlay__callout" data-active={active ? '' : undefined}>
      <SvgPath className="pad-overlay__leader" d={path} />
      <SvgText className="pad-overlay__label" x={text.x} y={nameY} textAnchor={anchor} dominantBaseline="central">
        <SvgTspan className="pad-overlay__name">{part.slot.label}</SvgTspan>
        {!stacked && detail !== undefined && <SvgTspan className="pad-overlay__detail">{` ${detail}`}</SvgTspan>}
      </SvgText>
      {stacked && (
        <SvgText className="pad-overlay__label pad-overlay__detail" x={text.x} y={nameY + detailDy} textAnchor={anchor} dominantBaseline="central">
          {detail}
        </SvgText>
      )}
    </SvgGroup>
  );
};

export { OverlayLabel };
