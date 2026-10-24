/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { EmptyState, RadioGroup, Text } from '@drizztdourden08/tessera/primitives';
import type { RadioOption } from '@drizztdourden08/tessera/primitives';
import { toHex4 } from '../behavior/to-hex4';
import { chooserDeviceLabel } from '../behavior/chooser-device-label';
import type { ChooseControllerStepProps } from './diagnostics-steps.type';
import { MatchedEntryPanel } from './MatchedEntryPanel';

const ChooseControllerStep = (props: ChooseControllerStepProps) => {
  const { devices, addedNames, selectedDeviceKey, onSelect, selectedEntry, mapping, profile } = props;

  const options: RadioOption[] = useMemo(() => devices.map((d) => ({
    value: d.deviceKey,
    label: chooserDeviceLabel(d, addedNames),
    description: `${toHex4(d.vendorId)}:${toHex4(d.productId)} · ${d.busType}${d.hasByteCapability ? '' : ' · no byte capture'}`,
  })), [devices, addedNames]);

  if (devices.length === 0) {
    return <EmptyState message="No controllers." />;
  }

  return (
    <>
      <Text as="p">Pick a controller.</Text>
      <RadioGroup
        value={selectedDeviceKey ?? options[0]?.value ?? ''}
        options={options}
        onChange={onSelect}
        direction="vertical"
      />
      {selectedEntry && (
        <MatchedEntryPanel
          entry={selectedEntry}
          name={chooserDeviceLabel(selectedEntry, addedNames)}
          mapping={mapping}
          profile={profile}
        />
      )}
    </>
  );
};

export { ChooseControllerStep };
