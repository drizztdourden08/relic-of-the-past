/* @layer site-kit @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Flex } from '@drizztdourden08/tessera/primitives';
import { SettingsPage } from '@domains/app/compounds/SettingsPage';
import { useSiteDefinition } from '../../site/site-context';
import type { SitePageProps } from './SitePage.type';
import './SitePage.css';

const SitePage = (props: SitePageProps) => {
  const { section, anchors, tabs, scroll = true, actions, aside, children } = props;
  const spec = useSiteDefinition().sections[section];
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
export type { SitePageProps } from './SitePage.type';
