/* @layer electron-main @kind constants */
const TAGS_FILE = ['packages', 'game-data', 'src', 'data', 'records', 'tags', 'tags.ts'] as const;

const CONVENTION = 'A tag reads namespace:value. Both parts are required.';
const NO_SCOPE = 'A tag has to apply to at least one collection.';

export { TAGS_FILE, CONVENTION, NO_SCOPE };
