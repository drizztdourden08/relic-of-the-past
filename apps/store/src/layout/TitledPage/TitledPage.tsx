/* @layer store-site @kind component */
/**
 * A page titled by what it shows (an item, an author, a form) and not by a nav section:
 * the kit's page card with its own icon and title, header tabs or controls, and an
 * optional side column, laid out exactly like the kit's section pages.
 */
import type { ReactNode } from 'react';
import type { IconifyIcon } from '@iconify/react/offline';
import { Icon } from '@iconify/react/offline';
import { Flex } from '@ds/primitives/Flex';
import { SettingsPage } from '@domains/app/compounds/SettingsPage';
import type { SettingsPageTabs } from '@domains/app/compounds/SettingsPage';
import '@site-kit/layout/SitePage/SitePage.css';

type TitledPageProps = {
  icon: IconifyIcon;
  title: string;
  tabs?: SettingsPageTabs;
  scroll?: boolean;
  actions?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
};

const TitledPage = (props: TitledPageProps) => {
  const { icon, title, tabs, scroll = true, actions, aside, children } = props;
  return (
    <Flex align="stretch" className="site-page">
      <SettingsPage icon={<Icon icon={icon} />} title={title} tabs={tabs} scroll={scroll} actions={actions}>
        {children}
      </SettingsPage>
      {aside}
    </Flex>
  );
};

export { TitledPage };
export type { TitledPageProps };
