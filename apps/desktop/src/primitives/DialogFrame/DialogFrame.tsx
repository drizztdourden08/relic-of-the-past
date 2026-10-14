/* @layer renderer-hud @kind component */
import type { DialogCornerMark } from '@rotp/game-data';
import { strokeWidthsOf, cornerAtInset, cornerPlacements, framePath, triforcePath } from '@rotp/game-data';
import type { DialogFrameProps } from './DialogFrame.type';

const markShape = (mark: DialogCornerMark, tile: number) => {
  switch (mark) {
    case 'circle': return <circle r={tile * 0.3} />;
    case 'square': return <rect x={-tile * 0.25} y={-tile * 0.25} width={tile * 0.5} height={tile * 0.5} />;
    case 'triforce': return <path d={triforcePath(tile * 0.9)} />;
    case 'none': return null;
  }
};

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
  const outerPath = framePath({ w: width, h: height, inset: outerInset }, corner, cornerAtInset(corner, cornerSize, outerInset));
  const innerPath = framePath({ w: width, h: height, inset: innerInset }, corner, cornerAtInset(corner, cornerSize, innerInset));
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
