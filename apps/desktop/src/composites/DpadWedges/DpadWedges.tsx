/* @layer renderer-components @kind component */
import { SvgGroup, SvgPolygon } from '@drizztdourden08/tessera/primitives';
import { DPAD_BOX, DPAD_DIRECTIONS, WEDGE_POINTS } from './DpadWedges.constants';
import type { DpadWedgesProps } from './DpadWedges.type';
import './DpadWedges.css';

const DpadWedges = ({ cx, cy, size, state }: DpadWedgesProps) => (
  <SvgGroup
    className="dpad-wedges"
    transform={`translate(${cx - size / 2} ${cy - size / 2}) scale(${size / DPAD_BOX})`}
  >
    {DPAD_DIRECTIONS.map((direction) => (
      <SvgPolygon
        key={direction}
        className="dpad-wedges__wedge"
        points={WEDGE_POINTS[direction]}
        data-down={state[direction] ? '' : undefined}
      />
    ))}
  </SvgGroup>
);

export { DpadWedges };
