/* @layer site-kit @kind types */
import type { SectionNavSearch } from '@ds/composites/SectionNav';

type SiteNavProps = {
  search: SectionNavSearch;
  searching: boolean;
  onNavigate: () => void;
};

export type { SiteNavProps };
