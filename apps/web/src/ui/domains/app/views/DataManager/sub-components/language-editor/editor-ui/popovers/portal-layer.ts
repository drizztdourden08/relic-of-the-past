/* @layer renderer-components @kind logic */
/**
 * Whether a design-system dropdown is currently showing.
 *
 * A `Select` draws its list through a PORTAL, so the list is not a descendant of
 * the card that holds the select. A press on one of its values therefore looks
 * like a press outside the card, and would close the card before the value could
 * be taken. Asking whether the portal's popover layer holds anything is how a
 * card tells "someone pressed elsewhere" apart from "someone is choosing a value
 * in my own list".
 *
 * A press that really is elsewhere still closes the list, and the press after it
 * closes the card, so nothing is stranded open.
 */

/** The container `Portal` creates for its popover layer, if anything has used it. */
const LAYER_ID = 'portal-layer-popover';

const hasOpenDropdown = (): boolean => {
  const layer = document.getElementById(LAYER_ID);
  return layer !== null && layer.childElementCount > 0;
};

export { hasOpenDropdown };
