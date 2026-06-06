/**
 * GamepadCard — Standard Gamepad API controller display with buttons, sticks, triggers.
 */

import { DEVICE_PROFILES, findPresetByVidPid, parseGamepadId } from '@shared/input';
import type { GamepadSnapshot } from '../../../../lib/input/input-manager';
import { getButtonIconUrl } from '../data/button-icons';
import { vibrateGamepad, vibrateGamepadPattern } from '../../../../lib/input/vibration';
import { AxisRecordButton, CONTROLLER_ICON_MAP, StickCircle, TriggerBar } from './input-cal-visuals';

interface HidDeviceInfo {
  vendorId: string;
  productId: string;
  product: string;
  manufacturer: string;
}

/** VID patterns for name-based matching when Gamepad API doesn't embed VID:PID */
const VENDOR_PATTERNS: [RegExp, string][] = [
  [/xbox|xinput/i, '045e'],
  [/playstation|dualshock|dualsense/i, '054c'],
  [/switch|nintendo|pro controller/i, '057e'],
];

const findBestXboxDevice = (hidDevices: HidDeviceInfo[]): HidDeviceInfo | undefined => {
  const msDevices = hidDevices.filter(d => d.vendorId === '045e');
  for (const d of msDevices) {
    if (findPresetByVidPid(d.vendorId, d.productId)) return d;
  }
  const controller = msDevices.find(d => /xbox|controller/i.test(d.product));
  if (controller) return controller;
  return msDevices[0];
};

const GamepadCard = ({ gamepad, hidDevices }: { gamepad: GamepadSnapshot; hidDevices: HidDeviceInfo[] }) => {
  const { displayName, detectedVidPid } = (() => {
    const parsed = parseGamepadId(gamepad.id);

    if (parsed) {
      const realDevice = hidDevices.find(d => d.vendorId === parsed.vid);
      if (realDevice) {
        const vidPid = `${realDevice.vendorId}:${realDevice.productId}`;
        const preset = findPresetByVidPid(realDevice.vendorId, realDevice.productId);
        if (preset?.family === 'xbox') return { displayName: 'Xbox Controller', detectedVidPid: vidPid };
        if (preset) return { displayName: preset.name, detectedVidPid: vidPid };
        if (realDevice.product) return { displayName: realDevice.product, detectedVidPid: vidPid };
      }
      const preset = findPresetByVidPid(parsed.vid, parsed.pid);
      if (preset?.family === 'xbox') return { displayName: 'Xbox Controller', detectedVidPid: `${parsed.vid}:${parsed.pid}` };
      if (preset) return { displayName: preset.name, detectedVidPid: `${parsed.vid}:${parsed.pid}` };
    }

    for (const [pattern, vid] of VENDOR_PATTERNS) {
      if (pattern.test(gamepad.id)) {
        const realDevice = vid === '045e'
          ? findBestXboxDevice(hidDevices)
          : hidDevices.find(d => d.vendorId === vid);
        if (realDevice) {
          const vidPid = `${realDevice.vendorId}:${realDevice.productId}`;
          const preset = findPresetByVidPid(realDevice.vendorId, realDevice.productId);
          if (preset?.family === 'xbox') return { displayName: 'Xbox Controller', detectedVidPid: vidPid };
          if (preset) return { displayName: preset.name, detectedVidPid: vidPid };
          if (realDevice.product) return { displayName: realDevice.product, detectedVidPid: vidPid };
        }
        if (vid === '045e') return { displayName: 'Xbox Controller', detectedVidPid: null };
      }
    }

    return { displayName: gamepad.id, detectedVidPid: null };
  })();

  const isXbox = /xbox|xinput/i.test(gamepad.id) || detectedVidPid?.startsWith('045e') || false;
  const xboxProfile = isXbox ? DEVICE_PROFILES.find(p => p.id === 'xbox') : null;
  const controllerIcon = isXbox ? CONTROLLER_ICON_MAP['xbox'] : null;

  return (
    <div className="input-cal__card">
      <div className="input-cal__card-header">
        {controllerIcon && (
          <img src={controllerIcon} alt="" draggable={false} style={{ width: 28, height: 28, opacity: 0.7, flexShrink: 0 }} />
        )}
        <span className="input-cal__card-badge">#{gamepad.index}</span>
        <span className="input-cal__card-badge" style={{ background: isXbox ? '#166534' : '#7c3aed', marginLeft: 4 }}>
          {isXbox ? 'XInput' : 'WebAPI'}
        </span>
        <span className="input-cal__card-name">{displayName}</span>
        <span className="input-cal__card-meta">{detectedVidPid ?? (gamepad.mapping || 'unmapped')}</span>
      </div>

      {/* Buttons — with Xbox icons if recognized, otherwise numbered */}
      <div className="input-cal__btn-grid">
        {gamepad.buttons.map((btn, i) => {
          const profileBtn = xboxProfile?.buttons[i];
          const iconUrl = profileBtn ? getButtonIconUrl(profileBtn.icon) : null;
          const pressed = btn.pressed;
          return (
            <div
              key={i}
              className={`input-cal__btn-cell ${pressed ? 'input-cal__btn-cell--pressed' : ''}`}
              title={profileBtn ? `${profileBtn.label} (${profileBtn.id})` : `B${i} value=${btn.value.toFixed(2)}`}
            >
              {iconUrl ? (
                <img src={iconUrl} alt={profileBtn!.label} draggable={false} />
              ) : (
                <span style={{ fontSize: 11, fontWeight: 600, color: pressed ? 'var(--color-green-bright)' : 'var(--color-text-muted)' }}>
                  {profileBtn?.label ?? i}
                </span>
              )}
              {profileBtn && (
                <span className="input-cal__btn-cell-label">{profileBtn.label}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticks and triggers — dynamically derived from profile or generic */}
      {(() => {
        const axesDef = xboxProfile?.axes;
        if (axesDef && axesDef.length > 0) {
          const stickPairs: { label: string; xIdx: number; yIdx: number }[] = [];
          const triggerAxes: { label: string; idx: number }[] = [];
          let i = 0;
          while (i < axesDef.length) {
            if (axesDef[i].category === 'stick' && i + 1 < axesDef.length && axesDef[i + 1].category === 'stick') {
              stickPairs.push({ label: axesDef[i].label.replace(/ X$/, ''), xIdx: i, yIdx: i + 1 });
              i += 2;
            } else if (axesDef[i].category === 'trigger') {
              triggerAxes.push({ label: axesDef[i].label, idx: i });
              i++;
            } else {
              i++;
            }
          }
          const stickIconPrefixes = isXbox ? ['xbox-stick-l', 'xbox-stick-r'] : [];
          return (
            <div className="input-cal__sticks">
              {stickPairs.map((s, pairIdx) => (
                <div key={s.xIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <StickCircle
                    x={gamepad.axes[s.xIdx] ?? 0}
                    y={gamepad.axes[s.yIdx] ?? 0}
                    label={s.label}
                    iconPrefix={stickIconPrefixes[pairIdx]}
                  />
                  <AxisRecordButton
                    getValues={() => [gamepad.axes[s.xIdx] ?? 0, gamepad.axes[s.yIdx] ?? 0]}
                    label={s.label}
                  />
                </div>
              ))}
              {triggerAxes.map((t, ti) => {
                const triggerBtnIdx = 6 + ti;
                const value = gamepad.buttons[triggerBtnIdx]?.value ?? gamepad.axes[t.idx] ?? 0;
                return <TriggerBar key={t.idx} value={value} label={t.label} />;
              })}
            </div>
          );
        }
        const pairs: { xIdx: number; yIdx: number }[] = [];
        for (let j = 0; j + 1 < gamepad.axes.length; j += 2) {
          pairs.push({ xIdx: j, yIdx: j + 1 });
        }
        if (pairs.length === 0) return null;
        return (
          <div className="input-cal__sticks">
            {pairs.map((p, k) => (
              <StickCircle key={p.xIdx} x={gamepad.axes[p.xIdx] ?? 0} y={gamepad.axes[p.yIdx] ?? 0} label={`Stick ${k + 1}`} />
            ))}
          </div>
        );
      })()}

      {/* Vibration tests */}
      {xboxProfile?.supportsVibration && (
      <div style={{ marginTop: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
        <button className="input-cal__btn" onClick={() => vibrateGamepad(gamepad.index, 100, { intensity: 1.0 })}>
          100ms
        </button>
        <button className="input-cal__btn" onClick={() => vibrateGamepad(gamepad.index, 250, { intensity: 1.0 })}>
          250ms
        </button>
        <button className="input-cal__btn" onClick={() => vibrateGamepad(gamepad.index, 1000, { intensity: 1.0 })}>
          1000ms
        </button>
        <button className="input-cal__btn" onClick={() => vibrateGamepadPattern(gamepad.index, [{ durationMs: 100, intensity: 1.0 }, { durationMs: 100, intensity: 1.0 }, { durationMs: 100, intensity: 1.0 }], 50)}>
          3×100ms
        </button>
        <button className="input-cal__btn" onClick={() => vibrateGamepadPattern(gamepad.index, [{ durationMs: 100, intensity: 1.0 }, { durationMs: 100, intensity: 1.0 }, { durationMs: 1000, intensity: 1.0 }, { durationMs: 100, intensity: 1.0 }, { durationMs: 100, intensity: 1.0 }], 50)}>
          2-long-2
        </button>
      </div>
      )}
    </div>
  );
};

export { GamepadCard };
export type { HidDeviceInfo };
