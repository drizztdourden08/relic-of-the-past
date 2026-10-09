/* @layer renderer-components @kind component */
import { useCallback, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import bugIcon from '@iconify-icons/lucide/bug';
import { Box, Text, Image, IconButton } from '@drizztdourden08/tessera/primitives';
import { getButtonIconUrl } from '@app/input/button-icons/get-button-icon-url';
import { resolveLiveControlState } from '@rotp/input-mapping';
import { RumbleStrengthControl } from './RumbleStrengthControl';
import { RumbleTestButton } from './RumbleTestButton';
import { CONTROLLER_ICON_MAP, RUMBLE_TESTS } from './ControllerCard.constants';
import type { ControllerCardProps } from './ControllerCard.type';
import { ControllerRawBytes } from './ControllerRawBytes';
import { ControllerStatusBar } from '../../../compounds/ControllerStatusBar';

const S: Record<string, CSSProperties> = {
  icon: { width: 28, height: 28, opacity: 0.7, flexShrink: 0 },
  btnFallback: { fontSize: 10, color: 'var(--c-text-dim)' },
  actions: { marginTop: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' },
  debugState: { fontSize: 10, color: 'var(--c-text-muted)', fontFamily: 'monospace' },
};

const ControllerCard = ({ deviceKey, state, resolvedDevice, busType, hasRumble, hasGyro, onReportDevice }: ControllerCardProps) => {
  const gridControls = useMemo(
    () => resolvedDevice.controls.filter((c) => c.kind === 'button' || c.category === 'trigger'),
    [resolvedDevice.controls],
  );
  const reportDevice = useCallback(() => onReportDevice?.(deviceKey), [onReportDevice, deviceKey]);
  const controllerIcon = CONTROLLER_ICON_MAP[resolvedDevice.brandLogoKey] ?? null;

  return (
    <Box className="input-cal__card">
      <Box className="input-cal__card-header">
        {controllerIcon && (
          <Image src={controllerIcon} alt="" draggable={false} style={S.icon} />
        )}
        <Text className="input-cal__card-badge">HID</Text>
        <Text className="input-cal__card-name">{resolvedDevice.name}</Text>
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

      <Box style={S.actions}>
        {RUMBLE_TESTS.map((test) => <RumbleTestButton key={test.label} deviceKey={deviceKey} test={test} />)}
        <RumbleStrengthControl deviceKey={deviceKey} />
        <Text className="input-cal__debug-state" style={S.debugState}>
          t={state.timestamp > 0 ? state.timestamp.toFixed(0) : '-'}
          {' '}btn={state.buttons.filter(Boolean).length}/{state.buttons.length}
          {' '}axes={state.axes.map(a => a.toFixed(1)).join(',')}
        </Text>
      </Box>

      <ControllerRawBytes state={state} />
    </Box>
  );
};

export { ControllerCard };
export type { ControllerCardProps };
