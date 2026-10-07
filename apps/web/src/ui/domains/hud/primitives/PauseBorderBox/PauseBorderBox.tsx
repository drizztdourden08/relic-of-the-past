/* @layer renderer-hud @kind data */
/**
 * Bordered box from 8 tiled DOM elements: 4 corner images + 4 edge divs with
 * background-repeat. All dimensions are integer pixels so the tiles meet.
 * `cols`/`rows` are the inner size in tiles; total size is +2 each way.
 */

interface PauseBorderBoxProps {
  color: 'green' | 'blue' | 'gray' | 'yellow' | 'red';
  cols: number;
  rows: number;
  scale: number;
  spritesBase: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const PauseBorderBox = (props: PauseBorderBoxProps) => {
  const { color, cols, rows, scale, spritesBase, style, children } = props;
  const T = Math.round(8 * scale); // tile size in integer px
  const totalW = (cols + 2) * T;
  const totalH = (rows + 2) * T;

  const corner = `${spritesBase}pause-border-corner-${color}.png`;
  const hedge = `${spritesBase}pause-border-hedge-${color}.png`;
  const vedge = `${spritesBase}pause-border-vedge-${color}.png`;

  const cornerStyle: React.CSSProperties = {
    position: 'absolute',
    width: T,
    height: T,
    imageRendering: 'pixelated',
  };

  const edgeStyle: React.CSSProperties = {
    position: 'absolute',
    imageRendering: 'pixelated',
    backgroundSize: `${T}px ${T}px`,
  };

  const bgInset = Math.round(T * 7 / 16);

  // SVG outline filter copied from HudSprite, a cross-shaped black outline via feMorphology
  const s = scale;
  const outlineSvg = [
    `<svg xmlns='http://www.w3.org/2000/svg'>`,
    `<filter id='o' x='-10%' y='-10%' width='120%' height='120%' color-interpolation-filters='sRGB'>`,
    `<feMorphology in='SourceAlpha' operator='dilate' radius='${s} 0' result='h'/>`,
    `<feMorphology in='SourceAlpha' operator='dilate' radius='0 ${s}' result='v'/>`,
    `<feMerge result='d'><feMergeNode in='h'/><feMergeNode in='v'/></feMerge>`,
    `<feFlood flood-color='black' result='c'/>`,
    `<feComposite in='c' in2='d' operator='in' result='outline'/>`,
    `<feMerge><feMergeNode in='outline'/><feMergeNode in='SourceGraphic'/></feMerge>`,
    `</filter></svg>`,
  ].join('');
  const outlineFilter = `url("data:image/svg+xml,${encodeURIComponent(outlineSvg)}#o")`;

  return (
    <div className="pause-panel" style={{ position: 'relative', width: totalW, height: totalH, ...style }}>
      {/* Black background, inset so it doesn't bleed past the outer border edge */}
      <div style={{ background: 'black', position: 'absolute', inset: bgInset }} />
      {/* Content area */}
      <div className="pause-panel__content" style={{
        position: 'absolute',
        top: T,
        left: T,
        width: cols * T,
        height: rows * T,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {children}
      </div>
      {/* Border tiles on top, with outline filter */}
      <div className="pause-panel__border" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', filter: outlineFilter }}>
        <img src={corner} style={{ ...cornerStyle, top: 0, left: 0 }} />
        <img src={corner} style={{ ...cornerStyle, top: 0, right: 0, transform: 'scaleX(-1)' }} />
        <img src={corner} style={{ ...cornerStyle, bottom: 0, left: 0, transform: 'scaleY(-1)' }} />
        <img src={corner} style={{ ...cornerStyle, bottom: 0, right: 0, transform: 'scale(-1,-1)' }} />
        <div style={{ ...edgeStyle, top: 0, left: T, width: cols * T, height: T, backgroundImage: `url("${hedge}")`, backgroundRepeat: 'repeat-x' }} />
        <div style={{ ...edgeStyle, bottom: 0, left: T, width: cols * T, height: T, backgroundImage: `url("${hedge}")`, backgroundRepeat: 'repeat-x', transform: 'scaleY(-1)' }} />
        <div style={{ ...edgeStyle, top: T, left: 0, width: T, height: rows * T, backgroundImage: `url("${vedge}")`, backgroundRepeat: 'repeat-y' }} />
        <div style={{ ...edgeStyle, top: T, right: 0, width: T, height: rows * T, backgroundImage: `url("${vedge}")`, backgroundRepeat: 'repeat-y', transform: 'scaleX(-1)' }} />
      </div>
    </div>
  );
};

export { PauseBorderBox };
export type { PauseBorderBoxProps };
