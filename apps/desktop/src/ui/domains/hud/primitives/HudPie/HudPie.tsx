/* @layer renderer-hud @kind component */
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { DISC_RADIUS, HUB_RADIUS, SLICE_STROKE, VIEW_BOX } from './HudPie.constants';
import { buildSlices } from './behavior/build-slices';
import { sliceStateAt } from './behavior/slice-state-at';
import type { HudPieProps } from './HudPie.type';
import './HudPie.css';

const HudPie = (props: HudPieProps) => {
  const { sliceCount, slicesLeft, size } = props;

  const slices = useMemo(
    () => buildSlices(sliceCount).map(({ path, pushX, pushY }) => ({
      path,
      style: { '--hud-pie-push-x': `${pushX}px`, '--hud-pie-push-y': `${pushY}px` } as CSSProperties,
    })),
    [sliceCount],
  );

  return (
    <svg className="hud-pie" viewBox={VIEW_BOX} width={size} height={size} aria-hidden="true">
      <circle className="hud-pie__disc" r={DISC_RADIUS} />
      {slices.map(({ path, style }, index) => (
        <path
          key={index}
          className={`hud-pie__slice hud-pie__slice--${sliceStateAt(index, slices.length, slicesLeft)}`}
          d={path}
          strokeWidth={SLICE_STROKE}
          style={style}
        />
      ))}
      <circle className="hud-pie__hub" r={HUB_RADIUS} />
    </svg>
  );
};

export { HudPie };
