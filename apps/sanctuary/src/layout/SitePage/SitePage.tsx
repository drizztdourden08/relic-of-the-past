/* @layer sanctuary-site @kind component */
/**
 * One Sanctuary section, laid out like a settings tab in the app: the app's own
 * SettingsPage (glowing icon, title, then section anchors or view tabs) on the same dark
 * panel as the nav, with the section's content beneath it. A page may add controls at the
 * end of the header line and a side column to the right of the card.
 */
import type { ReactNode } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Flex } from '@ds/primitives/Flex';
import { SettingsPage } from '@domains/app/compounds/SettingsPage';
import type { SettingsPageAnchor, SettingsPageTabs } from '@domains/app/compounds/SettingsPage';
import { SITE_SECTIONS } from '../SiteNav/SiteNav.constants';
import type { SiteSectionId } from '../SiteNav/SiteNav.constants';
import './SitePage.css';

type SitePageProps = {
  section: SiteSectionId;
  /** Jump links in the header; each matches a `data-section` in the content. */
  anchors?: SettingsPageAnchor[];
  /** View tabs in the header, for a page whose subsections are views. */
  tabs?: SettingsPageTabs;
  /** False for a page that scrolls inside its own table. */
  scroll?: boolean;
  /** Controls at the right end of the header line. */
  actions?: ReactNode;
  /** A column to the right of the card; nothing is drawn there while it is empty. */
  aside?: ReactNode;
  children: ReactNode;
};

const SitePage = (props: SitePageProps) => {
  const { section, anchors, tabs, scroll = true, actions, aside, children } = props;
  const spec = SITE_SECTIONS[section];
  // The row is always there, so the card is not remounted when the aside comes and goes.
  return (
    <Flex align="stretch" className="site-page">
      <SettingsPage
        icon={<IconifyIcon icon={spec.icon} />}
        title={spec.label}
        anchors={anchors}
        tabs={tabs}
        scroll={scroll}
        actions={actions}
      >
        {children}
      </SettingsPage>
      {aside}
    </Flex>
  );
};

export { SitePage };
export type { SitePageProps };
