/* @layer renderer-hud @kind component */
/**
 * HudLayoutView is the app-drawn HUD: a document of nested containers, solved
 * against the display it is actually on and drawn.
 *
 * The only tier here allowed to touch a store, and it touches three: the layout
 * store for the document, the control-scheme store for what each numbered slot
 * fires, and the game-ui store for what the save holds. Everything below this
 * file is bare and presentational, which is why the whole HUD can be previewed
 * in the layout editor without a game running.
 *
 * There are no five fixed elements any more, and nothing here knows the name of
 * one. The layout is a tree; `usePlacedLayout` turns it into rectangles in SNES
 * pixels against the real view, and `HudNodeRenderer` draws them at the display
 * scale. A layout therefore survives a resize, a change of aspect ratio and
 * 240-line mode without being re-authored, and it reflows: a save with three
 * heart containers closes the gap under them instead of leaving the hole the
 * flat model reserved.
 *
 * THE BUTTON MAP IS THE ONE PART THAT COMES AND GOES. The pause menu pins its
 * own copy to the right column, so this one stands down while the menu is up
 * instead of drawing the same buttons twice; and the layout's own reveal rule
 * can hold it off screen until something about it changes. The rest of the
 * document is drawn unconditionally, because vitals and wallet are meant to stay
 * readable with the menu open.
 */
import { useMemo } from 'react';
import { hudDataScope } from '@shared/hud/data';
import { AUTO_PACK_ID } from '@shared/input/glyphs';
import { HudBox } from '../../primitives/HudBox';
import { HudNodeRenderer } from '../../compounds/HudNodeRenderer';
import { useHudLayoutStore } from '@app/stores/hud-layout-store';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { useClusterVisibility } from './behavior/useClusterVisibility';
import { useCountdownContent } from './behavior/useCountdownContent';
import { useHudViewport } from './behavior/useHudViewport';
import { usePlacedLayout } from './behavior/usePlacedLayout';
import { useSlotContent } from './behavior/useSlotContent';
import { useVitalsContent } from './behavior/useVitalsContent';
import type { HudLayoutViewProps } from './HudLayoutView.type';

const CLUSTER_FADE = 'opacity 250ms ease-out';

const HudLayoutView = (props: HudLayoutViewProps = {}) => {
  const { showAllChips = false, slideTransform, slideTransition } = props;

  const layout = useHudLayoutStore((s) => s.layout);
  // Asked of the core's own view of the menu, not of the pause store. This view
  // never reads that one, and the two facts together (the hold is in force AND the
  // native menu module is running) are exactly what "the menu is on screen" means.
  const menuHolding = useGameUIStore((s) => s.hostMenu.holding && s.mode === 'paused_menu');
  const { containerRef, scale, view } = useHudViewport();

  const slots = useSlotContent(layout.glyphPack ?? AUTO_PACK_ID);
  const { vitals, hearts, spritesBase } = useVitalsContent(scale);
  const visible = useClusterVisibility(layout.inGameplay, slots.signature, showAllChips);
  const countdown = useCountdownContent();

  // The flat data surface every bound `Value`/`repeat`/`switch` in the
  // document reads from (`shared/hud/data/variables.ts`). Built from the
  // SAME vitals object the content below hands the renderer, so the two can
  // never disagree about what the save holds.
  const slotCount = Object.keys(slots.slots).length;
  const dataScope = useMemo(
    () => hudDataScope(vitals, slotCount, countdown.source),
    [vitals, slotCount, countdown.source],
  );
  const ctx = useMemo(
    () => ({ hearts, filledSlots: slots.filledSlots, scope: dataScope }),
    [dataScope, hearts, slots.filledSlots],
  );
  const placed = usePlacedLayout(layout, view, ctx);
  const content = useMemo(
    () => ({ vitals, slots: slots.slots, glyph: slots.glyph, countdown: countdown.countdown }),
    [countdown.countdown, slots.glyph, slots.slots, vitals],
  );

  return (
    <HudBox
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        transform: slideTransform,
        transition: slideTransition,
      }}
    >
      <HudNodeRenderer nodes={placed.rest} scale={scale} content={content} spritesBase={spritesBase} dataScope={dataScope} />

      {!menuHolding && (
        <HudBox style={{ position: 'absolute', inset: 0, opacity: visible ? 1 : 0, transition: CLUSTER_FADE }}>
          <HudNodeRenderer nodes={placed.buttons} scale={scale} content={content} spritesBase={spritesBase} dataScope={dataScope} />
        </HudBox>
      )}
    </HudBox>
  );
};

export { HudLayoutView };
