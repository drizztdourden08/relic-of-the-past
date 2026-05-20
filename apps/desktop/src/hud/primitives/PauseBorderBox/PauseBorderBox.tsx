/**
 * PauseBorderBox — renders a bordered box using corner + edge tiles.
 * The game uses 3 tiles per color (corner, h-edge, v-edge) and flips them
 * to create the full frame via Hud_DrawBox.
 *
 * Props:
 *   color - border color name matching sprite filenames
 *   cols  - inner width in tiles (total width = cols + 2)
 *   rows  - inner height in tiles (total height = rows + 2)
 */

interface PauseBorderBoxProps {
  color: 'green' | 'blue' | 'gray' | 'yellow' | 'red';
  cols: number;
  rows: number;
  scale: number;
  spritesBase: string;
  children?: React.ReactNode;
}

const PauseBorderBox = (props: PauseBorderBoxProps) => {
  const { color, cols, rows, scale, spritesBase, children } = props;
  const tile = 8 * scale;
  const totalW = (cols + 2) * tile;
  const totalH = (rows + 2) * tile;

  const corner = `${spritesBase}pause-border-corner-${color}.png`;
  const hedge = `${spritesBase}pause-border-hedge-${color}.png`;
  const vedge = `${spritesBase}pause-border-vedge-${color}.png`;

  const imgStyle: React.CSSProperties = {
    imageRendering: 'pixelated',
    display: 'block',
    width: tile,
    height: tile,
  };

  // Build edge arrays
  const topEdges: React.ReactNode[] = [];
  const bottomEdges: React.ReactNode[] = [];
  const leftEdges: React.ReactNode[] = [];
  const rightEdges: React.ReactNode[] = [];

  for (let i = 0; i < cols; i++) {
    topEdges.push(
      <img key={`t${i}`} src={hedge} width={tile} height={tile} draggable={false}
        style={{ ...imgStyle, gridColumn: i + 2, gridRow: 1 }} />,
    );
    bottomEdges.push(
      <img key={`b${i}`} src={hedge} width={tile} height={tile} draggable={false}
        style={{ ...imgStyle, gridColumn: i + 2, gridRow: rows + 2, transform: 'scaleY(-1)' }} />,
    );
  }

  for (let i = 0; i < rows; i++) {
    leftEdges.push(
      <img key={`l${i}`} src={vedge} width={tile} height={tile} draggable={false}
        style={{ ...imgStyle, gridColumn: 1, gridRow: i + 2 }} />,
    );
    rightEdges.push(
      <img key={`r${i}`} src={vedge} width={tile} height={tile} draggable={false}
        style={{ ...imgStyle, gridColumn: cols + 2, gridRow: i + 2, transform: 'scaleX(-1)' }} />,
    );
  }

  return (
    <div style={{ position: 'relative', width: totalW, height: totalH }}>
      {/* Black fill — full area, sits behind border sprites */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'black',
      }} />

      {/* Border container — all sprites in a single CSS grid layer */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: `repeat(${cols + 2}, ${tile}px)`,
        gridTemplateRows: `repeat(${rows + 2}, ${tile}px)`,
        pointerEvents: 'none',
      }}>
        {/* Corners */}
        <img src={corner} width={tile} height={tile} draggable={false}
          style={{ ...imgStyle, gridColumn: 1, gridRow: 1 }} />
        <img src={corner} width={tile} height={tile} draggable={false}
          style={{ ...imgStyle, gridColumn: cols + 2, gridRow: 1, transform: 'scaleX(-1)' }} />
        <img src={corner} width={tile} height={tile} draggable={false}
          style={{ ...imgStyle, gridColumn: 1, gridRow: rows + 2, transform: 'scaleY(-1)' }} />
        <img src={corner} width={tile} height={tile} draggable={false}
          style={{ ...imgStyle, gridColumn: cols + 2, gridRow: rows + 2, transform: 'scale(-1, -1)' }} />

        {/* Edges */}
        {topEdges}
        {bottomEdges}
        {leftEdges}
        {rightEdges}
      </div>

      {/* Content area — flex column so children can use margin-top: auto */}
      <div style={{
        position: 'absolute',
        left: tile,
        top: tile,
        width: cols * tile,
        height: rows * tile,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {children}
      </div>
    </div>
  );
};

export { PauseBorderBox };
export type { PauseBorderBoxProps };
