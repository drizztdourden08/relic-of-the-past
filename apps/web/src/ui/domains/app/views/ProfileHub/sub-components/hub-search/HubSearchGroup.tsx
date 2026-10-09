/* @layer renderer-components @kind component */
import { useCallback, useMemo } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box, Button, SectionHeader } from '@drizztdourden08/tessera/primitives';
import { SettingsPageContext } from '../../../../compounds/SettingsLayout';
import { PROFILE_HUB_TABS } from '../../ProfileHub.constants';
import { ProfileHubTabContent } from '../ProfileHubTabContent';
import type { HubSearchGroupProps } from './hub-search.type';

const HubSearchGroup = ({ tab, count, query, content, onOpenTab }: HubSearchGroupProps) => {
  const spec = PROFILE_HUB_TABS[tab];
  const icon = useMemo(() => <IconifyIcon icon={spec.navIcon} />, [spec.navIcon]);
  const pageContext = useMemo(
    () => ({ variant: 'results' as const, icon, title: spec.label, query }),
    [icon, spec.label, query],
  );
  const handleOpen = useCallback(() => onOpenTab(tab), [onOpenTab, tab]);

  return (
    <Box as="section" className="hub-search__group" aria-label={spec.label}>
      <SectionHeader
        title={<><Box as="span" className="hub-search__group-icon" aria-hidden="true">{icon}</Box> {spec.label}</>}
        count={count}
        action={<Button variant="secondary" size="sm" onClick={handleOpen}>Open tab</Button>}
      />
      <SettingsPageContext.Provider value={pageContext}>
        <ProfileHubTabContent {...content} tab={tab} />
      </SettingsPageContext.Provider>
    </Box>
  );
};

export { HubSearchGroup };
