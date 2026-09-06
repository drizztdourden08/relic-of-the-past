/* @layer renderer-components @kind logic */
/**
 * Where a record's primary key sits. Repointing it changes which record a save
 * targets, so the row is always read-only (see `EditorRow`'s `controlFor`).
 * Single source of truth for the path; callers import it.
 */
const IDENTITY_PATH = 'id';

const isIdentityField = (path: string): boolean => path === IDENTITY_PATH;

export { IDENTITY_PATH, isIdentityField };
