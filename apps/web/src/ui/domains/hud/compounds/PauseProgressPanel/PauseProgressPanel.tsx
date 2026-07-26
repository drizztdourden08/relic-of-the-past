/* @layer renderer-hud @kind data */
/**
 * PauseProgressPanel — displays pendants OR crystals depending on game progress.
 *
 * Game layout: tiles (21,11)→(30,19) = 10×9 tiles
 * - Pendants: 3 icons (green top-center, blue bottom-left, red bottom-right)
 * - Crystals: 7 icons in 2-3-2 rows, the middle row offset half a slot
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
    // Crystal slots, in tiles from the inner (inside-border) top-left corner. Each
    // crystal is 2 tiles wide and 1 tall, so the rows sit 2 tiles apart and the
    // middle row of 3 is inset one tile, giving the 2-3-2 arrangement:
    //
    //     . .        cols 2,4
    //    . . .       cols 1,3,5
    //     . .        cols 2,4
    //
    // Index order is the crystal bit order, so slot N shows bit N.
    const crystalPositions = [
      { x: 2, y: 2 }, { x: 4, y: 2 },
      { x: 1, y: 4 }, { x: 3, y: 4 }, { x: 5, y: 4 },
      { x: 2, y: 6 }, { x: 4, y: 6 },
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
            top: pos.y * tile,
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
