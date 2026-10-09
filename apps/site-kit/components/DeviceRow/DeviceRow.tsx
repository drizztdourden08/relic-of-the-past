/* @layer site-kit @kind component */
import { Button } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import { formatDay, formatAgo } from '../../lib/format-date';
import { PLATFORM_LABELS } from './DeviceRow.constants';
import type { DeviceRowProps } from './DeviceRow.type';

const DeviceRow = (props: DeviceRowProps) => {
  const { device, busy, onRevoke } = props;
  const value = `${device.label} · added ${formatDay(device.createdAt)} · last seen ${formatAgo(device.lastSeenAt)}`;
  const action = (
    <Button variant="danger" size="sm" disabled={busy} onClick={() => onRevoke(device.id)}>
      Revoke
    </Button>
  );
  return <ListItemRow name={PLATFORM_LABELS[device.platform]} columns={[{ primary: value }]} action={action} actionVisibility="always" />;
};

export { DeviceRow };
