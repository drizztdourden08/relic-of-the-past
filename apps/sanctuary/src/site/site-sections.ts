/* @layer sanctuary-site @kind constants */
/**
 * The site's sections: one entry per page the nav reaches, with the path it opens and
 * the line icon it wears. Files is pinned as the nav's home; the rest sit in groups.
 */
import filesIcon from '@iconify-icons/lucide/files';
import flagIcon from '@iconify-icons/lucide/flag';
import userIcon from '@iconify-icons/lucide/user';
import shieldIcon from '@iconify-icons/lucide/shield';
import { REPORTS_PERMISSION } from '@shared/sanctuary/sanctuary-rights';
import type { SiteNavGroup, SiteSection } from '@site-kit/site/site-definition.type';

type SiteSectionId = 'files' | 'reports' | 'account' | 'admin';

const SITE_SECTIONS: Record<SiteSectionId, SiteSection> = {
  files: { id: 'files', label: 'Files', path: '/files', icon: filesIcon },
  reports: { id: 'reports', label: 'Reports', path: '/reports', icon: flagIcon, permission: REPORTS_PERMISSION },
  account: { id: 'account', label: 'Account', path: '/account', icon: userIcon },
  admin: { id: 'admin', label: 'Admin', path: '/admin', icon: shieldIcon, adminOnly: true },
};

const SITE_HOME: SiteSectionId = 'files';

/** The groups under the pinned home, in order. */
const SITE_NAV_GROUPS: SiteNavGroup[] = [
  { id: 'sanctuary', label: 'Sanctuary', sections: ['reports'] },
  { id: 'account', label: 'Account', sections: ['account', 'admin'] },
];

export { SITE_SECTIONS, SITE_HOME, SITE_NAV_GROUPS };
export type { SiteSectionId };
