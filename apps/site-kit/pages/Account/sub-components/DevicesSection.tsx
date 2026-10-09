/* @layer site-kit @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { ListItemList, SettingsSection } from '@drizztdourden08/tessera/composites';
import { DeviceRow } from '../../../components/DeviceRow/DeviceRow';
import { useDevices } from '../behavior/useDevices';

const DevicesSection = () => {
  const { devices, busy, error, revoke } = useDevices();
  return (
    <SettingsSection title="Signed-in devices" description="The app, on each machine it is signed in on.">
      {devices === null && <Text as="p" variant="caption">Loading devices</Text>}
      {devices?.length === 0 && <Text as="p" variant="caption">No device is signed in.</Text>}
      {devices && devices.length > 0 && (
        <ListItemList label="Signed-in devices">
          {devices.map((device) => (
            <DeviceRow key={device.id} device={device} busy={busy} onRevoke={(id) => void revoke(id)} />
          ))}
        </ListItemList>
      )}
      {error && <Text as="p" variant="caption" role="alert">{error}</Text>}
    </SettingsSection>
  );
};

export { DevicesSection };
