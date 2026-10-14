/* @layer renderer-hud @kind component */
import { HudBox } from '../../primitives/HudBox';
import { PauseBorderBox } from '../../primitives/PauseBorderBox';
import { PauseLabel } from '../../primitives/PauseLabel';
import { PausePendantIcon } from '../../composites/PausePendantIcon';
import { PauseCrystalIcon } from '../../composites/PauseCrystalIcon';
import type { PauseProgressPanelProps } from './PauseProgressPanel.type';

const PauseProgressPanel = ({ pendants, crystals, showCrystals, scale, spritesBase, className }: PauseProgressPanelProps) => {
  const tile = 8 * scale;
  const innerCols = 8;
  const innerRows = 7;

  if (showCrystals) {
    const crystalPositions = [
      { x: 2, y: 2 }, { x: 4, y: 2 },
      { x: 1, y: 4 }, { x: 3, y: 4 }, { x: 5, y: 4 },
      { x: 2, y: 6 }, { x: 4, y: 6 },
    ];

    return (
      <PauseBorderBox color="yellow" cols={innerCols} rows={innerRows} scale={scale} spritesBase={spritesBase} className={className}>
        <PauseLabel name="crystals" tiles={5} scale={scale} spritesBase={spritesBase} />

        {crystalPositions.map((pos, idx) => (
          <HudBox key={idx} style={{
            position: 'absolute',
            left: pos.x * tile,
            top: pos.y * tile,
          }}>
            <PauseCrystalIcon
              filled={Boolean(crystals & (1 << idx))}
              scale={scale}
              spritesBase={spritesBase}
            />
          </HudBox>
        ))}
      </PauseBorderBox>
    );
  }

  return (
    <PauseBorderBox color="yellow" cols={innerCols} rows={innerRows} scale={scale} spritesBase={spritesBase} className={className}>
      <PauseLabel name="pendants" tiles={5} scale={scale} spritesBase={spritesBase} />

      <HudBox style={{ position: 'absolute', left: 3 * tile, top: 2 * tile }}>
        <PausePendantIcon
          variant={(pendants & 4) ? 'green' : 'empty'}
          scale={scale}
          spritesBase={spritesBase}
        />
      </HudBox>

      <HudBox style={{ position: 'absolute', left: tile, top: 5 * tile }}>
        <PausePendantIcon
          variant={(pendants & 2) ? 'blue' : 'empty'}
          scale={scale}
          spritesBase={spritesBase}
        />
      </HudBox>

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
