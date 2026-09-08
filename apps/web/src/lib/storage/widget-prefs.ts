/* @layer renderer-lib @kind logic */
/**
 * Memento for what a widget's CONTENT remembers, as opposed to the frame around
 * it: the tab it was on, the filter it was showing, the view mode it was in.
 * Plain JSON in, plain JSON out, and nothing here knows a disk or a store exists.
 *
 * Values are `unknown` on purpose. Every widget owns its own keys and its own
 * shapes, and a shared union would have to grow a member per widget forever. The
 * bargain instead is that a value must survive a JSON round-trip, which is what
 * `sanitizeWidgetUi` checks on the way back in.
 *
 * Known keys today: `tab` (cheats, live data inspector), `viewMode` (checks,
 * inventory), `grouping` and `filter` (checks), `mode` (navigation).
 */

/** Bump to discard stale prefs instead of migrating them. Same bargain as SNAPSHOT_VERSION. */
const WIDGET_PREFS_VERSION = 1;

/** One widget's remembered content settings, keyed by whatever that widget calls them. */
type WidgetPrefs = Readonly<Record<string, unknown>>;

interface WidgetUiState {
  v: typeof WIDGET_PREFS_VERSION;
  /** Keyed by widget id, the same ids as WIDGET_DEFINITIONS. */
  byWidget: Readonly<Record<string, WidgetPrefs>>;
}

const emptyWidgetUi = (): WidgetUiState => ({ v: WIDGET_PREFS_VERSION, byWidget: {} });

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Prefs arrive from untrusted JSON, so a wrong-shaped file must be dropped
 * instead of crashing a widget. A version mismatch fails here by design, and a
 * single malformed widget entry is dropped without taking its neighbours.
 */
const sanitizeWidgetUi = (raw: unknown): WidgetUiState => {
  if (!isPlainObject(raw) || raw.v !== WIDGET_PREFS_VERSION || !isPlainObject(raw.byWidget)) {
    return emptyWidgetUi();
  }
  const byWidget: Record<string, WidgetPrefs> = {};
  for (const [id, prefs] of Object.entries(raw.byWidget)) {
    if (isPlainObject(prefs)) byWidget[id] = prefs;
  }
  return { v: WIDGET_PREFS_VERSION, byWidget };
};

/** Reads the prefs half out of a profile's tracker blob. */
const readWidgetUi = (blob: Record<string, unknown> | null): WidgetUiState =>
  sanitizeWidgetUi(blob?.widgetUi);

export { WIDGET_PREFS_VERSION, emptyWidgetUi, readWidgetUi, sanitizeWidgetUi };
export type { WidgetPrefs, WidgetUiState };
