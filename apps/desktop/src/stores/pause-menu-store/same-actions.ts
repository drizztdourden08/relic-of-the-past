/* @layer renderer-stores @kind logic */
import type { PauseCursorActions } from './pause-menu-store.type';

const sameActions = (a: PauseCursorActions, b: PauseCursorActions): boolean =>
  a.confirm === b.confirm && a.assign === b.assign && a.back === b.back;

export { sameActions };
