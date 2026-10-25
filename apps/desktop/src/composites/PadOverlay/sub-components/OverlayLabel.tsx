/* @layer renderer-components @kind component */
import { SvgGroup, SvgPath, SvgText } from '@drizztdourden08/tessera/primitives';
import type { OverlayLabelProps } from '../PadOverlay.type';

const OverlayLabel = ({ placed, detail, active }: OverlayLabelProps) => {
  const { leader, nameAt, detailAt, anchor, part } = placed;
  const path = leader.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ');

  return (
    <SvgGroup className="pad-overlay__callout" data-active={active ? '' : undefined}>
      <SvgPath className="pad-overlay__leader" d={path} />
      <SvgText className="pad-overlay__name" x={nameAt.x} y={nameAt.y} textAnchor={anchor} dominantBaseline="central">
        {part.slot.label}
      </SvgText>
      {detail !== undefined && (
        <SvgText className="pad-overlay__detail" x={detailAt.x} y={detailAt.y} textAnchor={anchor} dominantBaseline="central">
          {detail}
        </SvgText>
      )}
    </SvgGroup>
  );
};

export { OverlayLabel };
