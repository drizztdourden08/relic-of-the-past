/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { EmptyState, RadioGroup, Text } from '@drizztdourden08/tessera/primitives';
import type { RadioOption } from '@drizztdourden08/tessera/primitives';
import { toHex4 } from '../behavior/to-hex4';
import type { ChooseControllerStepProps } from './diagnostics-steps.type';
import { MatchedEntryPanel } from './MatchedEntryPanel';

const ChooseControllerStep = (props: ChooseControllerStepProps) => {
  const { devices, addedNames, selectedDeviceKey, onSelect, selectedEntry, mapping, profile } = props;

  const options: RadioOption[] = useMemo(() => devices.map((d) => ({
    value: d.deviceKey,
    label: d.name || addedNames({ deviceKey: d.deviceKey, vendorId: d.vendorId, productId: d.productId }) || d.product || d.deviceKey,
    description: `${toHex4(d.vendorId)}:${toHex4(d.productId)} · ${d.busType}${d.hasByteCapability ? '' : ' · no byte capture'}`,
  })), [devices, addedNames]);

  if (devices.length === 0) {
    return <EmptyState message="No controller detected on the system yet. Plug one in and it appears here." />;
  }

  return (
    <>
      <Text as="p">Pick which detected controller this run captures.</Text>
      <RadioGroup
        value={selectedDeviceKey ?? options[0]?.value ?? ''}
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
