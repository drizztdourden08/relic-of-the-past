/* @layer website-site @kind component */
import { Svg, SvgLine, SvgRect } from '../../../../design';
import { useGradientLayout } from './behavior/useGradientLayout';
import { GRADIENT_VIEW_WIDTH } from './PixelGradientBg.constants';

const PixelGradientBg = () => {
  const layout = useGradientLayout();

  return (
    <Svg
      className="landing-download__bg"
      viewBox={`0 0 ${GRADIENT_VIEW_WIDTH} ${layout.height}`}
      preserveAspectRatio="xMinYMid slice"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {layout.bands.map((band) => (
        <SvgRect key={band.y} x="0" y={band.y} width={GRADIENT_VIEW_WIDTH} height={band.height} fill={band.fill} />
      ))}
      {layout.dither.map((line) => (
        <SvgLine
          key={line.y}
          x1="0"
          y1={line.y}
          x2={GRADIENT_VIEW_WIDTH}
          y2={line.y}
          stroke={line.stroke}
          strokeWidth="1"
          strokeDasharray="1 1"
          strokeDashoffset={line.offset}
        />
      ))}
    </Svg>
  );
};

export { PixelGradientBg };
