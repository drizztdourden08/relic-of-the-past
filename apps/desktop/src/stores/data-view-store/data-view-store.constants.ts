/* @layer renderer-stores @kind constants */
import type { SessionView } from './data-view-store.type';

const DEFAULT_SESSION_VIEW: SessionView = {
  scrollTop: 0,
  expanded: [],
  selectedId: null,
};

export { DEFAULT_SESSION_VIEW };
