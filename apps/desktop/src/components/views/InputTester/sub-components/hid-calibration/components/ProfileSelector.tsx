/* @layer renderer-components @kind component */
/**
 * Profile selection screen for the HID Calibration Wizard.
 */
import { DEVICE_PROFILES } from '@shared/input';
import { Select } from '../../../../../primitives';
import type { SelectOption } from '../../../../../primitives';

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
    <div className="hid-cal">
      <div className="hid-cal__header">
        <h3 className="hid-cal__title">HID Calibration — Select Controller</h3>
        <button onClick={onCancel} className="input-cal__btn input-cal__btn--danger">Cancel</button>
      </div>
      <p className="hid-cal__desc">
        Identify your controller from the SDL database (893+ controllers).
        The calibration profile is auto-detected from VID:PID.
        {selectedSdlVidPid && !hasGyro && ' Gyro step will be skipped (no gyro detected).'}
        {selectedSdlVidPid && hasGyro && ' 🔄 Gyro detected — gyro profiling will be available.'}
      </p>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 4 }}>
          Controller (SDL Database)
        </label>
        <Select
          value={selectedSdlVidPid}
          onChange={onSdlSelect}
          options={sdlOptions}
          placeholder="Search controllers..."
          searchable
        />
      </div>

      {selectedProfileId && (
        <p style={{ fontSize: 12, color: '#6ee7b7', margin: '0 0 12px' }}>
          ✓ Profile auto-detected: <strong>{DEVICE_PROFILES.find(p => p.id === selectedProfileId)?.name ?? selectedProfileId}</strong>
        </p>
      )}
      {!selectedProfileId && selectedSdlVidPid && (
        <p style={{ fontSize: 12, color: '#fbbf24', margin: '0 0 12px' }}>
          ⚠ No built-in profile for this device — calibration will use a generic layout.
        </p>
      )}

      <button onClick={onConfirm} disabled={!selectedProfileId}
        className="input-cal__btn input-cal__btn--primary">
        Start Calibration
      </button>

      <div ref={logRef} className="input-cal__log" style={{ maxHeight: 150 }}>
        {log.length === 0 && <div className="input-cal__log-entry">Waiting...</div>}
        {log.map((entry, i) => (
          <div key={i} className="input-cal__log-entry" style={{ whiteSpace: 'pre-wrap' }}>{entry}</div>
        ))}
      </div>
    </div>
  );
};

export { ProfileSelector };
