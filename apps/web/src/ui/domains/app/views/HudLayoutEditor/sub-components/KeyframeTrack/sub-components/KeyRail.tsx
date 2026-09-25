/* @layer renderer-components @kind component */
/**
 * The track itself: a time ruler, one draggable diamond per keyframe, a
 * playhead, and click-anywhere-to-add. Replaces the 3 px decorative line with
 * two dots that the review photographed under finding 8 as "a timeline that is
 * not one".
 *
 * EVERY DIAMOND IS A BUTTON, so the track is reachable without a pointer:
 * Tab moves between keys, ←/→ nudge the focused key by 0.01 (Shift by 0.1),
 * Enter/Space selects it. A drag-only track is the one affordance a keyboard
 * cannot reach, and §38.2 already refused to ship one for grid tracks.
 *
 * THE POINTER IS CAPTURED ON THE RAIL, not on the diamond. A capture on the
 * diamond stops working the moment the pointer leaves its 11 px box, which on
 * a 200 px track is immediately; capturing the rail means the drag survives
 * the pointer travelling well past either end, and `clampAt` is what keeps the
 * result inside the neighbours.
 */
import { useRef } from 'react';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import { atFromPointer } from '../../../behavior/keyframe-track';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { HudAnimationKeyframe } from '@shared/types/hud';

/** One arrow press, and one with Shift held. */
const NUDGE = 0.01;
const NUDGE_COARSE = 0.1;

interface KeyRailProps {
  keyframes: readonly HudAnimationKeyframe[];
  selected: number;
  onSelect: (index: number) => void;
  onMove: (index: number, at: number) => void;
  /** A click on empty track: add a key there, holding the curve's own value. */
  onAdd: (at: number) => void;
  /** The scrub/play head's position, 0-1 of this animation's cycle, or `null`
   *  when the transport is idle or reduced motion has silenced it. */
  head: number | null;
  /** What the right-hand end of the ruler says: the resolved duration, or the
   *  formula that produces it. */
  endLabel: string;
}

const pct = (at: number): string => `${Math.min(100, Math.max(0, at * 100))}%`;

const KeyRail = (props: KeyRailProps) => {
  const { keyframes, selected, onSelect, onMove, onAdd, head, endLabel } = props;
  const railRef = useRef<HTMLElement>(null);
  const draggingRef = useRef<number | null>(null);

  const atOf = (clientX: number): number => {
    const rect = railRef.current?.getBoundingClientRect();
    return rect ? atFromPointer(clientX, rect) : 0;
  };

  const startDrag = (index: number, event: ReactPointerEvent<HTMLElement>): void => {
    event.stopPropagation();
    draggingRef.current = index;
    onSelect(index);
    railRef.current?.setPointerCapture?.(event.pointerId);
  };

  const drag = (event: ReactPointerEvent<HTMLElement>): void => {
    if (draggingRef.current === null) return;
    onMove(draggingRef.current, atOf(event.clientX));
  };

  const endDrag = (): void => { draggingRef.current = null; };

  const nudge = (index: number, key: string, shift: boolean, stop: () => void): void => {
    const step = shift ? NUDGE_COARSE : NUDGE;
    if (key !== 'ArrowLeft' && key !== 'ArrowRight') return;
    stop();
    onMove(index, keyframes[index].at + (key === 'ArrowLeft' ? -step : step));
  };

  return (
    <Box className="hud-kftrack">
      <Box className="hud-kftrack__ruler">
        <Text className="hud-kftrack__tick">0</Text>
        <Text className="hud-kftrack__tick">{endLabel}</Text>
      </Box>
      <Box
        ref={railRef}
        className="hud-kftrack__rail"
        onPointerDown={(event) => { if (draggingRef.current === null) onAdd(atOf(event.clientX)); }}
        onPointerMove={drag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <Box className="hud-kftrack__line" />
        {head !== null && <Box className="hud-kftrack__head" style={{ left: pct(head) }} />}
        {keyframes.map((keyframe, index) => (
          <Button
            key={index}
            variant="bare"
            className={`hud-kftrack__key${index === selected ? ' is-selected' : ''}`}
            style={{ left: pct(keyframe.at) }}
            aria-label={`Keyframe ${index + 1} at ${keyframe.at}`}
            aria-pressed={index === selected}
            onPointerDown={(event) => startDrag(index, event)}
            onClick={(event) => { event.stopPropagation(); onSelect(index); }}
            onKeyDown={(event) => nudge(index, event.key, event.shiftKey, () => event.preventDefault())}
          />
        ))}
      </Box>
    </Box>
  );
};

export { KeyRail };
export type { KeyRailProps };
