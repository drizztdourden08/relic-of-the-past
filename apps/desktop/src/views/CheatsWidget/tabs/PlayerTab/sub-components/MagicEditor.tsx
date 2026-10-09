/* @layer renderer-widgets @kind component */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { Box, Pressable, Text } from '@drizztdourden08/tessera/primitives';
import { HudMagicMeter } from '@app/hud';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { cheatSetMagic } from '@app/game';
import { usePointerHintTarget } from '../../../behavior/usePointerHintTarget';
import { NumberSetter } from '../../../sub-components/NumberSetter';
import { MagicLevelBar } from './MagicLevelBar';
import {
  MAGIC_FRAME_COLS, MAGIC_FRAME_ROWS, MAGIC_HINTS, MAGIC_INTERIOR_INSET, MAGIC_LEVELS, MAGIC_SETTER_STEPS, MAGIC_UNITS_PER_LEVEL, SNES_TILE,
} from '../PlayerTab.constants';
import type { HudPieceProps } from '../PlayerTab.type';

const percentOf = (level: number): string => `${Math.round((level / MAGIC_LEVELS) * 100)}%`;
const levelOf = (units: number): number => Math.min(MAGIC_LEVELS, Math.max(0, (units + MAGIC_UNITS_PER_LEVEL - 1) >> 3));
const writeLevel = (level: number): void => cheatSetMagic(level * MAGIC_UNITS_PER_LEVEL);

const MagicEditor = ({ scale, spritesBase }: HudPieceProps) => {
  const magicPower = useGameUIStore((s) => s.hud.magicPower);
  const halfMagic = useGameUIStore((s) => s.hud.halfMagic);
  const [hoverLevel, setHoverLevel] = useState<number | null>(null);
  const [setterAnchor, setSetterAnchor] = useState<HTMLElement | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const hint = usePointerHintTarget('Magic', MAGIC_HINTS);
  const held = levelOf(magicPower);
  const tile = SNES_TILE * scale;
  const inset = tile * MAGIC_INTERIOR_INSET;

  const latest = useRef(held);
  latest.current = held;
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      writeLevel(Math.min(MAGIC_LEVELS, Math.max(0, latest.current + (e.deltaY < 0 ? 1 : -1))));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const openSetter = useCallback((e: MouseEvent) => { e.preventDefault(); setSetterAnchor(e.currentTarget as HTMLElement); }, []);
  const closeSetter = useCallback(() => setSetterAnchor(null), []);

  const rowsStyle = { inset, gridTemplateRows: `repeat(${MAGIC_LEVELS}, 1fr)` };
  const shown = hoverLevel ?? held;

  return (
    <Box className="cheats-player__magic-block">
      <Box className="cheats-player__magic-row-group">
      <MagicLevelBar scale={scale} />
      <Box
        ref={hostRef}
        className="cheats-player__magic"
        style={{ width: MAGIC_FRAME_COLS * tile, height: MAGIC_FRAME_ROWS * tile }}
        onContextMenu={openSetter}
        {...hint}
      >
        <HudMagicMeter value={magicPower} halfMagic={halfMagic} mode="original" scale={scale} spritesBase={spritesBase} />
        <Box className="cheats-player__magic-rows" style={rowsStyle} onMouseLeave={() => setHoverLevel(null)}>
          {Array.from({ length: MAGIC_LEVELS }, (_, row) => {
            const level = MAGIC_LEVELS - row;
            return (
              <Pressable
                key={level}
                className="cheats-player__magic-row"
                data-held={level <= held ? '' : undefined}
                aria-label={`Magic ${percentOf(level)}`}
                onMouseEnter={() => setHoverLevel(level)}
                onClick={() => writeLevel(level)}
              />
            );
          })}
        </Box>
      </Box>
      </Box>
      <Text className="cheats-player__caption" data-preview={hoverLevel !== null ? '' : undefined}>
        {percentOf(shown)}
      </Text>
      {setterAnchor && (
        <NumberSetter
          title="Magic"
          value={held}
          min={0}
          max={MAGIC_LEVELS}
          steps={MAGIC_SETTER_STEPS}
          format={percentOf}
          anchor={setterAnchor}
          onCommit={writeLevel}
          onClose={closeSetter}
        />
      )}
    </Box>
  );
};

export { MagicEditor };
