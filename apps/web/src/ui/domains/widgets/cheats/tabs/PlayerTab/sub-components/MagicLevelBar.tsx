/* @layer renderer-widgets @kind component */
/**
 * The meter's level as a column of steps beside the meter, read like the hearts: one rectangle
 * per level the file can stand on, filled from the bottom up to the level it holds, each named
 * on its left. A vanilla file has two (full cost, the bat's half cost); a seed has exactly the
 * levels its upgrades reach, its empty level included when it starts there. The column spans
 * the meter's inner well, so the steps line up with the fill beside them. A click lands on a
 * step, the wheel moves one step either way. A level redraws the HUD, so the column is locked
 * outside play.
 */
import { useCallback, useRef, useState } from 'react';
import { Box, Button, Text } from '@ds/primitives';
import { useCapacityLadder } from '../../../behavior/useCapacityLadder';
import { IN_PLAY_REASON, useInPlay } from '../../../behavior/useInPlay';
import { usePointerHintTarget } from '../../../behavior/usePointerHintTarget';
import { useWheel } from '../../../behavior/useWheel';
import { MAGIC_LEVEL_HINTS, MAGIC_LEVEL_LABELS } from '../PlayerTab.constants';

const SNES_TILE = 8;
const FRAME_ROWS = 6;
/** The meter's black well starts this far inside its frame, in tiles (HudMagicMeter). */
const INTERIOR_INSET = 0.8;
/** Game pixels between two steps. */
const GAP_PX = 1;

type MagicLevelBarProps = {
  scale: number;
};

const labelOfCap = (cap: number): string => MAGIC_LEVEL_LABELS[cap] ?? `Level ${cap}`;

const MagicLevelBar = ({ scale }: MagicLevelBarProps) => {
  const { ladder, rung, set, settable } = useCapacityLadder('magic');
  const inPlay = useInPlay();
  const [hovered, setHovered] = useState<number | null>(null);
  const live = settable && inPlay;
  const held = ladder.findIndex((r) => r.rung === rung);
  const heldLabel = held >= 0 ? labelOfCap(ladder[held].cap) : '';
  const hint = usePointerHintTarget(`Magic level: ${heldLabel}`, MAGIC_LEVEL_HINTS);

  const latest = useRef({ ladder, held, set, live });
  latest.current = { ladder, held, set, live };

  const stepTo = useCallback((index: number) => {
    const { ladder: list, held: at, set: put, live: on } = latest.current;
    if (!on || index < 0 || index >= list.length || index === at) return;
    put(list[index].rung);
  }, []);

  const wheelRef = useWheel<HTMLDivElement>((dir) => stepTo(latest.current.held + dir));

  if (ladder.length === 0) return null;

  const tile = SNES_TILE * scale;
  const inset = tile * INTERIOR_INSET;
  const gap = GAP_PX * scale;
  const wellH = FRAME_ROWS * tile - 2 * inset;
  const stepH = (wellH - gap * (ladder.length - 1)) / ladder.length;
  const title = !settable ? 'Magic level: fixed on this file' : inPlay ? undefined : `Magic level: ${IN_PLAY_REASON}`;

  return (
    <Box
      ref={wheelRef}
      className="cheats-player__levels"
      data-locked={live ? undefined : ''}
      style={{ height: wellH, marginTop: inset, gap, marginRight: gap * 2 }}
      title={title}
      onMouseEnter={hint.onMouseEnter}
      onMouseMove={hint.onMouseMove}
      onMouseLeave={() => { setHovered(null); hint.onMouseLeave(); }}
    >
      {ladder.map((step, index) => (
        <Button
          key={step.rung}
          variant="bare"
          className="cheats-player__level"
          data-filled={index <= held ? '' : undefined}
          data-held={index === held ? '' : undefined}
          data-preview={hovered !== null && index <= hovered ? '' : undefined}
          style={{ height: stepH, order: ladder.length - index }}
          disabled={!live}
          aria-label={`Magic level ${labelOfCap(step.cap)}`}
          aria-pressed={index === held}
          onMouseEnter={() => setHovered(index)}
          onClick={() => stepTo(index)}
        >
          <Text className="cheats-player__level-label">{labelOfCap(step.cap)}</Text>
          <Box as="span" className="cheats-player__level-step" style={{ width: tile }} />
        </Button>
      ))}
    </Box>
  );
};

export { MagicLevelBar };
export type { MagicLevelBarProps };
