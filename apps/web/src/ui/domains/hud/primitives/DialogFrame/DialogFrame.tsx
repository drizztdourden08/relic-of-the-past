/* @layer renderer-hud @kind component */
/**
 * A drawn message-box border as one SVG: a single line, or a thin line inside a thicker one, with
 * square, rounded or chamfered corners and an optional mark inside each corner. Every size comes
 * from one game tile, so the frame keeps its weight at any window size. The inner line runs
 * parallel to the outer one, corners included. The four marks are mirror images of the top-left
 * one, so one angle turns them all the same way relative to their own corner; at zero every mark
 * stands upright.
 */
import type { DialogBorderThickness, DialogCorner, DialogCornerMark } from '@shared/game/dialog/box-style';
import { strokeWidthsOf } from '@shared/game/dialog/box-style';
import { cornerAtInset, cornerPlacements, framePath, triforcePath } from '@shared/game/dialog/frame-geometry';

interface DialogFrameProps {
  /** CSS pixels. */
  width: number;
  height: number;
  /** One game tile in CSS pixels. */
  tile: number;
  border: 'single' | 'double';
  thickness: DialogBorderThickness;
  color: string;
  corner: DialogCorner;
  mark: DialogCornerMark;
  /** Degrees the top-left mark turns; the others mirror it. */
  markAngle: number;
}

const markShape = (mark: DialogCornerMark, tile: number) => {
  switch (mark) {
    case 'circle': return <circle r={tile * 0.3} />;
    case 'square': return <rect x={-tile * 0.25} y={-tile * 0.25} width={tile * 0.5} height={tile * 0.5} />;
    case 'triforce': return <path d={triforcePath(tile * 0.9)} />;
    default: return null;
  }
};

/** How far a mark's centre sits from the border ring, in tiles; the wider triforce needs a touch more. */
const markDistance = (mark: DialogCornerMark): number => (mark === 'triforce' ? 0.6 : 0.5);

const DialogFrame = (props: DialogFrameProps) => {
  const { width, height, tile, border, thickness, color, corner, mark, markAngle } = props;
  const px = tile / 8;
  const widths = strokeWidthsOf(thickness);
  const outerW = widths.outer * px;
  const innerW = widths.inner * px;
  const gapW = widths.gap * px;
  const cornerSize = corner === 'square' ? 0 : tile;
  const join = corner === 'rounded' ? 'round' : 'miter';
  const outerInset = outerW / 2;
  const innerInset = outerW + gapW + innerW / 2;
  const outerPath = framePath(width, height, outerInset, corner, cornerAtInset(corner, cornerSize, outerInset));
  const innerPath = framePath(width, height, innerInset, corner, cornerAtInset(corner, cornerSize, innerInset));
  const ringW = border === 'double' ? outerW + gapW + innerW : outerW;
  const marks = mark === 'none' ? [] : cornerPlacements(width, height, ringW + tile * markDistance(mark));

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'block' }}>
      <path d={outerPath} fill="none" stroke={color} strokeWidth={outerW} strokeLinejoin={join} />
      {border === 'double' && <path d={innerPath} fill="none" stroke={color} strokeWidth={innerW} strokeLinejoin={join} />}
      {marks.map((place, index) => (
        <g key={index} fill={color} transform={`translate(${place.x} ${place.y}) scale(${place.sx} ${place.sy}) rotate(${markAngle})`}>
          {markShape(mark, tile)}
        </g>
      ))}
    </svg>
  );
};

export { DialogFrame };
export type { DialogFrameProps };
