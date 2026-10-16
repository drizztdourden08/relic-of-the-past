/* @layer site-kit @kind component */
import { Button, formatDate } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import { PLATFORM_LABELS } from './DeviceRow.constants';
import type { DeviceRowProps } from './DeviceRow.type';

const DeviceRow = (props: DeviceRowProps) => {
  const { device, busy, onRevoke } = props;
  const value = `${device.label} · added ${formatDate(device.createdAt, 'iso', { length: 'short' })} · last seen ${formatDate(device.lastSeenAt, 'relative')}`;
  const action = (
    <Button variant="danger" size="sm" disabled={busy} onClick={() => onRevoke(device.id)}>
      Revoke
    </Button>
  );
  return <ListItemRow name={PLATFORM_LABELS[device.platform]} columns={[{ primary: value }]} action={action} actionVisibility="always" />;
};

export { DeviceRow };
