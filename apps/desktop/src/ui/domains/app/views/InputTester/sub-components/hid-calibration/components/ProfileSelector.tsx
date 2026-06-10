/* @layer renderer-components @kind component */
/**
 * Profile selection screen for the HID Calibration Wizard.
 */
import type { CSSProperties } from 'react';
import { DEVICE_PROFILES } from '@shared/input';
import { Select, Box, Text, Button } from '../../../../../../../design-system/primitives';
import type { SelectOption } from '../../../../../../../design-system/primitives';

const S: Record<string, CSSProperties> = {
  mb12: { marginBottom: 12 },
  label: { fontSize: 12, color: 'var(--c-text-dim)', display: 'block', marginBottom: 4 },
  ok: { fontSize: 12, color: 'var(--c-green-bright)', margin: '0 0 12px' },
  warn: { fontSize: 12, color: 'var(--c-warning)', margin: '0 0 12px' },
  log: { maxHeight: 150 },
  pre: { whiteSpace: 'pre-wrap' },
};

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
        <Button variant="danger" size="sm" onClick={onCancel}>Cancel</Button>
      </Box>
      <Text as="p" className="hid-cal__desc">
        Identify your controller from the SDL database (893+ controllers).
        The calibration profile is auto-detected from VID:PID.
        {selectedSdlVidPid && !hasGyro && ' Gyro step will be skipped (no gyro detected).'}
        {selectedSdlVidPid && hasGyro && ' 🔄 Gyro detected — gyro profiling will be available.'}
      </Text>

      <Box style={S.mb12}>
        <Text as="label" style={S.label}>
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
        <Text as="p" style={S.ok}>
          ✓ Profile auto-detected: <Text as="strong">{DEVICE_PROFILES.find(p => p.id === selectedProfileId)?.name ?? selectedProfileId}</Text>
        </Text>
      )}
      {!selectedProfileId && selectedSdlVidPid && (
        <Text as="p" style={S.warn}>
          ⚠ No built-in profile for this device — calibration will use a generic layout.
        </Text>
      )}

      <Button variant="primary" size="sm" onClick={onConfirm} disabled={!selectedProfileId}>
        Start Calibration
      </Button>

      <Box ref={logRef} className="input-cal__log" style={S.log}>
        {log.length === 0 && <Box className="input-cal__log-entry">Waiting...</Box>}
        {log.map((entry, i) => (
          <Box key={i} className="input-cal__log-entry" style={S.pre}>{entry}</Box>
        ))}
      </Box>
    </Box>
  );
};

export { ProfileSelector };
