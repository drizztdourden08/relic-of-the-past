/* @layer renderer-components @kind component */
/**
 * ControllerCard — Shows a connected controller with buttons, sticks, triggers,
 * vibration controls, calibration wizard, and raw byte debug.
 */

import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import bugIcon from '@iconify-icons/lucide/bug';
import * as controllersStore from '@app/lib/input/controllers-store';
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import { Image } from '../../../../../design-system/primitives/Image';
import { Button } from '../../../../../design-system/primitives/Button';
import { IconButton } from '../../../../../design-system/primitives/IconButton';
import { controllerInputStore } from '../../../../../../lib/input/controller-input-store';
import { previewHapticPattern } from '../../../../../../lib/input/haptic-bridge';
import { getButtonIconUrl } from '@app/lib/input/button-icons';
import { resolveLiveControlState } from '@shared/input/family';
import { StickCalibrationWizard } from './StickCalibrationWizard';
import { TriggerCalibrationWizard } from './TriggerCalibrationWizard';
import { RumbleStrengthControl } from './RumbleStrengthControl';
import { CONTROLLER_ICON_MAP } from './input-cal-visuals';
import type { ControllerCardProps, CalibrationTarget } from './controller-card-types';
import { ControllerAxes } from './ControllerAxes';
import { ControllerRawBytes } from './ControllerRawBytes';
import { ControllerStatusBar } from '../../../compounds/ControllerStatusBar';

const S: Record<string, CSSProperties> = {
  icon: { width: 28, height: 28, opacity: 0.7, flexShrink: 0 },
  calBadge: { fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'var(--c-green-dim)', color: 'var(--c-green-bright)', fontWeight: 600 },
  btnFallback: { fontSize: 10, color: 'var(--c-text-dim)' },
  actions: { marginTop: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' },
  debugState: { fontSize: 10, color: 'var(--c-text-muted)', fontFamily: 'monospace' },
  wizardWrap: { marginTop: 'var(--space-md)' },
};

const ControllerCard = ({ deviceKey, state, resolvedDevice, hasStickCal, existingStickCal, busType, hasRumble, hasGyro, onReportDevice, onStickCalibrationComplete, onTriggerCalibrationComplete }: ControllerCardProps) => {
  const name = resolvedDevice.name;
  const buttonControls = useMemo(
    () => resolvedDevice.controls.filter((c) => c.kind === 'button'),
    [resolvedDevice.controls],
  );
  // A trigger reported as an axis still gets a grid cell alongside the real
  // buttons, highlighting once its analog travel crosses the same threshold
  // ControllerAxes' TriggerBar reads (resolveLiveControlState is the single
  // source for both). Appended after the real buttons so the existing grid
  // order is untouched.
  const triggerButtonControls = useMemo(
    () => resolvedDevice.controls.filter((c) => c.kind === 'axis' && c.category === 'trigger'),
    [resolvedDevice.controls],
  );
  const gridControls = useMemo(
    () => [...buttonControls, ...triggerButtonControls],
    [buttonControls, triggerButtonControls],
  );
  const [calibrationTarget, setCalibrationTarget] = useState<CalibrationTarget>(null);

  const controllerIcon = CONTROLLER_ICON_MAP[resolvedDevice.brandLogoKey] ?? null;

  return (
    <Box className="input-cal__card">
      <Box className="input-cal__card-header">
        {controllerIcon && (
          <Image src={controllerIcon} alt="" draggable={false} style={S.icon} />
        )}
        <Text className="input-cal__card-badge">HID</Text>
        <Text className="input-cal__card-name">{name}</Text>
        {hasStickCal && (
          <Text style={S.calBadge}>
            Sticks Calibrated
          </Text>
        )}
        <IconButton
          variant="ghost"
          size="sm"
          label="Report this controller as not working"
          className="input-cal__report-bug"
          onClick={() => onReportDevice?.(deviceKey)}
        >
          <IconifyIcon icon={bugIcon} width={14} height={14} />
        </IconButton>
      </Box>

      <ControllerStatusBar busType={busType} hasRumble={hasRumble} hasGyro={hasGyro} idLabel={deviceKey} />


      {/* Buttons with icons, in the order SDL reports them */}
      <Box className="input-cal__btn-grid">
        {gridControls.map((control) => {
          const { pressed } = resolveLiveControlState(control, state.buttons, state.axes);
          const iconUrl = getButtonIconUrl(control.icon);
          return (
            <Box
              key={control.position}
              className={`input-cal__btn-cell ${pressed ? 'input-cal__btn-cell--pressed' : ''}`}
              title={`${control.label} (${control.position})`}
            >
              {iconUrl ? (
                <Image src={iconUrl} alt={control.label} draggable={false} />
              ) : (
                <Text style={S.btnFallback}>{control.label}</Text>
              )}
              <Text className="input-cal__btn-cell-label">{control.label}</Text>
            </Box>
          );
        })}
      </Box>

      {/* Sticks and triggers, derived from the device's resolved axis controls */}
      <ControllerAxes state={state} controls={resolvedDevice.controls} onCalibrate={setCalibrationTarget} />

      {/* Actions */}
      <Box style={S.actions}>
        <Button variant="tertiary" size="sm" onClick={() => controllersStore.vibratePattern(deviceKey, [{ durationMs: 100, intensity: 1.0 }], 0).then(r => { if (!r.ok) controllerInputStore.addDiag(`⚠ Vibrate failed (${deviceKey}): ${r.error}`); }).catch(e => controllerInputStore.addDiag(`⚠ Vibrate IPC error: ${e}`))}>
          100ms
        </Button>
        <Button variant="tertiary" size="sm" onClick={() => controllersStore.vibratePattern(deviceKey, [{ durationMs: 250, intensity: 1.0 }], 0).then(r => { if (!r.ok) controllerInputStore.addDiag(`⚠ Vibrate failed (${deviceKey}): ${r.error}`); }).catch(e => controllerInputStore.addDiag(`⚠ Vibrate IPC error: ${e}`))}>
          250ms
        </Button>
        <Button variant="tertiary" size="sm" onClick={() => controllersStore.vibratePattern(deviceKey, [{ durationMs: 1000, intensity: 1.0 }], 0).then(r => { if (!r.ok) controllerInputStore.addDiag(`⚠ Vibrate failed (${deviceKey}): ${r.error}`); }).catch(e => controllerInputStore.addDiag(`⚠ Vibrate IPC error: ${e}`))}>
          1000ms
        </Button>
        <Button variant="tertiary" size="sm" onClick={() => controllersStore.vibratePattern(deviceKey, [{ durationMs: 100, intensity: 1.0 }, { durationMs: 100, intensity: 1.0 }, { durationMs: 100, intensity: 1.0 }], 50).then(r => { if (!r.ok) controllerInputStore.addDiag(`⚠ Vibrate failed (${deviceKey}): ${r.error}`); }).catch(e => controllerInputStore.addDiag(`⚠ Vibrate IPC error: ${e}`))}>
          3×100ms
        </Button>
        <Button variant="tertiary" size="sm" onClick={() => controllersStore.vibratePattern(deviceKey, [{ durationMs: 100, intensity: 1.0 }, { durationMs: 100, intensity: 1.0 }, { durationMs: 1000, intensity: 1.0 }, { durationMs: 100, intensity: 1.0 }, { durationMs: 100, intensity: 1.0 }], 50).then(r => { if (!r.ok) controllerInputStore.addDiag(`⚠ Vibrate failed (${deviceKey}): ${r.error}`); }).catch(e => controllerInputStore.addDiag(`⚠ Vibrate IPC error: ${e}`))}>
          2-long-2
        </Button>
        <Button variant="tertiary" size="sm" onClick={() => previewHapticPattern(deviceKey, 'swordHitEnemy').then(r => { if (!r.ok) controllerInputStore.addDiag(`⚠ Vibrate failed (${deviceKey}): ${r.error}`); }).catch(e => controllerInputStore.addDiag(`⚠ Vibrate IPC error: ${e}`))}>
          Sword Hit
        </Button>
        <RumbleStrengthControl deviceKey={deviceKey} />
        <Text className="input-cal__debug-state" style={S.debugState}>
          t={state.timestamp > 0 ? state.timestamp.toFixed(0) : '—'}
          {' '}btn={state.buttons.filter(Boolean).length}/{state.buttons.length}
          {' '}axes={state.axes.map(a => a.toFixed(1)).join(',')}
        </Text>
      </Box>

      {/* Calibration Wizard (inline) */}
      {calibrationTarget?.type === 'stick' && (
        <Box style={S.wizardWrap}>
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
        <Box style={S.wizardWrap}>
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
      <ControllerRawBytes state={state} />
    </Box>
  );
};

export { ControllerCard };
export type { ControllerCardProps };
