/* @layer site-kit @kind types */
import type { SideNavSearch } from '@drizztdourden08/tessera/composites';

type SiteNavProps = {
  search: SideNavSearch;
  searching: boolean;
  onNavigate: () => void;
};

export type { SiteNavProps };
