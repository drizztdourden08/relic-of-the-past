/* @layer shared-hud @kind constants */
const GRID_ONLY = ['columns', 'rows', 'justifyItems', 'alignItems'] as const;
const FLEX_ONLY = ['direction', 'justify', 'align', 'wrap'] as const;

export { FLEX_ONLY, GRID_ONLY };
