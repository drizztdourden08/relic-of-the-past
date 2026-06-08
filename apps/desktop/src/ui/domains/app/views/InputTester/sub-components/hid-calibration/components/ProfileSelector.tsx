/* @layer renderer-components @kind component */
/**
 * Profile selection screen for the HID Calibration Wizard.
 */
import { DEVICE_PROFILES } from '@shared/input';
import { Select, Box, Text } from '../../../../../../../design-system/primitives';
import type { SelectOption } from '../../../../../../../design-system/primitives';

interface ProfileSelectorProps {
  selectedProfileId: string;
  selectedSdlVidPid: string;
  hasGyro: boolean;
  sdlOptions: SelectOption[];
  onSdlSelect: (vidPid: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  log: string[];
  logRef: React.RefObject<HTMLDivElement | null>;
}

const ProfileSelector = (props: ProfileSelectorProps) => {
  const { selectedProfileId, selectedSdlVidPid, hasGyro, sdlOptions, onSdlSelect, onConfirm, onCancel, log, logRef } = props;

  return (
    <Box className="hid-cal">
      <Box className="hid-cal__header">
        <Text as="h3" className="hid-cal__title">HID Calibration — Select Controller</Text>
        <Box as="button" onClick={onCancel} className="input-cal__btn input-cal__btn--danger">Cancel</Box>
      </Box>
      <Text as="p" className="hid-cal__desc">
        Identify your controller from the SDL database (893+ controllers).
        The calibration profile is auto-detected from VID:PID.
        {selectedSdlVidPid && !hasGyro && ' Gyro step will be skipped (no gyro detected).'}
        {selectedSdlVidPid && hasGyro && ' 🔄 Gyro detected — gyro profiling will be available.'}
      </Text>

      <Box style={{ marginBottom: 12 }}>
        <Text as="label" style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 4 }}>
          Controller (SDL Database)
        </Text>
        <Select
          value={selectedSdlVidPid}
          onChange={onSdlSelect}
          options={sdlOptions}
          placeholder="Search controllers..."
          searchable
        />
      </Box>

      {selectedProfileId && (
        <Text as="p" style={{ fontSize: 12, color: '#6ee7b7', margin: '0 0 12px' }}>
          ✓ Profile auto-detected: <Text as="strong">{DEVICE_PROFILES.find(p => p.id === selectedProfileId)?.name ?? selectedProfileId}</Text>
        </Text>
      )}
      {!selectedProfileId && selectedSdlVidPid && (
        <Text as="p" style={{ fontSize: 12, color: '#fbbf24', margin: '0 0 12px' }}>
          ⚠ No built-in profile for this device — calibration will use a generic layout.
        </Text>
      )}

      <Box as="button" onClick={onConfirm} disabled={!selectedProfileId}
        className="input-cal__btn input-cal__btn--primary">
        Start Calibration
      </Box>

      <Box ref={logRef} className="input-cal__log" style={{ maxHeight: 150 }}>
        {log.length === 0 && <Box className="input-cal__log-entry">Waiting...</Box>}
        {log.map((entry, i) => (
          <Box key={i} className="input-cal__log-entry" style={{ whiteSpace: 'pre-wrap' }}>{entry}</Box>
        ))}
      </Box>
    </Box>
  );
};

export { ProfileSelector };
