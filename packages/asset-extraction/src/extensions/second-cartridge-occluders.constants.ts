/* @layer shared-asset-extraction @kind constants */
const STANDING_LAMP_ENTITY_TYPE = 202;

const OCCLUDER_ENTITY_TYPES: ReadonlySet<number> = new Set([STANDING_LAMP_ENTITY_TYPE]);

const MAP_COLS = 64;

const HEAD_ROWS = 2;

const HEAD_COLS = 2;

export { HEAD_COLS, HEAD_ROWS, MAP_COLS, OCCLUDER_ENTITY_TYPES };
