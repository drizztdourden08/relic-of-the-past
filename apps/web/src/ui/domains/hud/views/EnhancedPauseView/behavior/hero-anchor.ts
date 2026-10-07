/* @layer renderer-hud @kind logic */
/**
 * World position to screen position, for the one sprite the menu draws itself.
 *
 * The engine positions the player character by writing `link_x_coord -
 * BG2HOFS_copy2` straight into OAM (player_oam.c), so their screen position is
 * their world position minus the camera. But the RENDERED view is not the
 * camera. A wide or tall view renders a band on each side of it and, under the
 * camera lock, shifts the whole thing by `cameraLockShift`, so the canvas's
 * own origin sits at `camera − lockShift − sideBudget`. That is exactly the
 * origin the navigation overlay anchors against (`buildDrawContext`), and
 * getting it wrong is not a small error: an overlay that subtracts the bare
 * camera drifts as the view re-centres and appears to follow the player.
 *
 * The result is in SNES pixels from the top-left of the rendered view (the
 * same space `useHudViewport` reports and every HUD element is placed in), so a
 * caller multiplies by `scale` and nothing else.
 */
import type { ViewportInfo } from '@app/lib/game/bridge/render';

interface ScreenPoint { x: number; y: number }

/** Top-left of the rendered view, in world coordinates. */
const viewOrigin = (vp: ViewportInfo): ScreenPoint => ({
  x: vp.cameraX - vp.cameraLockShiftX - vp.extraLeftRight,
  y: vp.cameraY - vp.cameraLockShiftY,
});

/**
 * Where the player character's own origin is on screen. `linkX`/`linkY` are
 * the same two words `GameUIState.map` carries; they are read back off the
 * viewport query instead so the position and the camera it is measured against
 * come from one frame, not two.
 */
const heroScreenPoint = (vp: ViewportInfo): ScreenPoint => {
  const origin = viewOrigin(vp);
  return { x: vp.linkX - origin.x, y: vp.linkY - origin.y };
};

export { heroScreenPoint, viewOrigin };
export type { ScreenPoint };
