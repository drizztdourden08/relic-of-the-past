/* @layer shared-ipc @kind types */
/**
 * The durable view-state store's wire payload: one whole-file map, keyed by
 * `ViewKey` ('surface:collection'), loaded and saved as a single unit.
 *
 * The main process treats every entry as opaque JSON and never re-shapes it,
 * because the real shape (`ViewSnapshot`) is owned by the renderer's
 * design-system data layer, and `shared/` never depends on renderer code
 * (see docs/architecture/overview.md's dependency invariants). The renderer's
 * `lib/storage/ui-views.ts` repo is what validates each entry against the real
 * `ViewSnapshot` shape before trusting it.
 */
type UiViewsMap = Record<string, unknown>;

export type { UiViewsMap };
