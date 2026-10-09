/* @layer renderer-widgets @kind component */
import { useCallback, useRef, useState } from 'react';
import { Box, Button, Text } from '@drizztdourden08/tessera/primitives';
import { useCapacityLadder } from '../../../behavior/useCapacityLadder';
import { useInPlay } from '../../../behavior/useInPlay';
import { usePointerHintTarget } from '../../../behavior/usePointerHintTarget';
import { useWheel } from '../../../behavior/useWheel';
import { IN_PLAY_REASON } from '../../../CheatsWidget.constants';
import {
  LEVEL_GAP_PX, MAGIC_FRAME_ROWS, MAGIC_INTERIOR_INSET, MAGIC_LEVEL_HINTS, MAGIC_LEVEL_LABELS, SNES_TILE,
} from '../PlayerTab.constants';
import type { MagicLevelBarProps } from '../PlayerTab.type';

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
  const inset = tile * MAGIC_INTERIOR_INSET;
  const gap = LEVEL_GAP_PX * scale;
  const wellH = MAGIC_FRAME_ROWS * tile - 2 * inset;
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
