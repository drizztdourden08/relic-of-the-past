/* @layer shared-store @kind constants */
/**
 * An item's own colour: its card's border, and the stripes and glow of its placeholder
 * while it has no picture. The store's gold until the author picks one.
 */
const DEFAULT_ITEM_COLOR = '#c8a84e';

const ITEM_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

export { DEFAULT_ITEM_COLOR, ITEM_COLOR_PATTERN };
