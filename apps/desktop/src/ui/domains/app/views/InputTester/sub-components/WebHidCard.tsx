/* @layer renderer-components @kind component */
/**
 * WebHidCard — Shows a connected WebHID controller with buttons, sticks, triggers,
 * vibration controls, calibration wizard, and raw byte debug.
 */

import { useState } from 'react';
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import { Image } from '../../../../../design-system/primitives/Image';
import { webHidReader } from '../../../../../../lib/input/hid-reader';
import { getButtonIconUrl } from '@app/lib/input/button-icons';
import { StickCalibrationWizard } from './StickCalibrationWizard';
import { TriggerCalibrationWizard } from './TriggerCalibrationWizard';
import { CONTROLLER_ICON_MAP, resolveDeviceName } from './input-cal-visuals';
import type { WebHidCardProps, CalibrationTarget } from './web-hid-card-types';
import { WebHidAxes } from './WebHidAxes';
import { WebHidRawBytes } from './WebHidRawBytes';

const WebHidCard = ({ deviceKey, state, profile, hasStickCal, existingStickCal, onStickCalibrationComplete, onTriggerCalibrationComplete }: WebHidCardProps) => {
  const [vidHex, pidHex] = deviceKey.split(':');
  const name = profile?.name ?? resolveDeviceName(vidHex, pidHex);
  const buttons = profile?.buttons ?? [];
  const [calibrationTarget, setCalibrationTarget] = useState<CalibrationTarget>(null);

  const controllerIcon = profile ? CONTROLLER_ICON_MAP[profile.family] : null;
  const isStale = webHidReader.isDeviceStale(deviceKey);

  return (
    <Box className={`input-cal__card ${isStale ? 'input-cal__card--stale' : ''}`}>
      {isStale && (
        <Box className="input-cal__stale-overlay">
          <Text className="input-cal__stale-label">STALE</Text>
          <Text className="input-cal__stale-sub">No HID data</Text>
        </Box>
      )}
      <Box className="input-cal__card-header">
        {controllerIcon && (
          <Image src={controllerIcon} alt="" draggable={false} style={{ width: 28, height: 28, opacity: 0.7, flexShrink: 0 }} />
        )}
        <Text className="input-cal__card-badge">HID</Text>
        <Text className="input-cal__card-name">{name}</Text>
        <Text className="input-cal__card-meta">{deviceKey}</Text>
        {hasStickCal && (
          <Text style={{
            fontSize: 10, padding: '1px 6px', borderRadius: 4,
            background: 'var(--color-success-bg, #1a3a2a)', color: 'var(--color-success-text, #4ade80)',
            fontWeight: 600,
          }}>
            Sticks Calibrated
          </Text>
        )}
      </Box>

      {/* Buttons with icons */}
      <Box className="input-cal__btn-grid">
        {buttons.map((btn, i) => {
          const pressed = state.buttons[i] ?? false;
          const iconUrl = getButtonIconUrl(btn.icon);
          return (
            <Box
              key={btn.id}
              className={`input-cal__btn-cell ${pressed ? 'input-cal__btn-cell--pressed' : ''}`}
              title={`${btn.label} (${btn.id})`}
            >
              {iconUrl ? (
                <Image src={iconUrl} alt={btn.label} draggable={false} />
              ) : (
                <Text style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>{btn.label}</Text>
              )}
              <Text className="input-cal__btn-cell-label">{btn.label}</Text>
            </Box>
          );
        })}
      </Box>

      {/* Sticks and triggers — dynamically derived from profile axes */}
      <WebHidAxes state={state} profile={profile} onCalibrate={setCalibrationTarget} />

      {/* Actions */}
      <Box style={{ marginTop: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
        {profile?.supportsVibration && <>
        <Box as="button" className="input-cal__btn" onClick={() => window.api.vibratePattern(deviceKey, [{ durationMs: 100, intensity: 1.0 }], 0).then(r => { if (!r.ok) webHidReader.addDiag(`⚠ Vibrate failed (${deviceKey}): ${r.error}`); }).catch(e => webHidReader.addDiag(`⚠ Vibrate IPC error: ${e}`))}>
          100ms
        </Box>
        <Box as="button" className="input-cal__btn" onClick={() => window.api.vibratePattern(deviceKey, [{ durationMs: 250, intensity: 1.0 }], 0).then(r => { if (!r.ok) webHidReader.addDiag(`⚠ Vibrate failed (${deviceKey}): ${r.error}`); }).catch(e => webHidReader.addDiag(`⚠ Vibrate IPC error: ${e}`))}>
          250ms
        </Box>
        <Box as="button" className="input-cal__btn" onClick={() => window.api.vibratePattern(deviceKey, [{ durationMs: 1000, intensity: 1.0 }], 0).then(r => { if (!r.ok) webHidReader.addDiag(`⚠ Vibrate failed (${deviceKey}): ${r.error}`); }).catch(e => webHidReader.addDiag(`⚠ Vibrate IPC error: ${e}`))}>
          1000ms
        </Box>
        <Box as="button" className="input-cal__btn" onClick={() => window.api.vibratePattern(deviceKey, [{ durationMs: 100, intensity: 1.0 }, { durationMs: 100, intensity: 1.0 }, { durationMs: 100, intensity: 1.0 }], 50).then(r => { if (!r.ok) webHidReader.addDiag(`⚠ Vibrate failed (${deviceKey}): ${r.error}`); }).catch(e => webHidReader.addDiag(`⚠ Vibrate IPC error: ${e}`))}>
          3×100ms
        </Box>
        <Box as="button" className="input-cal__btn" onClick={() => window.api.vibratePattern(deviceKey, [{ durationMs: 100, intensity: 1.0 }, { durationMs: 100, intensity: 1.0 }, { durationMs: 1000, intensity: 1.0 }, { durationMs: 100, intensity: 1.0 }, { durationMs: 100, intensity: 1.0 }], 50).then(r => { if (!r.ok) webHidReader.addDiag(`⚠ Vibrate failed (${deviceKey}): ${r.error}`); }).catch(e => webHidReader.addDiag(`⚠ Vibrate IPC error: ${e}`))}>
          2-long-2
        </Box>
        </>}
        <Text className="input-cal__debug-state" style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
          t={state.timestamp > 0 ? state.timestamp.toFixed(0) : '—'}
          {' '}btn={state.buttons.filter(Boolean).length}/{state.buttons.length}
          {' '}axes={state.axes.map(a => a.toFixed(1)).join(',')}
        </Text>
      </Box>

      {/* Calibration Wizard (inline) */}
      {calibrationTarget?.type === 'stick' && (
        <Box style={{ marginTop: 'var(--space-md)' }}>
          <StickCalibrationWizard
            target={calibrationTarget.side === 'both' ? undefined : calibrationTarget.side}
            onComplete={(cal) => {
              onStickCalibrationComplete?.(cal);
              setCalibrationTarget(null);
            }}
            onCancel={() => setCalibrationTarget(null)}
            existingCalibration={existingStickCal}
            deviceKey={deviceKey}
          />
        </Box>
      )}
      {calibrationTarget?.type === 'trigger' && (
        <Box style={{ marginTop: 'var(--space-md)' }}>
          <TriggerCalibrationWizard
            axisIndex={calibrationTarget.axisIndex}
            label={calibrationTarget.label}
            onComplete={(cal) => {
              onTriggerCalibrationComplete?.(calibrationTarget.axisIndex, cal);
              setCalibrationTarget(null);
            }}
            onCancel={() => setCalibrationTarget(null)}
            deviceKey={deviceKey}
          />
        </Box>
      )}

      {/* Collapsible raw bytes debug */}
      <WebHidRawBytes state={state} />
    </Box>
  );
};

export { WebHidCard };
export type { WebHidCardProps };
