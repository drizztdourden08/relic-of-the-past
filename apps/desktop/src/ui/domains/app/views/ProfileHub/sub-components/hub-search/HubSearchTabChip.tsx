/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Button } from '@drizztdourden08/tessera/primitives';
import { PROFILE_HUB_TABS } from '../../ProfileHub.constants';
import type { HubSearchTabChipProps } from './hub-search.type';

const HubSearchTabChip = ({ tab, onOpenTab }: HubSearchTabChipProps) => {
  const handleClick = useCallback(() => onOpenTab(tab), [onOpenTab, tab]);
  return (
    <Button variant="secondary" size="sm" icon={<IconifyIcon icon={PROFILE_HUB_TABS[tab].navIcon} aria-hidden="true" />} onClick={handleClick}>
      Open {PROFILE_HUB_TABS[tab].label}
    </Button>
  );
};

export { HubSearchTabChip };
