/* @layer renderer-components @kind data */
/**
 * GamepadCard — Renders a single standard gamepad's button/axis state.
 */

import type { GamepadSnapshot } from '../../../lib/input/input-manager';

interface GamepadCardProps {
  gamepad: GamepadSnapshot;
}

const GamepadCard = ({ gamepad: gp }: GamepadCardProps) => {
  return (
    <div className="input-tester__gamepad">
      <div className="input-tester__gamepad-header">
        <span className="input-tester__gamepad-index">#{gp.index}</span>
        <span className="input-tester__gamepad-id">{gp.id}</span>
        <span className="input-tester__gamepad-mapping">mapping: {gp.mapping || 'none'}</span>
      </div>

      <div className="input-tester__section-label">
        Buttons ({gp.buttons.length})
      </div>
      <div className="input-tester__buttons">
        {gp.buttons.map((btn, i) => (
          <div
            key={i}
            className={`input-tester__button ${
              btn.pressed ? 'input-tester__button--pressed'
                : btn.touched ? 'input-tester__button--touched'
                : 'input-tester__button--idle'
            }`}
            title={`B${i}: pressed=${btn.pressed} touched=${btn.touched} value=${btn.value.toFixed(2)}`}
          >
            {i}
          </div>
        ))}
      </div>

      <div className="input-tester__section-label">
        Axes ({gp.axes.length})
      </div>
      <div className="input-tester__axes">
        {gp.axes.map((val, i) => (
          <div key={i} className="input-tester__axis">
            <span className="input-tester__axis-label">A{i}</span>
            <div className="input-tester__axis-bar">
              <div
                className="input-tester__axis-fill"
                style={{
                  width: `${Math.abs(val) * 50}%`,
                  ...(val < 0 ? { left: `${50 + val * 50}%` } : { left: '50%' }),
                }}
              />
            </div>
            <span className="input-tester__axis-value">{val.toFixed(4)}</span>
          </div>
        ))}
      </div>

      <div className="input-tester__raw">
        timestamp: {gp.timestamp.toFixed(0)} | connected: {String(gp.connected)}
      </div>
    </div>
  );
};

export { GamepadCard };
