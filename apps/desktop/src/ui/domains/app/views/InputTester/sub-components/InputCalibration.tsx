/* @layer renderer-components @kind component */
/**
 * InputCalibration — Controller input visualization & calibration page.
 *
 * Shows detected controllers with real-time button/axis state using
 * proper SVG icons, joystick circle testers, and vibration testing.
 */

import type { CSSProperties } from 'react';
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import { Image } from '../../../../../design-system/primitives/Image';
import { Button } from '../../../../../design-system/primitives/Button';
import { webHidReader } from '../../../../../../lib/input/hid-reader';
import { HidCalibrationWizard } from './HidCalibrationWizard';
import { DEVICE_PROFILES, findPresetByVidPid } from '@shared/input';
import { WebHidCard } from './WebHidCard';
import { GamepadCard } from './GamepadCard';
import { CONTROLLER_ICON_MAP, resolveDeviceName } from './input-cal-visuals';
import { useInputCalibration } from './useInputCalibration';
import { DiagnosticsLog } from './DiagnosticsLog';
import './InputCalibration.css';
import './InputCalibration.sticks.css';
import './InputCalibration.hid.css';

const S: Record<string, CSSProperties> = {
  hint: { fontSize: 'var(--text-sm)', opacity: 0.6 },
  metaXs: { fontSize: 'var(--text-xs)', color: 'var(--c-text-muted)' },
  mt: { marginTop: 'var(--space-sm)' },
  sm: { fontSize: 'var(--text-sm)' },
  dim50: { opacity: 0.5 },
  iconDim: { width: 28, height: 28, opacity: 0.5, flexShrink: 0 },
  badgeSurface: { background: 'var(--c-surface)' },
  badgeInfo: { background: 'var(--c-info)', marginLeft: 4 },
  cardNote: { fontSize: 'var(--text-sm)', color: 'var(--c-text-muted)', margin: 'var(--space-sm) 0 0' },
};

const InputCalibration = () => {
  const {
    gamepads, events, logRef, webHidConnected, webHidStates, webHidDiag,
    calibrating, setCalibrating, lastCalibration, stickCalibrationStore,
    hidDeviceInfo, handleCalibrationComplete, handleStickCalibrationComplete,
    handleTriggerCalibrationComplete,
  } = useInputCalibration();

  const anyHidConnected = webHidConnected || webHidReader.getConnectedDeviceKeys().length > 0;

  return (
    <Box className="input-cal">
      {/* Header */}
      <Box className="input-cal__header">
        <Text className={`input-cal__status ${anyHidConnected ? 'input-cal__status--connected' : 'input-cal__status--disconnected'}`}>
          {anyHidConnected
            ? `Connected ${'•'} ${gamepads.length + webHidReader.getConnectedDeviceKeys().length} controller(s)`
            : `${gamepads.length} controller(s) detected`}
        </Text>
      </Box>

      {/* Actions */}
      <Box className="input-cal__actions">
        <Text style={S.hint}>
          Controllers auto-connect via node-hid
        </Text>
        <Button
          variant="tertiary"
          size="sm"
          onClick={() => setCalibrating(true)}
          disabled={!anyHidConnected}
        >
          Calibrate
        </Button>
      </Box>

      {/* Calibration Wizard */}
      {calibrating && (
        <Box className="input-cal__section">
          <HidCalibrationWizard
            onComplete={handleCalibrationComplete}
            onCancel={() => setCalibrating(false)}
            deviceKey={webHidReader.getConnectedDeviceKeys()[0]}
          />
        </Box>
      )}

      {/* Calibration Result */}
      {lastCalibration && !calibrating && (
        <Box className="input-cal__section">
          <Box className="input-cal__result">
            <Box className="input-cal__result-header">
              <Text className="input-cal__result-title">Calibration Complete</Text>
              <Text style={S.metaXs}>
                {lastCalibration.name} {'—'} {Object.keys(lastCalibration.buttons).length} buttons, {Object.keys(lastCalibration.axes).length} axes
              </Text>
            </Box>
            <Box as="pre">{JSON.stringify(lastCalibration, null, 2)}</Box>
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => navigator.clipboard.writeText(JSON.stringify(lastCalibration, null, 2))}
              style={S.mt}
            >
              Copy JSON
            </Button>
          </Box>
        </Box>
      )}

      {/* Controller Cards */}
      <Box className="input-cal__section">
        <Box className="input-cal__section-title">Controllers</Box>

        {gamepads.length === 0 && !anyHidConnected && hidDeviceInfo.filter(d => d.vendorId !== '046d').length === 0 && (
          <Box className="input-cal__empty">
            <Text as="p">No controllers detected.</Text>
            <Text as="p" style={S.sm}>Press a button on your gamepad to activate it.</Text>
          </Box>
        )}

        <Box className="input-cal__cards">
          {/* HID Controller Cards */}
          {anyHidConnected && (() => {
            const keys = new Set(webHidReader.getConnectedDeviceKeys());
            return [...keys].map(key => {
              const [vidHex, pidHex] = key.split(':');
              const deviceProfile = DEVICE_PROFILES.find(
                p => p.vendorId === vidHex?.padStart(4, '0') && p.productId === pidHex?.padStart(4, '0')
              ) ?? null;

              const profileButtons = deviceProfile?.buttons.length ?? 0;
              const profileAxes = deviceProfile?.axes.length ?? 0;
              const state = webHidStates.get(key) ?? {
                deviceKey: key,
                buttons: new Array(profileButtons).fill(false),
                axes: new Array(profileAxes).fill(0),
                timestamp: 0,
              };
              return (
                <WebHidCard
                  key={key}
                  deviceKey={key}
                  state={state}
                  profile={deviceProfile}
                  hasStickCal={!!stickCalibrationStore[key]}
                  existingStickCal={stickCalibrationStore[key] ?? null}
                  onStickCalibrationComplete={(cal) => handleStickCalibrationComplete(cal)}
                  onTriggerCalibrationComplete={(axisIndex, cal) => handleTriggerCalibrationComplete(key, axisIndex, cal)}
                />
              );
            });
          })()}

          {/* Standard Gamepad API Cards */}
          {gamepads.map(gp => (
            <GamepadCard key={gp.index} gamepad={gp} hidDevices={hidDeviceInfo} />
          ))}

          {/* Inactive controllers */}
          {hidDeviceInfo
            .filter(d => {
              const key = `${d.vendorId}:${d.productId}`;
              if (webHidReader.getConnectedDeviceKeys().includes(key)) return false;
              if (gamepads.some(gp => {
                const gpLower = gp.id.toLowerCase();
                if (gpLower.includes(`vendor: ${d.vendorId}`) && gpLower.includes(`product: ${d.productId}`)) return true;
                if (d.vendorId === '045e' && /xbox|xinput/i.test(gp.id)) return true;
                return false;
              })) return false;
              if (d.vendorId === '046d') return false;
              return true;
            })
            .map(d => {
              const key = `${d.vendorId}:${d.productId}`;
              const preset = findPresetByVidPid(d.vendorId, d.productId);
              const family = preset?.family;
              const icon = family ? CONTROLLER_ICON_MAP[family] : null;
              const name = resolveDeviceName(d.vendorId, d.productId, d.product);
              const isGeneric = !preset || preset.id === 'generic';
              return (
                <Box key={`inactive-${key}`} className="input-cal__card" style={S.dim50}>
                  <Box className="input-cal__card-header">
                    {icon && (
                      <Image src={icon} alt="" draggable={false} style={S.iconDim} />
                    )}
                    <Text className="input-cal__card-badge" style={S.badgeSurface}>
                      INACTIVE
                    </Text>
                    <Text className="input-cal__card-badge" style={S.badgeInfo}>
                      HID
                    </Text>
                    <Text className="input-cal__card-name">{name}</Text>
                    <Text className="input-cal__card-meta">{key}</Text>
                  </Box>
                  <Text as="p" style={S.cardNote}>
                    {isGeneric
                      ? 'Press a button to activate, then use Calibrate to map this controller.'
                      : 'Press a button to activate this controller.'}
                  </Text>
                </Box>
              );
            })
          }
        </Box>
      </Box>

      {/* Diagnostics */}
      <DiagnosticsLog events={events} webHidDiag={webHidDiag} logRef={logRef} />
    </Box>
  );
};

export { InputCalibration };
