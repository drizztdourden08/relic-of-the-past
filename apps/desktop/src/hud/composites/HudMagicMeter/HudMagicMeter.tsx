type MagicMeterMode = 'original' | 'accurate';

interface HudMagicMeterProps {
  value: number;
  halfMagic: boolean;
  mode: MagicMeterMode;
  scale: number;
  spritesBase: string;
}

const MAGIC_GREEN = '#00d800';
const MAGIC_WHITE = '#f8f8f8';

/**
 * HudMagicMeter — 3 tiles wide × 6 tiles tall (matches SNES tilemap exactly).
 *
 *   Row 0: TL  | Top    | TR
 *   Row 1: Left| fill[0]| Right
 *   Row 2: Left| fill[1]| Right
 *   Row 3: Left| fill[2]| Right
 *   Row 4: Left| fill[3]| Right
 *   Row 5: BL  | Bottom | BR
 *
 * Magic 0-128 → 16 fill levels across 4 interior cells (bottom-up).
 */
const HudMagicMeter = (props: HudMagicMeterProps) => {
  const { value, halfMagic, mode, scale, spritesBase } = props;

  const tile = 8 * scale;
  const frameW = 3 * tile;
  const frameH = 6 * tile;

  const fillLevel = Math.min(Math.max((value + 7) >> 3, 0), 16);

  // Black interior fill: inset 0.8 tiles from each edge of the 3×6 frame
  const inset = tile * 0.8;
  const interiorFill = (
    <div style={{
      position: 'absolute',
      left: inset,
      top: inset,
      width: frameW - inset * 2,
      height: frameH - inset * 2,
      background: 'black',
    }} />
  );

  if (mode === 'original') {
    return (
      <div style={{ width: frameW, height: frameH, position: 'relative', imageRendering: 'pixelated' as const }}>
        {interiorFill}
        <MagicOriginal tile={tile} spritesBase={spritesBase} fillLevel={fillLevel} />
      </div>
    );
  }

  return (
    <div style={{ width: frameW, height: frameH, position: 'relative', imageRendering: 'pixelated' as const }}>
      {interiorFill}
      <MagicAccurate tile={tile} scale={scale} spritesBase={spritesBase} value={value} />
    </div>
  );
};

/** Determine fill sprite for each of the 4 interior rows. Fill grows from bottom (index 3) up. */
function getFillSprites(fillLevel: number): string[] {
  const fills: string[] = ['hud-magic-fill-empty', 'hud-magic-fill-empty', 'hud-magic-fill-empty', 'hud-magic-fill-empty'];

  for (let row = 3; row >= 0; row--) {
    const rowStart = (3 - row) * 4;
    const rowFill = fillLevel - rowStart;

    if (rowFill <= 0) {
      fills[row] = 'hud-magic-fill-empty';
    } else if (rowFill >= 4) {
      fills[row] = 'hud-magic-fill-full';
    } else if (rowFill === 1) {
      fills[row] = 'hud-magic-cap';
    } else if (rowFill === 2) {
      fills[row] = 'hud-magic-fill-quarter';
    } else if (rowFill === 3) {
      fills[row] = 'hud-magic-fill-half';
    }
  }

  return fills;
}

function MagicOriginal(props: { tile: number; spritesBase: string; fillLevel: number }) {
  const { tile, spritesBase, fillLevel } = props;
  const fills = getFillSprites(fillLevel);

  return (
    <>
      {/* Row 0: TL | Top | TR */}
      <img src={`${spritesBase}hud-magic-tl.png`} width={tile} height={tile} draggable={false}
        style={{ position: 'absolute', left: 0, top: 0, imageRendering: 'pixelated' }} />
      <img src={`${spritesBase}hud-magic-top.png`} width={tile} height={tile} draggable={false}
        style={{ position: 'absolute', left: tile, top: 0, imageRendering: 'pixelated' }} />
      <img src={`${spritesBase}hud-magic-tr.png`} width={tile} height={tile} draggable={false}
        style={{ position: 'absolute', left: tile * 2, top: 0, imageRendering: 'pixelated' }} />

      {/* Rows 1-4: Left | Fill | Right */}
      {fills.map((fill, i) => (
        <div key={i} style={{ position: 'absolute', left: 0, top: tile * (i + 1), width: tile * 3, height: tile }}>
          <img src={`${spritesBase}hud-magic-left.png`} width={tile} height={tile} draggable={false}
            style={{ position: 'absolute', left: 0, top: 0, imageRendering: 'pixelated' }} />
          <img src={`${spritesBase}${fill}.png`} width={tile} height={tile} draggable={false}
            style={{ position: 'absolute', left: tile, top: 0, imageRendering: 'pixelated' }} />
          <img src={`${spritesBase}hud-magic-right.png`} width={tile} height={tile} draggable={false}
            style={{ position: 'absolute', left: tile * 2, top: 0, imageRendering: 'pixelated' }} />
        </div>
      ))}

      {/* Row 5: BL | Bottom | BR */}
      <img src={`${spritesBase}hud-magic-bl.png`} width={tile} height={tile} draggable={false}
        style={{ position: 'absolute', left: 0, top: tile * 5, imageRendering: 'pixelated' }} />
      <img src={`${spritesBase}hud-magic-bottom.png`} width={tile} height={tile} draggable={false}
        style={{ position: 'absolute', left: tile, top: tile * 5, imageRendering: 'pixelated' }} />
      <img src={`${spritesBase}hud-magic-br.png`} width={tile} height={tile} draggable={false}
        style={{ position: 'absolute', left: tile * 2, top: tile * 5, imageRendering: 'pixelated' }} />
    </>
  );
}

function MagicAccurate(props: { tile: number; scale: number; spritesBase: string; value: number }) {
  const { tile, scale, spritesBase, value } = props;

  const interiorH = 4 * tile;
  const fillFraction = Math.min(Math.max(value / 128, 0), 1);
  const fillH = fillFraction * interiorH;

  return (
    <>
      {/* Frame */}
      <img src={`${spritesBase}hud-magic-tl.png`} width={tile} height={tile} draggable={false}
        style={{ position: 'absolute', left: 0, top: 0, imageRendering: 'pixelated' }} />
      <img src={`${spritesBase}hud-magic-top.png`} width={tile} height={tile} draggable={false}
        style={{ position: 'absolute', left: tile, top: 0, imageRendering: 'pixelated' }} />
      <img src={`${spritesBase}hud-magic-tr.png`} width={tile} height={tile} draggable={false}
        style={{ position: 'absolute', left: tile * 2, top: 0, imageRendering: 'pixelated' }} />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <img src={`${spritesBase}hud-magic-left.png`} width={tile} height={tile} draggable={false}
            style={{ position: 'absolute', left: 0, top: tile * (i + 1), imageRendering: 'pixelated' }} />
          <img src={`${spritesBase}hud-magic-right.png`} width={tile} height={tile} draggable={false}
            style={{ position: 'absolute', left: tile * 2, top: tile * (i + 1), imageRendering: 'pixelated' }} />
        </div>
      ))}
      <img src={`${spritesBase}hud-magic-bl.png`} width={tile} height={tile} draggable={false}
        style={{ position: 'absolute', left: 0, top: tile * 5, imageRendering: 'pixelated' }} />
      <img src={`${spritesBase}hud-magic-bottom.png`} width={tile} height={tile} draggable={false}
        style={{ position: 'absolute', left: tile, top: tile * 5, imageRendering: 'pixelated' }} />
      <img src={`${spritesBase}hud-magic-br.png`} width={tile} height={tile} draggable={false}
        style={{ position: 'absolute', left: tile * 2, top: tile * 5, imageRendering: 'pixelated' }} />

      {/* CSS fill (1 tile wide × 4 tiles tall interior) */}
      <div style={{
        position: 'absolute',
        left: tile,
        top: tile,
        width: tile,
        height: interiorH,
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: tile,
          height: fillH,
          backgroundColor: MAGIC_GREEN,
        }} />
        {fillFraction > 0 && fillFraction < 1 && (
          <div style={{
            position: 'absolute',
            left: 0,
            bottom: fillH,
            width: tile,
            height: scale,
            backgroundColor: MAGIC_WHITE,
          }} />
        )}
      </div>
    </>
  );
}

export { HudMagicMeter };
export type { MagicMeterMode, HudMagicMeterProps };
