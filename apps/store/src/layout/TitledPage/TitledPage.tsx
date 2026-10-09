/* @layer store-site @kind component */
import { Icon } from '@iconify/react/offline';
import { Flex } from '@ds/primitives/Flex';
import { SettingsPage } from '@domains/app/compounds/SettingsPage';
import type { TitledPageProps } from './TitledPage.type';
import '@site-kit/layout/SitePage/SitePage.css';

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
export type { TitledPageProps } from './TitledPage.type';
