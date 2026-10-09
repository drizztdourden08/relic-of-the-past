/* @layer renderer-components @kind component */
import { Status, Card, Text } from '@drizztdourden08/tessera/primitives';
import type { MatchedEntryPanelProps } from './diagnostics-steps.type';

const MatchedEntryPanel = (props: MatchedEntryPanelProps) => {
  const { entry, name, mapping, profile } = props;
  const isGeneric = profile?.family === 'generic';

  return (
    <Card>
      <Text as="p"><Text as="strong">{name}</Text> ({entry.busType})</Text>
      <Text as="p" className="diagnostics-wizard__matched-mapping">
        {mapping ?? 'No SDL mapping is loaded for this device.'}
      </Text>
      <Text as="p">
        Calibration profile: <Text as="strong">{profile?.name ?? 'none resolved'}</Text>
        {isGeneric && <Status tone="warning">generic layout</Status>}
      </Text>
      {!entry.hasByteCapability && (
        <Text as="p" className="diagnostics-wizard__pos-warning">
          Not exposed to HID. Only positional can be captured.
        </Text>
      )}
    </Card>
  );
};

export { MatchedEntryPanel };
export type { MatchedEntryPanelProps };
