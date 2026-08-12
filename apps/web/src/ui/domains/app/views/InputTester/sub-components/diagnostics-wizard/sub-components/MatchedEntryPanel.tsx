/* @layer renderer-components @kind component */
/** What the real database actually knows about the selected device: SDL's
 *  own name, the gamecontrollerdb mapping line it loaded for this guid (or
 *  none), which calibration profile this run will use, and whether a byte
 *  capture can run at all for it. */
import { Badge, Card, Text } from '@ds/primitives';
import type { DeviceProfile } from '@shared/input';
import type { ChooserDevice } from '../behavior/chooser-devices';

interface MatchedEntryPanelProps {
  entry: ChooserDevice;
  name: string;
  mapping: string | null;
  profile: DeviceProfile | null;
}

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
        {isGeneric && <Badge variant="warning">generic layout</Badge>}
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
