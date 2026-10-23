/* @layer renderer-components @kind component */
import { SvgCircle } from '@drizztdourden08/tessera/primitives';
import { SvgImage } from '@app/primitives/SvgImage';
import type { PlacedPart } from '../PadOverlay.type';

const OverlayGlyph = ({ part }: { part: PlacedPart }) => {
  const { x, y, radius, slot } = part;
  if (slot.glyph === '') return <SvgCircle className="pad-overlay__blank" cx={x} cy={y} r={radius} />;
  return (
    <SvgImage
      className="pad-overlay__glyph"
      href={slot.glyph}
      x={x - radius}
      y={y - radius}
      width={radius * 2}
      height={radius * 2}
      preserveAspectRatio="xMidYMid meet"
    />
  );
};

export { OverlayGlyph };
