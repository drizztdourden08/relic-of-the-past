/* @layer renderer-hud @kind data */
/**
 * PauseProgressPanel — displays pendants OR crystals depending on game progress.
 *
 * Game layout: tiles (21,11)→(30,19) = 10×9 tiles
 * - Pendants: 3 icons (green top-center, blue bottom-left, red bottom-right)
 * - Crystals: 7 icons in a diamond pattern
 *
 * link_which_pendants bits: 0=Power(red), 1=Wisdom(blue), 2=Courage(green)
 * link_has_crystals bits: 0-6 for each crystal
 */
import { HudBox } from '../../primitives/HudBox';
import { PauseBorderBox } from '../../primitives/PauseBorderBox';
import { PauseLabel } from '../../primitives/PauseLabel';
import { PausePendantIcon } from '../../composites/PausePendantIcon';
import { PauseCrystalIcon } from '../../composites/PauseCrystalIcon';

interface PauseProgressPanelProps {
  pendants: number;
  crystals: number;
  showCrystals: boolean;
  scale: number;
  spritesBase: string;
  style?: React.CSSProperties;
}

const PauseProgressPanel = ({ pendants, crystals, showCrystals, scale, spritesBase, style }: PauseProgressPanelProps) => {
  const tile = 8 * scale;
  // Box: 8 inner cols × 7 inner rows (+ 2 border = 10×9)
  const innerCols = 8;
  const innerRows = 7;

  if (showCrystals) {
    // Crystal layout: 7 crystals in specific positions
    // Row 1 (y=2): positions 2,4 (2 crystals)
    // Row 2 (y=4): positions 0,2,4,6 (4 crystals) — but game uses diamond
    // Actual game: row0: c2,c4 | row1: c0,c2,c4,c6 | adjusted to fit
    const crystalPositions = [
      { x: 2, y: 1 }, { x: 4, y: 1 },    // top row
      { x: 0, y: 3 }, { x: 2, y: 3 }, { x: 4, y: 3 }, { x: 6, y: 3 }, // middle row
      { x: 3, y: 5 },                       // bottom
    ];

    return (
      <PauseBorderBox color="yellow" cols={innerCols} rows={innerRows} scale={scale} spritesBase={spritesBase} style={style}>
        {/* CRYSTALS label */}
        <PauseLabel name="crystals" tiles={5} scale={scale} spritesBase={spritesBase} />

        {/* Crystal icons */}
        {crystalPositions.map((pos, idx) => (
          <HudBox key={idx} style={{
            position: 'absolute',
            left: pos.x * tile,
            top: (pos.y + 1) * tile,
          }}>
            <PauseCrystalIcon
              filled={!!(crystals & (1 << idx))}
              scale={scale}
              spritesBase={spritesBase}
            />
          </HudBox>
        ))}
      </PauseBorderBox>
    );
  }

  // Pendant layout: green (top center), blue (bottom left), red (bottom right)
  return (
    <PauseBorderBox color="yellow" cols={innerCols} rows={innerRows} scale={scale} spritesBase={spritesBase} style={style}>
      {/* PENDANTS label */}
      <PauseLabel name="pendants" tiles={5} scale={scale} spritesBase={spritesBase} />

      {/* Green/Courage pendant — top center (bit 2) */}
      <HudBox style={{ position: 'absolute', left: 3 * tile, top: 2 * tile }}>
        <PausePendantIcon
          variant={(pendants & 4) ? 'green' : 'empty'}
          scale={scale}
          spritesBase={spritesBase}
        />
      </HudBox>

      {/* Blue/Wisdom pendant — bottom left (bit 1) */}
      <HudBox style={{ position: 'absolute', left: 1 * tile, top: 5 * tile }}>
        <PausePendantIcon
          variant={(pendants & 2) ? 'blue' : 'empty'}
          scale={scale}
          spritesBase={spritesBase}
        />
      </HudBox>

      {/* Red/Power pendant — bottom right (bit 0) */}
      <HudBox style={{ position: 'absolute', left: 5 * tile, top: 5 * tile }}>
        <PausePendantIcon
          variant={(pendants & 1) ? 'red' : 'empty'}
          scale={scale}
          spritesBase={spritesBase}
        />
      </HudBox>
    </PauseBorderBox>
  );
};

export { PauseProgressPanel };
export type { PauseProgressPanelProps };
