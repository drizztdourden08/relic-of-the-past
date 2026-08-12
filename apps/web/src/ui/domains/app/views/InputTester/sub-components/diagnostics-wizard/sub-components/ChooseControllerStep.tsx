/* @layer renderer-components @kind component */
/**
 * Step 2: lists every controller this run can find, the union of the raw
 * HID enumeration and the SDL-claimed snapshot taken just before step 1
 * released the hold (see chooser-devices.ts), and lets the user pick which
 * one steps 3-4 run against. Sourced this way, the list is never empty just
 * because SDL's gamepad backend is currently released, and still includes a
 * controller (XInput-style) the HID enumeration alone would never see.
 */
import { EmptyState, RadioGroup, Text } from '@ds/primitives';
import type { RadioOption } from '@ds/primitives';
import type { DeviceProfile } from '@shared/input';
import type { ChooserDevice } from '../behavior/chooser-devices';
import { MatchedEntryPanel } from './MatchedEntryPanel';

const toHex4 = (n: number): string => n.toString(16).padStart(4, '0');

interface ChooseControllerStepProps {
  devices: ChooserDevice[];
  addedNames: (params: { deviceKey?: string; vendorId?: number; productId?: number }) => string | null;
  selectedDeviceKey: string | null;
  onSelect: (deviceKey: string) => void;
  selectedEntry: ChooserDevice | null;
  mapping: string | null;
  profile: DeviceProfile | null;
}

const ChooseControllerStep = (props: ChooseControllerStepProps) => {
  const { devices, addedNames, selectedDeviceKey, onSelect, selectedEntry, mapping, profile } = props;

  if (devices.length === 0) {
    return <EmptyState message="No controller detected on the system yet. Plug one in and it appears here." />;
  }

  const options: RadioOption[] = devices.map((d) => ({
    value: d.deviceKey,
    label: d.name || addedNames({ deviceKey: d.deviceKey, vendorId: d.vendorId, productId: d.productId }) || d.product || d.deviceKey,
    description: `${toHex4(d.vendorId)}:${toHex4(d.productId)} · ${d.busType}${d.hasByteCapability ? '' : ' · no byte capture'}`,
  }));

  return (
    <>
      <Text as="p">Pick which detected controller this run captures.</Text>
      <RadioGroup
        value={selectedDeviceKey ?? options[0].value}
        options={options}
        onChange={onSelect}
        direction="vertical"
      />
      {selectedEntry && (
        <MatchedEntryPanel
          entry={selectedEntry}
          name={selectedEntry.name || addedNames({ deviceKey: selectedEntry.deviceKey, vendorId: selectedEntry.vendorId, productId: selectedEntry.productId }) || selectedEntry.product || selectedEntry.deviceKey}
          mapping={mapping}
          profile={profile}
        />
      )}
    </>
  );
};

export { ChooseControllerStep };
export type { ChooseControllerStepProps };
