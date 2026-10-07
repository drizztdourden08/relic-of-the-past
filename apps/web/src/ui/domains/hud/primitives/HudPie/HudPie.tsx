/* @layer renderer-hud @kind component */
/**
 * A round pie of equal slices that empties clockwise. A slice that is out fades while it slides
 * away from the centre, and the next one to leave breathes. Motion lives in HudPie.css.
 */
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { DISC_RADIUS, HUB_RADIUS, SLICE_STROKE, VIEW_HALF } from './HudPie.constants';
import { buildSlices, sliceStateAt } from './behavior/slice-geometry';
import type { HudPieProps } from './HudPie.type';
import './HudPie.css';

const VIEW_BOX = `${-VIEW_HALF} ${-VIEW_HALF} ${VIEW_HALF * 2} ${VIEW_HALF * 2}`;

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
