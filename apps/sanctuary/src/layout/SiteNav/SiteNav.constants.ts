/* @layer sanctuary-site @kind constants */
/**
 * The site's sections: one entry per page the nav reaches, with the path it opens and
 * the line icon it wears. Files is pinned as the nav's home; the rest sit in groups.
 */
import type { IconifyIcon } from '@iconify/react/offline';
import filesIcon from '@iconify-icons/lucide/files';
import flagIcon from '@iconify-icons/lucide/flag';
import userIcon from '@iconify-icons/lucide/user';
import shieldIcon from '@iconify-icons/lucide/shield';

type SiteSectionId = 'files' | 'reports' | 'account' | 'admin';

type SiteSection = {
  id: SiteSectionId;
  label: string;
  /** The path the section opens; the active section is the one whose path the location starts with. */
  path: string;
  icon: IconifyIcon;
  adminOnly?: boolean;
  /** Shown only to a caller whose groups grant the reports. */
  needsReports?: boolean;
};

const SITE_SECTIONS: Record<SiteSectionId, SiteSection> = {
  files: { id: 'files', label: 'Files', path: '/files', icon: filesIcon },
  reports: { id: 'reports', label: 'Reports', path: '/reports', icon: flagIcon, needsReports: true },
  account: { id: 'account', label: 'Account', path: '/account', icon: userIcon },
  admin: { id: 'admin', label: 'Admin', path: '/admin', icon: shieldIcon, adminOnly: true },
};

const SITE_HOME: SiteSectionId = 'files';

/** The groups under the pinned home, in order. */
const SITE_NAV_GROUPS: { id: string; label: string; sections: SiteSectionId[] }[] = [
  { id: 'sanctuary', label: 'Sanctuary', sections: ['reports'] },
  { id: 'account', label: 'Account', sections: ['account', 'admin'] },
];

export { SITE_SECTIONS, SITE_HOME, SITE_NAV_GROUPS };
export type { SiteSection, SiteSectionId };
