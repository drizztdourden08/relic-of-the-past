/* @layer renderer-components @kind component */
import { useCallback, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import bugIcon from '@iconify-icons/lucide/bug';
import { Box, Text, Image, IconButton } from '@drizztdourden08/tessera/primitives';
import type { DeviceStickCalibration } from '../../../../../../lib/input/controller-input-store';
import { getButtonIconUrl } from '@app/lib/input/button-icons';
import { resolveLiveControlState } from '@shared/input/family';
import { StickCalibrationWizard } from './StickCalibrationWizard';
import { TriggerCalibrationWizard } from './TriggerCalibrationWizard';
import type { TriggerCalibrationData } from './TriggerCalibrationWizard';
import { RumbleStrengthControl } from './RumbleStrengthControl';
import { RumbleTestButton } from './RumbleTestButton';
import { CONTROLLER_ICON_MAP } from './input-cal-visuals';
import { RUMBLE_TESTS } from './ControllerCard.constants';
import type { ControllerCardProps, CalibrationTarget } from './ControllerCard.type';
import { ControllerAxes } from './ControllerAxes';
import { ControllerRawBytes } from './ControllerRawBytes';
import { ControllerStatusBar } from '../../../compounds/ControllerStatusBar';

const S: Record<string, CSSProperties> = {
  icon: { width: 28, height: 28, opacity: 0.7, flexShrink: 0 },
  calBadge: { fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'var(--c-secondary-dim)', color: 'var(--c-secondary-bright)', fontWeight: 600 },
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
  const triggerButtonControls = useMemo(
    () => resolvedDevice.controls.filter((c) => c.kind === 'axis' && c.category === 'trigger'),
    [resolvedDevice.controls],
  );
  const gridControls = useMemo(
    () => [...buttonControls, ...triggerButtonControls],
    [buttonControls, triggerButtonControls],
  );
  const [calibrationTarget, setCalibrationTarget] = useState<CalibrationTarget>(null);
  const reportDevice = useCallback(() => onReportDevice?.(deviceKey), [onReportDevice, deviceKey]);
  const closeWizard = useCallback(() => setCalibrationTarget(null), []);
  const completeStick = useCallback((cal: DeviceStickCalibration) => {
    onStickCalibrationComplete?.(cal);
    setCalibrationTarget(null);
  }, [onStickCalibrationComplete]);
  const triggerAxisIndex = calibrationTarget?.type === 'trigger' ? calibrationTarget.axisIndex : -1;
  const completeTrigger = useCallback((cal: TriggerCalibrationData) => {
    onTriggerCalibrationComplete?.(deviceKey, triggerAxisIndex, cal);
    setCalibrationTarget(null);
  }, [onTriggerCalibrationComplete, deviceKey, triggerAxisIndex]);

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
          onClick={reportDevice}
        >
          <IconifyIcon icon={bugIcon} width={14} height={14} />
        </IconButton>
      </Box>

      <ControllerStatusBar busType={busType} hasRumble={hasRumble} hasGyro={hasGyro} idLabel={deviceKey} />

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

      <ControllerAxes state={state} controls={resolvedDevice.controls} onCalibrate={setCalibrationTarget} />

      <Box style={S.actions}>
        {RUMBLE_TESTS.map((test) => <RumbleTestButton key={test.label} deviceKey={deviceKey} test={test} />)}
        <RumbleStrengthControl deviceKey={deviceKey} />
        <Text className="input-cal__debug-state" style={S.debugState}>
          t={state.timestamp > 0 ? state.timestamp.toFixed(0) : '-'}
          {' '}btn={state.buttons.filter(Boolean).length}/{state.buttons.length}
          {' '}axes={state.axes.map(a => a.toFixed(1)).join(',')}
        </Text>
      </Box>

      {calibrationTarget?.type === 'stick' && (
        <Box style={S.wizardWrap}>
          <StickCalibrationWizard
            target={calibrationTarget.side === 'both' ? undefined : calibrationTarget.side}
            onComplete={completeStick}
            onCancel={closeWizard}
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
            onComplete={completeTrigger}
            onCancel={closeWizard}
            deviceKey={deviceKey}
          />
        </Box>
      )}

      <ControllerRawBytes state={state} />
    </Box>
  );
};

export { ControllerCard };
export type { ControllerCardProps };
