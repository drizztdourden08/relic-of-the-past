/* @layer renderer-widgets @kind component */
import { useCallback } from 'react';
import type { MouseEvent } from 'react';
import { Box, Pressable } from '@drizztdourden08/tessera/primitives';
import { HudLife } from '@domains/hud';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { cheatSetHealth, cheatSetMaxHealth } from '@app/lib/game';
import { usePointerHintTarget } from '../../../behavior/usePointerHintTarget';
import { useInPlay } from '../../../behavior/useInPlay';
import { heartCellTitle, heartWrite } from '../behavior/heart-clicks';
import { HEART_CELLS, HEART_COLUMNS, HEART_UNITS, LIFE_HINTS, SNES_TILE } from '../PlayerTab.constants';
import type { HeartButton, HudPieceProps } from '../PlayerTab.type';

const LifeEditor = ({ scale, spritesBase }: HudPieceProps) => {
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
    const containersChange = write.capacity !== undefined;
    if (containersChange && !inPlay) return;
    if (write.capacity !== undefined) cheatSetMaxHealth(write.capacity);
    if (write.health !== undefined) cheatSetHealth(write.health);
  }, [tile, healthCapacity, inPlay]);

  const labelRowHeight = tile + scale;
  const gridStyle = {
    top: labelRowHeight,
    gridTemplateColumns: `repeat(${HEART_COLUMNS}, ${tile}px)`,
    gridAutoRows: `${tile}px`,
  };

  return (
    <Box className="cheats-player__life" data-locked={inPlay ? undefined : ''} style={{ width: HEART_COLUMNS * tile }} {...hint}>
      <HudLife
        healthCurrent={healthCurrent}
        healthCapacity={healthCapacity}
        heartMode="smooth"
        heartArt="sprite"
        showCaption
        scale={scale}
        spritesBase={spritesBase}
      />
      <Box className="cheats-player__heart-grid" style={gridStyle}>
        {Array.from({ length: HEART_CELLS }, (_, cell) => (
          <Pressable
            key={cell}
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
