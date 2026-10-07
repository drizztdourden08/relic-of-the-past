/* @layer renderer-widgets @kind component */
/**
 * The magic meter, made clickable: HudMagicMeter drawn from the live store, with sixteen
 * transparent rows over its interior. The interior is inset 0.8 tile from each edge of the
 * 3 by 6 tile frame, the same inset the meter uses for its black well. Clicking row r from the
 * top sets level 16 - r, a wheel tick moves one level, a right click opens the step box. The
 * caption under the meter names the level under the pointer, or the held one. The column of
 * steps on its left is the meter's cost level (MagicLevelBar).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { Box, Button, Text } from '@ds/primitives';
import { HudMagicMeter } from '@domains/hud';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { cheatSetMagic } from '@app/lib/game';
import { usePointerHintTarget } from '../../../behavior/usePointerHintTarget';
import { NumberSetter } from '../../../sub-components/NumberSetter';
import { MagicLevelBar } from './MagicLevelBar';
import { MAGIC_HINTS } from '../PlayerTab.constants';

const LEVELS = 16;
const UNITS_PER_LEVEL = 8;
const SNES_TILE = 8;
const FRAME_COLS = 3;
const FRAME_ROWS = 6;
const INTERIOR_INSET = 0.8;
const SETTER_STEPS = [1, 4];

type MagicEditorProps = {
  scale: number;
  spritesBase: string;
};

const percentOf = (level: number): string => `${Math.round((level / LEVELS) * 100)}%`;
const levelOf = (units: number): number => Math.min(LEVELS, Math.max(0, (units + UNITS_PER_LEVEL - 1) >> 3));
const writeLevel = (level: number): void => cheatSetMagic(level * UNITS_PER_LEVEL);

const MagicEditor = ({ scale, spritesBase }: MagicEditorProps) => {
  const magicPower = useGameUIStore((s) => s.hud.magicPower);
  const halfMagic = useGameUIStore((s) => s.hud.halfMagic);
  const [hoverLevel, setHoverLevel] = useState<number | null>(null);
  const [setterAnchor, setSetterAnchor] = useState<HTMLElement | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const hint = usePointerHintTarget('Magic', MAGIC_HINTS);
  const held = levelOf(magicPower);
  const tile = SNES_TILE * scale;
  const inset = tile * INTERIOR_INSET;

  const latest = useRef(held);
  latest.current = held;
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      writeLevel(Math.min(LEVELS, Math.max(0, latest.current + (e.deltaY < 0 ? 1 : -1))));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const openSetter = useCallback((e: MouseEvent) => { e.preventDefault(); setSetterAnchor(e.currentTarget as HTMLElement); }, []);
  const closeSetter = useCallback(() => setSetterAnchor(null), []);

  const rowsStyle = { inset, gridTemplateRows: `repeat(${LEVELS}, 1fr)` };
  const shown = hoverLevel ?? held;

  return (
    <Box className="cheats-player__magic-block">
      <Box className="cheats-player__magic-row-group">
      <MagicLevelBar scale={scale} />
      <Box
        ref={hostRef}
        className="cheats-player__magic"
        style={{ width: FRAME_COLS * tile, height: FRAME_ROWS * tile }}
        onContextMenu={openSetter}
        {...hint}
      >
        <HudMagicMeter value={magicPower} halfMagic={halfMagic} mode="original" scale={scale} spritesBase={spritesBase} />
        <Box className="cheats-player__magic-rows" style={rowsStyle} onMouseLeave={() => setHoverLevel(null)}>
          {Array.from({ length: LEVELS }, (_, row) => {
            const level = LEVELS - row;
            return (
              <Button
                key={level}
                variant="bare"
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
          max={LEVELS}
          steps={SETTER_STEPS}
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
export type { MagicEditorProps };
