/* @layer renderer-hud @kind component */
import { outlineFilter } from '../HudSprite';
import type { PauseBorderBoxProps } from './PauseBorderBox.type';
import './PauseBorderBox.css';

const PauseBorderBox = (props: PauseBorderBoxProps) => {
  const { color, cols, rows, scale, spritesBase, atOrigin = false, className, style, children } = props;
  const classes = ['pause-panel', atOrigin && 'pause-panel--at-origin', className].filter(Boolean).join(' ');
  const T = Math.round(8 * scale);
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

  return (
    <div className={classes} style={{ width: totalW, height: totalH, ...style }}>
      <div style={{ background: 'black', position: 'absolute', inset: bgInset }} />
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
      <div className="pause-panel__border" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', filter: outlineFilter(scale) }}>
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
