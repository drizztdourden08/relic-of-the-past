/* @layer renderer-hud @kind component */
/**
 * EnhancedPauseView is the host-owned pause menu: three screens under one
 * chrome, drawn at true SNES scale over the running game.
 *
 * This is the only tier in the feature allowed to touch a store, and it touches
 * four: the pause machine for where the cursor is, the control scheme for what
 * the buttons fire, the layout store for the cluster's shape and glyph pack,
 * and the game-ui store for what the save holds. Everything below it is bare
 * and presentational, which is what lets the same screens be drawn from props
 * alone.
 *
 * The chrome NEVER MOVES. Three screens' content needs about 312 x 264 SNES
 * pixels against the 310 x 160 the menu area actually has, so they take turns:
 * the tabs, the legend and the cluster column stay exactly where they are and
 * only the panel between them changes. The cluster is held on the right with
 * every assignable button drawn, assigned or not, because a player looking for
 * somewhere to put an item has to see the empty buttons, which is the one place
 * this menu deliberately disagrees with the gameplay HUD.
 *
 * Scale comes off the canvas's own height instead of a constant, so the menu
 * stays pixel-aligned with the game underneath it in 240-line mode too.
 *
 * It performs NO writes of its own. A click lands as the same `PauseEvent` a pad
 * press does (focus, then confirm), and the store performs whatever that turns
 * out to mean. The view holding the bridge for a gear tier is what once left a
 * pad player able to move onto a blade and press confirm to no effect at all.
 *
 * THE MENU HAS NO GROUND. The world stays visible between the panels, because the
 * player paused a game, and a menu that paints over it hides the thing they
 * were looking at. Everything that has to stay readable therefore carries its
 * own ground: the panels are opaque, the legend has its plate, and the loose
 * text over the field takes a dark halo (hud.css). The one thing that used to
 * NEED the backdrop (a portrait landing on top of the live character it was a
 * picture of) is gone for a better reason: the portrait IS the live character
 * now, drawn at their own screen position with the game's own sprite
 * suppressed underneath (`PauseHeroLayer`).
 */
import { useMemo } from 'react';
import { hudDataScope } from '@shared/hud/data';
import { AUTO_PACK_ID } from '@shared/input/glyphs';
import { useControlSchemeStore } from '@app/stores/control-scheme-store';
import { useHudLayoutStore } from '@app/stores/hud-layout-store';
import { useHudSettingsStore } from '@app/stores/hud-settings-store';
import { usePauseMenuStore } from '@app/stores/pause-menu-store';
import { HudBox } from '../../primitives/HudBox';
import { HudNodeRenderer } from '../../compounds/HudNodeRenderer';
import { PauseScreenTabs } from '../../composites/PauseScreenTabs';
import { PauseNavLegend } from '../../compounds/PauseNavLegend';
import { useHud } from '../../hooks/useHud';
import { usePauseMenu } from '../../hooks/usePauseMenu';
import { useHudViewport } from '../HudLayoutView/behavior/useHudViewport';
import { usePlacedLayout } from '../HudLayoutView/behavior/usePlacedLayout';
import { useSlotContent } from '../HudLayoutView/behavior/useSlotContent';
import { useVitalsContent } from '../HudLayoutView/behavior/useVitalsContent';
import { useGearModel } from './behavior/useGearModel';
import { useItemModel } from './behavior/useItemModel';
import { useLegendEntries } from './behavior/useLegendEntries';
import { usePauseAssign } from './behavior/usePauseAssign';
import { usePauseCursor } from './behavior/usePauseCursor';
import { useStatusModel } from './behavior/useStatusModel';
import { useVisibleBrowsing } from './behavior/useVisibleBrowsing';
import { PauseHeroLayer } from './sub-components/PauseHeroLayer';
import { PauseScreenHost } from './sub-components/PauseScreenHost';
import {
  CLUSTER_INSET, CLUSTER_TOP, MENU_INSET, SCREEN_TABS, SCREEN_Y, TABS_X, TABS_Y,
} from './EnhancedPauseView.constants';
import type { ItemsSection } from '../../compounds/PauseItemsScreen';
import type { EnhancedPauseViewProps } from './EnhancedPauseView.type';

const EnhancedPauseView = (props: EnhancedPauseViewProps = {}) => {
  const { slideTransform, slideTransition } = props;

  const { containerRef, scale, view } = useHudViewport();
  const state = usePauseMenuStore((s) => s.state);
  const open = usePauseMenuStore((s) => s.open);
  const canConfirm = usePauseMenuStore((s) => s.canConfirm);
  const layout = useHudLayoutStore((s) => s.layout);
  const bindings = useControlSchemeStore((s) => s.bindings);
  const heartMode = useHudSettingsStore((s) => s.heartMode);
  const { data, config } = usePauseMenu(scale);
  const { data: hud } = useHud(scale);
  const packId = layout.glyphPack ?? AUTO_PACK_ID;
  const slots = useSlotContent(packId);
  const { vitals: nodeVitals, hearts, spritesBase: hudSprites } = useVitalsContent(scale);

  // Not `state` directly: `closing` names no screen, and falling back to a
  // default there makes the menu swap to the item grid on its way out.
  const visible = useVisibleBrowsing(state, canConfirm);
  const { screen, section, cursor } = visible;
  const itemsSection: ItemsSection = section === 'bottles' ? 'bottles' : 'items';

  const items = useItemModel(itemsSection, cursor);
  const gear = useGearModel();
  const dungeonItems = useStatusModel();
  const { assign, hintLines } = usePauseAssign(screen, section);
  const move = usePauseCursor();
  const legend = useLegendEntries(bindings, packId, visible.canConfirm);

  // The SAME document the gameplay HUD draws, solved once. The menu takes only
  // the part of it that draws numbered slots and pins that to its own column,
  // wherever the layout itself puts it, so a player who moved their buttons
  // bottom-right still finds them in the same place in here, and there is no
  // second copy of the map's geometry to keep in step.
  const slotCount = Object.keys(slots.slots).length;
  const dataScope = useMemo(() => hudDataScope(nodeVitals, slotCount), [nodeVitals, slotCount]);
  const ctx = useMemo(
    () => ({ hearts, filledSlots: slots.filledSlots, scope: dataScope }),
    [dataScope, hearts, slots.filledSlots],
  );
  const placed = usePlacedLayout(layout, view, ctx);
  const content = useMemo(
    () => ({ vitals: nodeVitals, slots: slots.slots, glyph: slots.glyph }),
    [nodeVitals, slots.glyph, slots.slots],
  );

  const px = (n: number): number => n * scale;
  const spritesBase = config.spritesBase;

  const vitals = {
    healthCurrent: hud.healthCurrent,
    healthCapacity: hud.healthCapacity,
    armor: data.armor,
    magic: hud.magicPower,
    halfMagic: hud.halfMagic,
    heartPieces: data.heartPieces,
    pendants: data.pendants,
    crystals: data.crystals,
  };

  return (
    <HudBox
      ref={containerRef}
      className="enhanced-pause"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: open ? 'auto' : 'none',
        transform: slideTransform,
        transition: slideTransition,
      }}
    >
      <PauseHeroLayer
        active={open}
        scale={scale}
        counterTransform={open || !slideTransform ? 'translateY(0)' : `translateY(${view.h * scale}px)`}
        transition={slideTransition ?? 'none'}
      />

      {open && (
        <>
          <HudBox
            className="enhanced-pause__plate"
            style={{ position: 'absolute', left: px(TABS_X), top: px(TABS_Y) }}
          >
            <PauseScreenTabs
              tabs={SCREEN_TABS}
              active={screen}
              scale={scale}
              spritesBase={spritesBase}
              onSelect={move.selectScreen}
            />
          </HudBox>

          <HudBox
            className="enhanced-pause__screen"
            style={{ position: 'absolute', left: px(MENU_INSET), top: px(SCREEN_Y) }}
          >
            <PauseScreenHost
              screen={screen}
              section={section}
              cursor={cursor}
              items={items}
              gear={gear}
              dungeonItems={dungeonItems}
              vitals={vitals}
              heartMode={heartMode}
              hintLines={hintLines}
              scale={scale}
              spritesBase={spritesBase}
              onFocus={move.focus}
              onConfirm={move.confirm}
            />
          </HudBox>

          {placed.bounds && (
            <HudBox
              style={{
                position: 'absolute',
                right: px(CLUSTER_INSET),
                top: px(CLUSTER_TOP),
                width: px(placed.bounds.w),
                height: px(placed.bounds.h),
              }}
            >
              <HudNodeRenderer
                nodes={placed.buttons}
                scale={scale}
                content={content}
                spritesBase={hudSprites}
                origin={placed.bounds}
                onSlotPress={assign}
                dataScope={dataScope}
              />
            </HudBox>
          )}

          <HudBox style={{ position: 'absolute', left: 0, bottom: 0 }}>
            <PauseNavLegend entries={legend} width={view.w} scale={scale} spritesBase={spritesBase} />
          </HudBox>
        </>
      )}
    </HudBox>
  );
};

export { EnhancedPauseView };
