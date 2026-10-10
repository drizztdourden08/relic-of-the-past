/* @layer site-kit @kind hook */
import { useMemo } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { useSiteDefinition } from '../../site/site-context';

const useSectionHeading = (sectionId: string) => {
  const { sections } = useSiteDefinition();
  const section = Object.values(sections).find((entry) => entry.id === sectionId);
  if (!section) throw new Error(`useSectionHeading: the site has no section ${sectionId}`);
  const { icon, label } = section;
  return useMemo(() => ({ icon: <IconifyIcon icon={icon} />, title: label }), [icon, label]);
};

export { useSectionHeading };
