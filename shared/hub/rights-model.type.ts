/* @layer shared-hub @kind types */
/**
 * What one site lets a group grant: its permission names, the words the group editor
 * shows for each, and the one-line summary the groups list prints. Each site ships one;
 * the hub resolves a caller's rights against the model of the site being called.
 */
import type { SiteId } from './site-types';

type RightsModel<P extends string = string> = {
  site: SiteId;
  all: readonly P[];
  /** What the group editor shows for each permission. */
  labels: Record<P, string>;
  /** The summary of a granted list in the groups list. */
  describe: (granted: readonly string[]) => string;
};

export type { RightsModel };
