/* @layer renderer-components @kind component */
/** Sticks + triggers panel for a WebHID controller card, derived from profile axes. */
import type { WebHidInputState } from '../../../../../../lib/input/hid-reader';
import type { DEVICE_PROFILES } from '@shared/input';
import type { CalibrationTarget } from './web-hid-card-types';
import { AxisRecordButton, StickCircle, TriggerBar } from './input-cal-visuals';

interface WebHidAxesProps {
  state: WebHidInputState;
  profile: (typeof DEVICE_PROFILES)[number] | null;
  onCalibrate: (target: CalibrationTarget) => void;
}

const WebHidAxes = ({ state, profile, onCalibrate }: WebHidAxesProps) => {
  const axesDef = profile?.axes ?? [];
  const stickPairs: { label: string; xIdx: number; yIdx: number }[] = [];
  const triggerAxes: { label: string; idx: number }[] = [];
  let i = 0;
  while (i < axesDef.length) {
    if (axesDef[i].category === 'stick' && i + 1 < axesDef.length && axesDef[i + 1].category === 'stick') {
      stickPairs.push({
        label: axesDef[i].label.replace(/ X$/, ''),
        xIdx: i,
        yIdx: i + 1,
      });
      i += 2;
    } else if (axesDef[i].category === 'trigger') {
      triggerAxes.push({ label: axesDef[i].label, idx: i });
      i++;
    } else {
      i++;
    }
  }
  if (stickPairs.length === 0 && triggerAxes.length === 0) return null;
  const stickIconPrefixes = profile?.id === 'gamecube-wireless'
    ? ['gc-stick-l', 'gc-stick-c']
    : profile?.id === 'switch-pro-2'
      ? ['switch-stick-l', 'switch-stick-r']
      : [];
  return (
    <div className="input-cal__sticks">
      {stickPairs.map((s, pairIdx) => (
        <div key={s.xIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <StickCircle
            x={state.axes[s.xIdx] ?? 0}
            y={state.axes[s.yIdx] ?? 0}
            label={s.label}
            iconPrefix={stickIconPrefixes[pairIdx]}
          />
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <AxisRecordButton
              getValues={() => [state.axes[s.xIdx] ?? 0, state.axes[s.yIdx] ?? 0]}
              label={s.label}
            />
            <button
              className="input-cal__btn"
              style={{ fontSize: 9, padding: '1px 5px', lineHeight: 1.2 }}
              onClick={() => onCalibrate({ type: 'stick', side: pairIdx === 0 ? 'left' : 'right' })}
              title={`Calibrate ${s.label}`}
            >Cal</button>
          </div>
        </div>
      ))}
      {triggerAxes.map(t => (
        <div key={t.idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <TriggerBar
            value={state.axes[t.idx] ?? 0}
            label={t.label}
          />
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <AxisRecordButton
              getValues={() => [state.axes[t.idx] ?? 0]}
              label={t.label}
            />
            <button
              className="input-cal__btn"
              style={{ fontSize: 9, padding: '1px 5px', lineHeight: 1.2 }}
              onClick={() => onCalibrate({ type: 'trigger', axisIndex: t.idx, label: t.label })}
              title={`Calibrate ${t.label}`}
            >Cal</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export { WebHidAxes };
