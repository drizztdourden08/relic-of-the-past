/* @layer bridge-wasm @kind logic */
/**
 * Whether this renderer is a widget's own window. The main process opens a
 * pop-out on the same renderer with `?widget=<id>`; everything that belongs to
 * the game (the core, the title bar, the pages) stays out of such a window.
 */

const hostWidgetId = (): string | null => {
  try {
    return new URLSearchParams(window.location.search).get('widget');
  } catch {
    return null;
  }
};

const isWidgetHost = (): boolean => hostWidgetId() !== null;

export { hostWidgetId, isWidgetHost };
