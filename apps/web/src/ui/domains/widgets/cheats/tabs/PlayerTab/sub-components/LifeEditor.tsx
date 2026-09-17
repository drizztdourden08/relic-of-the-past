/* @layer renderer-widgets @kind component */
/**
 * The life meter, made clickable: HudLife drawn from the live store, with a grid of twenty
 * transparent cells laid over the hearts on the same tile arithmetic. A cell past the capacity
 * is a dotted ghost, so an unowned container is a visible target.
 */
import { useCallback } from 'react';
import type { MouseEvent } from 'react';
import { Box, Button } from '@ds/primitives';
import { HudLife } from '@domains/hud';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { cheatSetHealth, cheatSetMaxHealth } from '@app/lib/game';
import { usePointerHintTarget } from '../../../behavior/usePointerHintTarget';
import { useInPlay } from '../../../behavior/useInPlay';
import { heartWrite, heartCellTitle, HEART_UNITS } from '../behavior/heart-clicks';
import type { HeartButton } from '../behavior/heart-clicks';
import { LIFE_HINTS } from '../PlayerTab.constants';

const CELLS = 20;
const COLUMNS = 10;
const SNES_TILE = 8;

type LifeEditorProps = {
  scale: number;
  spritesBase: string;
};

const LifeEditor = ({ scale, spritesBase }: LifeEditorProps) => {
  const healthCurrent = useGameUIStore((s) => s.hud.healthCurrent);
  const healthCapacity = useGameUIStore((s) => s.hud.healthCapacity);
  const hint = usePointerHintTarget('Life', LIFE_HINTS);
  const inPlay = useInPlay();
  const tile = SNES_TILE * scale;
  const owned = Math.floor(healthCapacity / HEART_UNITS);

  const handleCell = useCallback((cell: number, button: HeartButton, e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const leftHalf = e.nativeEvent.offsetX < tile / 2;
    const write = heartWrite(cell, leftHalf, button, healthCapacity);
    // A container change redraws the HUD, so outside play only the health inside the owned hearts moves.
    if (write.capacity !== undefined && !inPlay) return;
    if (write.capacity !== undefined) cheatSetMaxHealth(write.capacity);
    if (write.health !== undefined) cheatSetHealth(write.health);
  }, [tile, healthCapacity, inPlay]);

  // The LIFE label row is one tile plus its one-pixel shadow; the hearts start under it.
  const gridStyle = {
    top: tile + scale,
    gridTemplateColumns: `repeat(${COLUMNS}, ${tile}px)`,
    gridAutoRows: `${tile}px`,
  };

  return (
    <Box className="cheats-player__life" data-locked={inPlay ? undefined : ''} style={{ width: COLUMNS * tile }} {...hint}>
      <HudLife
        healthCurrent={healthCurrent}
        healthCapacity={healthCapacity}
        heartMode="smooth"
        scale={scale}
        spritesBase={spritesBase}
      />
      <Box className="cheats-player__heart-grid" style={gridStyle}>
        {Array.from({ length: CELLS }, (_, cell) => (
          <Button
            key={cell}
            variant="bare"
            className={`cheats-player__heart-cell${cell >= owned ? ' cheats-player__heart-cell--ghost' : ''}`}
            aria-label={heartCellTitle(cell, healthCapacity)}
            onClick={(e) => handleCell(cell, 0, e)}
            onContextMenu={(e) => handleCell(cell, 2, e)}
          />
        ))}
      </Box>
    </Box>
  );
};

export { LifeEditor };
export type { LifeEditorProps };
