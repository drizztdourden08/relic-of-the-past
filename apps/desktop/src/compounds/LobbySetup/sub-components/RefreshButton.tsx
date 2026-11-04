/* @layer renderer-components @kind component */
import { Button, Icon } from '@drizztdourden08/tessera/primitives';
import type { RefreshButtonProps } from '../LobbySetup.type';

const RefreshButton = ({ access, disabled }: RefreshButtonProps) => (
  <Button
    size="sm"
    variant="ghost"
    icon={<Icon name="refresh-cw" />}
    loading={access.refreshing}
    disabled={disabled}
    onClick={access.onRefresh}
  >
    Refresh
  </Button>
);

export { RefreshButton };
