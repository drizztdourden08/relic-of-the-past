/* @layer renderer-components @kind component */
import { SvgGroup, SvgPath } from '@drizztdourden08/tessera/primitives';
import { CROSS_GLYPH, DPAD_DIRECTIONS } from './DpadCross.constants';
import type { DpadCrossProps } from './DpadCross.type';
import './DpadCross.css';

const DpadCross = ({ cx, cy, size, state }: DpadCrossProps) => {
  const { body, arms, min, span } = CROSS_GLYPH;
  const place = `translate(${cx - size / 2} ${cy - size / 2}) scale(${size / span}) translate(${-min} ${-min})`;
  return (
    <SvgGroup className="dpad-cross" transform={place}>
      <SvgPath className="dpad-cross__body" d={body} />
      {DPAD_DIRECTIONS.filter((direction) => state[direction]).map((direction) => (
        <SvgPath key={direction} className="dpad-cross__arm" d={arms[direction]} />
      ))}
    </SvgGroup>
  );
};

export { DpadCross };
