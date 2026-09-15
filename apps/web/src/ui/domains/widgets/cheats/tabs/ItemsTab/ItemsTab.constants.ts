/* @layer renderer-widgets @kind constants */
/** Category order and labels for the Free Give grid. */
import { enumerationFor } from '@shared/game/data';

// Crystal/event items joined the roster so a givable one (the id range the grid filters on
// already excludes the rest) gets its own section instead of being dropped by a category this
// list did not yet know about.
const CATEGORY_ORDER = ['weapon', 'equipment', 'medallion', 'bottle', 'upgrade', 'key', 'crystal', 'event', 'junk'];

/** Sourced from Enumeration, not hand-rolled, so a label cannot drift from the canonical one. */
const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  enumerationFor('item-category').map((entry) => [entry.value, entry.label]),
);

/** The native grant ids the Free Give grid offers: events, crystals and virtual ids are excluded. */
const GIVABLE_ID_MIN = 0x00;
const GIVABLE_ID_MAX = 0x4b;

export { CATEGORY_ORDER, CATEGORY_LABELS, GIVABLE_ID_MIN, GIVABLE_ID_MAX };
