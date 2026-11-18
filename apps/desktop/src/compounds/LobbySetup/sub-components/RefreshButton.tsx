/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Button, Icon } from '@drizztdourden08/tessera/primitives';
import type { RefreshButtonProps } from '../LobbySetup.type';

const RefreshButton = ({ access, disabled }: RefreshButtonProps) => {
  const t = useT();
  return (
  <Button
    size="sm"
    variant="ghost"
    icon={<Icon name="refresh-cw" />}
    loading={access.refreshing}
    disabled={disabled}
    onClick={access.onRefresh}
  >
    {t('compounds:lobby-setup.refresh')}
  </Button>
  );
};

export { RefreshButton };
