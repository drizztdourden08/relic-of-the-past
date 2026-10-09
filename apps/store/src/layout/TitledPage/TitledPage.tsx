/* @layer store-site @kind component */
import { Icon } from '@iconify/react/offline';
import { Flex } from '@drizztdourden08/tessera/primitives';
import { SettingsPage } from '@drizztdourden08/tessera/composites';
import type { TitledPageProps } from './TitledPage.type';
import '@rotp/design';

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
