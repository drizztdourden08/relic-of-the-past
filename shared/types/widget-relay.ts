/* @layer shared-types @kind types */
/**
 * What the main window publishes for the widgets living in their own windows.
 * A slice is one named piece of state (the inventory, the completed checks,
 * the game state, the log entries, the widget prefs); the renderer defines the
 * kinds, electron only carries them from the main window to every pop-out.
 */

interface WidgetSlice {
  kind: string;
  data: unknown;
}

export type { WidgetSlice };
