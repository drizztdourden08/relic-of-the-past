/* @layer site-kit @kind component */
import { Button } from '@drizztdourden08/tessera/primitives';
import { Row } from '../Row/Row';
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
  return <Row label={PLATFORM_LABELS[device.platform]} value={value} action={action} />;
};

export { DeviceRow };
