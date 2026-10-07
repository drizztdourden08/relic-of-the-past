/* @layer sanctuary-site @kind component */
/** One signed-in app instance on the Account page: platform, label, dates and Revoke. */
import type { Device, DevicePlatform } from '@shared/sanctuary/device-types';
import { Button } from '@ds/primitives/Button';
import { Row } from '../Row/Row';
import { formatDay, formatAgo } from '../../lib/format-date';

type DeviceRowProps = {
  device: Device;
  busy: boolean;
  onRevoke: (id: string) => void;
};

const PLATFORM_LABELS: Record<DevicePlatform, string> = {
  windows: 'Windows',
  linux: 'Linux',
  mac: 'Mac',
  android: 'Android',
};

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
export type { DeviceRowProps };
