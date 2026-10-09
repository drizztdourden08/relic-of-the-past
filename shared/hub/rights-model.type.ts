/* @layer shared-hub @kind types */
import type { SiteId } from './site-types';

type RightsModel<P extends string = string> = {
  site: SiteId;
  all: readonly P[];
  labels: Record<P, string>;
  describe: (granted: readonly string[]) => string;
};

export type { RightsModel };
