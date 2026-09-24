/* @layer sanctuary-site @kind component */
/**
 * One Sanctuary section, laid out like a settings tab in the app: the app's own
 * SettingsPage (glowing icon, title, then section anchors or view tabs) on the same dark
 * panel as the nav, with the section's content beneath it.
 */
import type { ReactNode } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { SettingsPage } from '@domains/app/compounds/SettingsPage';
import type { SettingsPageAnchor, SettingsPageTabs } from '@domains/app/compounds/SettingsPage';
import { SITE_SECTIONS } from '../SiteNav/SiteNav.constants';
import type { SiteSectionId } from '../SiteNav/SiteNav.constants';

type SitePageProps = {
  section: SiteSectionId;
  /** Jump links in the header; each matches a `data-section` in the content. */
  anchors?: SettingsPageAnchor[];
  /** View tabs in the header, for a page whose subsections are views. */
  tabs?: SettingsPageTabs;
  /** False for a page that scrolls inside its own table. */
  scroll?: boolean;
  children: ReactNode;
};

const SitePage = (props: SitePageProps) => {
  const { section, anchors, tabs, scroll = true, children } = props;
  const spec = SITE_SECTIONS[section];
  return (
    <SettingsPage
      icon={<IconifyIcon icon={spec.icon} />}
      title={spec.label}
      anchors={anchors}
      tabs={tabs}
      scroll={scroll}
    >
      {children}
    </SettingsPage>
  );
};

export { SitePage };
export type { SitePageProps };
