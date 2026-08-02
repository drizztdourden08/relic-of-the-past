/* @layer renderer-components @kind logic */
/**
 * Where a record's own primary key sits, for every schema this editor draws.
 *
 * The identity field is never an ordinary edit: repointing it changes which
 * record a save targets rather than what that record holds, so a row bound to
 * this path is forced read-only regardless of the rest of the record's
 * editability (see `EditorRow`'s `controlFor`). This is the single source of
 * truth for that path — callers outside the design system (the id-reference
 * option resolver among them) import it rather than repeating the literal.
 */
const IDENTITY_PATH = 'id';

const isIdentityField = (path: string): boolean => path === IDENTITY_PATH;

export { IDENTITY_PATH, isIdentityField };
