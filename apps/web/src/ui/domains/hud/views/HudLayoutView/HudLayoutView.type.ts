/* @layer renderer-hud @kind types */

interface HudLayoutViewProps {
  /**
   * Hold the cluster on screen regardless of the layout's `inGameplay` reveal
   * rule. Used by a host that is showing the HUD instead of playing under it.
   *
   * It no longer has anything to say about WHICH chips are drawn: every
   * assignable button is drawn everywhere now, so a player can always see where
   * an item could go. That was this flag's other job and it is gone.
   */
  showAllChips?: boolean;
  /**
   * A pause open/close animation, for a host that wants this HUD to slide with it.
   * The host-drawn pair does NOT: its menu's chrome is measured around the HUD (a top
   * strip left for the vitals, a legend along the bottom), so the HUD holds its place
   * and only the button cluster stands down.
   */
  slideTransform?: string;
  slideTransition?: string;
}

export type { HudLayoutViewProps };
