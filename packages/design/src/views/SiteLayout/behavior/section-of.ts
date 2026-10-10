/* @layer site-kit @kind logic */
import type { SiteSection } from '../../../site/site-definition.type';

const sectionOf = (sections: Record<string, SiteSection>, id: string): SiteSection => {
  const section = sections[id];
  if (section === undefined) throw new Error(`The site has no section ${id}`);
  return section;
};

export { sectionOf };
