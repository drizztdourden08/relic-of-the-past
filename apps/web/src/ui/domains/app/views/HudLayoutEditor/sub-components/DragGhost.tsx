/* @layer renderer-components @kind component */
/**
 * The card that follows the cursor while an OUTLINE drag is live. Three lines,
 * in a fixed order. §44 mounted it on the stage too; §46 took the stage's whole
 * drop surface out, so this is the outline's card and no other's.
 *
 * WHAT IT SAYS IS `behavior/drop-ghost.ts`'s, NOT THIS FILE'S. Every sentence on
 * the card is a pure function of the document and one `DropIntent`, which is
 * what lets the wording be tested without a DOM and what lets the outline's
 * `aria-live` region read the same words. This component is the drawing.
 *
 * IT TRACKS THE CURSOR ITSELF instead of being handed a point every frame. The
 * gesture already suppresses a re-render when two frames resolve to the same
 * drop (`useDragGesture`'s `same`); threading the pointer through that would
 * defeat it, and the card has to move on every frame even when the answer has
 * not changed. One listener, alive only while the card is.
 *
 * IT RENDERS THROUGH `Portal`, so it is clipped by neither the stage's
 * `overflow: hidden` nor a rail's scroller, and at the `tooltip` layer, because
 * a picker left open under a live drag must not draw over the thing the hand is
 * doing.
 *
 * IT DOES NOT ANIMATE. A ghost with an easing curve on it reads as latency.
 */
import { useEffect, useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { Portal } from '@ds/primitives/Portal';
import { Text } from '@ds/primitives/Text';
import { ghostPosition } from '../behavior/drop-ghost';
import './HudLayoutEditor.drag.css';
import type { CSSProperties } from 'react';
import type { GhostModel } from '../behavior/drop-ghost';

interface DragGhostProps {
  /** Null while nothing is being dragged. The card is not rendered at all then. */
  model: GhostModel | null;
}

/** The card itself, separated from the portal and the cursor tracking so that
 *  the drawing can be measured on its own, because `createPortal` cannot be server
 *  rendered, and the headless-Chromium harness needs real markup and real CSS
 *  instead of a description of them. */
interface GhostCardProps { model: GhostModel; style?: CSSProperties }

const TONE_CLASS: Readonly<Record<GhostModel['tone'], string>> = {
  move: '',
  refused: ' is-refused',
};

const GhostCard = (props: GhostCardProps) => {
  const { model, style } = props;
  return (
    <Box className={`hud-ghost${TONE_CLASS[model.tone]}`} style={style} aria-hidden>
      <Box className="hud-ghost__l1">
        <Text className="hud-ghost__chip">{model.chip}</Text>
        <Text className="hud-ghost__kind">{model.kind}</Text>
      </Box>
      <Text className="hud-ghost__l2">{model.position}</Text>
      <Text className={`hud-ghost__l3${model.warn ? ' is-warn' : ''}`}>{model.path}</Text>
    </Box>
  );
};

const DragGhost = (props: DragGhostProps) => {
  const { model } = props;
  const active = model !== null;
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!active) { setAt(null); return undefined; }
    const onMove = (event: PointerEvent): void => setAt({ x: event.clientX, y: event.clientY });
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [active]);

  // The first frame after the slop threshold has no point yet: the listener is
  // attached by the effect that the same render scheduled. One invisible frame
  // in the middle of a gesture that produces dozens.
  if (!model || !at) return null;
  const place = ghostPosition(at, { w: window.innerWidth, h: window.innerHeight });

  return (
    <Portal layer="tooltip">
      <GhostCard model={model} style={place} />
    </Portal>
  );
};

export { DragGhost, GhostCard };
export type { DragGhostProps, GhostCardProps };
