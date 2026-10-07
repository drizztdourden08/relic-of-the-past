/* @layer shared-sanctuary @kind data */
/** The Sanctuary's saved-view surfaces: one per list page. The API refuses any other name. */
const SANCTUARY_VIEW_SURFACES = ['files', 'reports'] as const;

type SanctuaryViewSurface = (typeof SANCTUARY_VIEW_SURFACES)[number];

export { SANCTUARY_VIEW_SURFACES };
export type { SanctuaryViewSurface };
