/* @layer renderer-components @kind component */
/**
 * Sized to the game canvas, pointer-events: none. Pause menu slide is 483ms linear, matching vanilla.
 *
 * The HUD style picks the pair, and only the pair: Original keeps the sprite HUD
 * and the sprite pause menu exactly as they were; Enhanced and Modern swap in the
 * placed HUD and the host-owned menu. Both pairs take the same slide PROPS from
 * different sources, and that difference is the point:
 *
 *  - **Original** mirrors the native menu, so its slide is read from the native
 *    menu's own state machine, once per frame. Unchanged.
 *  - **Enhanced and Modern** ARE the menu: `kFeatures2_HostMenu` parks the native
 *    machine so the host can draw its own, and the slide follows the host's
 *    pause store. A parked machine's state describes something we deliberately
 *    stopped; letting it place this layer is how the menu ended up "open" while
 *    sitting entirely off the top of a frozen game.
 *
 * The root stays `pointer-events: none` so the canvas keeps the mouse; the
 * host-drawn pause layer re-enables it on itself while the menu is open, which is
 * the only moment anything in here is meant to be clickable.
 */

import { useEffect, useRef, useState } from 'react';
import { Box } from '../../../../design-system/primitives/Box';
import { EnhancedPauseView, HudLayoutView, HudView, PauseMenuView } from '../../../hud';
import { LocationNotification } from '../../../hud/views/LocationNotification';
import { DeliveryQueueIndicator } from '../../../hud/views/DeliveryQueueIndicator';
import { HudUnavailableNotice } from '../../../hud/views/HudUnavailableNotice';
import { DialogView } from '../../../hud/views/DialogView';
import { useLocationNotification } from '../../../hud/hooks/useLocationNotification';
import { isMainHudVisibleForMode } from '../../../hud/hud-visibility';
import { useEnhancedAspectWatch } from './behavior/useEnhancedAspectWatch';
import { hostDrawnHud } from '@shared/features/hud-style';
import { useHudSettingsStore } from '../../../../../stores/hud-settings-store';
import { useDialogSettingsStore } from '../../../../../stores/dialog-settings-store';
import { useTitleSettingsStore } from '../../../../../stores/title-settings-store';
import { TitleView } from '../../../title';
import { useGameUIStore } from '../../../../../stores/game-ui-store';
import { usePauseMenuStore } from '../../../../../stores/pause-menu-store';
import { useSpriteAvailabilityStore } from '../../../../../stores/sprite-availability-store';
import { useDeliveryQueueStore } from '../../../../../stores/delivery-queue-store';
import { wasmGetMenuState, deliveryQueue } from '../../../../../lib/game';
import '../../../hud/hud.css';

interface GameOverlayProps {
  width: number;
  height: number;
  /** The profile whose battery save the reimagined title reads. */
  profileId?: string;
}

/** Menu transition: 29 frames at 60fps = 483ms */
const MENU_TRANSITION_MS = 483;

type MenuPhase = 'gameplay' | 'opening' | 'open' | 'closing';

const GameOverlay = ({ width, height, profileId }: GameOverlayProps) => {
  const { mode: hudMode, style: hudStyle, enhancedParts } = useHudSettingsStore();
  const gameMode = useGameUIStore((s) => s.mode);
  const spritesAvailable = useSpriteAvailabilityStore((s) => s.available);
  const enhancedDialogBox = useDialogSettingsStore((s) => s.box) === 'enhanced';
  const reimaginedTitle = useTitleSettingsStore((s) => s.screen) === 'reimagined';
  const isEnhanced = hudMode === 'enhanced';

  // Every style reads extracted sprites for the active ROM; without them we show an HTML
  // notice instead. Original draws the sprite HUD; both host-drawn styles (Enhanced and
  // Modern) draw the placed HUD and the host-owned menu. The pair is the same, which is why
  // one predicate picks it.
  const spriteHudRenderable = hudStyle === 'vanilla' && spritesAvailable;
  const enhancedRenderable = hostDrawnHud(hudStyle) && spritesAvailable;
  // Gated on the live game mode: gameplay and dialogue only (see hud-visibility).
  const showMainSlot = isEnhanced && enhancedParts.includes('main') && isMainHudVisibleForMode(gameMode);
  const showPauseMenu = isEnhanced && enhancedParts.includes('pause') && (spriteHudRenderable || enhancedRenderable);
  const [menuPhase, setMenuPhase] = useState<MenuPhase>('gameplay');
  const rafRef = useRef<number>(0);
  // The host menu's own phase. `browsing` is the only one it is on screen for: `closing` slides
  // it away as the core begins its own close scroll, so the two run together instead of in
  // series, and `closed` is already gone. The takeover is read alongside it as the ground truth
  // that the core is still holding the menu for us at all.
  const pauseBrowsing = usePauseMenuStore((s) => s.state.phase === 'browsing');
  const hostMenuHolding = useGameUIStore((s) => s.hostMenu.holding);
  const enhancedMenuOpen = pauseBrowsing && hostMenuHolding;

  useLocationNotification();

  // A host-drawn style needs a 16:9-or-wider display; a shrunk window is the one way to lose that
  // without touching a setting, and this is a component that is mounted while it happens.
  useEnhancedAspectWatch();

  useEffect(() => {
    const unsub = deliveryQueue.subscribe(useDeliveryQueueStore.getState()._sync);
    return unsub;
  }, []);

  // Poll WASM menu state each frame, for the ORIGINAL style only: the only pair that mirrors the
  // native menu. Under a host-drawn style the native machine is parked by the takeover, so polling
  // it would cost a ccall per frame to learn nothing about the menu on screen.
  useEffect(() => {
    if (!isEnhanced || !spriteHudRenderable) return;
    const poll = () => {
      const state = wasmGetMenuState();
      const phase: MenuPhase =
        state === 1 ? 'opening' :
        state === 2 ? 'open' :
        state === 3 ? 'closing' :
        'gameplay';
      setMenuPhase((prev) => prev !== phase ? phase : prev);
      rafRef.current = requestAnimationFrame(poll);
    };
    rafRef.current = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isEnhanced, spriteHudRenderable]);

  // Slide position for Original, from the native machine, exactly as before.
  const isMenuVisible = menuPhase === 'opening' || menuPhase === 'open';
  const isTransitioning = menuPhase === 'opening' || menuPhase === 'closing';
  const transition = isTransitioning ? `transform ${MENU_TRANSITION_MS}ms linear` : 'none';
  // The host-drawn pair, from our own store. The transition is unconditional because the layer only ever
  // moves when the phase above flips: there is no third state to snap between, and a transition
  // switched off at rest is one dropped frame away from teleporting the menu into place.
  const enhancedTransform = enhancedMenuOpen ? 'translateY(0)' : 'translateY(-100%)';
  const enhancedTransition = `transform ${MENU_TRANSITION_MS}ms linear`;

  return (
    <Box
      className="game-overlay"
      style={{
        position: 'absolute',
        inset: 0,
        width,
        height,
        margin: 'auto',
        pointerEvents: 'none',
        zIndex: 10,
        overflow: 'hidden',
      }}
    >
      {/* Pause menu slides down from above. */}
      {showPauseMenu && (
        enhancedRenderable ? (
          <EnhancedPauseView
            slideTransform={enhancedTransform}
            slideTransition={enhancedTransition}
          />
        ) : (
          <PauseMenuView
            slideTransform={isMenuVisible ? 'translateY(0)' : 'translateY(-100%)'}
            slideTransition={transition}
          />
        )
      )}
      {/* HUD slides down when the menu opens. Falls back to an HTML notice when no style can
          render, which has exactly one cause: no sprites extracted for this ROM. */}
      {showMainSlot && (
        spriteHudRenderable ? (
          <HudView
            slideTransform={isMenuVisible ? 'translateY(100%)' : 'translateY(0)'}
            slideTransition={transition}
          />
        ) : enhancedRenderable ? (
          // The app-drawn HUD holds its place while the host menu is up, unlike the sprite
          // one: the menu's chrome is measured around it (a 48-pixel top strip left for
          // the vitals, a legend along the bottom), so sliding it away would leave those
          // bands empty. Only the cluster steps aside, and HudLayoutView does that itself,
          // because the menu pins its own cluster to the very corner this layout uses.
          <HudLayoutView />
        ) : (
          <HudUnavailableNotice />
        )
      )}
      {/* The reimagined title draws over the hidden native one while the intro runs; it covers the view. */}
      {reimaginedTitle && gameMode === 'title' && <TitleView profileId={profileId ?? null} />}
      {/* The enhanced message box draws in either HUD mode; the native one is kept off VRAM meanwhile. */}
      {enhancedDialogBox && <DialogView />}
      {/* Location change notifications */}
      <LocationNotification />
      {/* Delivery queue indicator (bottom-right) */}
      <DeliveryQueueIndicator />
    </Box>
  );
};

export { GameOverlay };
