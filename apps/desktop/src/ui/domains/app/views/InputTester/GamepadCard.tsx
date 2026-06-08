/* @layer renderer-components @kind data */
/**
 * GamepadCard — Renders a single standard gamepad's button/axis state.
 */

import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import type { GamepadSnapshot } from '../../../../../lib/input/input-manager';

interface GamepadCardProps {
  gamepad: GamepadSnapshot;
}

const GamepadCard = ({ gamepad: gp }: GamepadCardProps) => {
  return (
    <Box className="input-tester__gamepad">
      <Box className="input-tester__gamepad-header">
        <Text className="input-tester__gamepad-index">#{gp.index}</Text>
        <Text className="input-tester__gamepad-id">{gp.id}</Text>
        <Text className="input-tester__gamepad-mapping">mapping: {gp.mapping || 'none'}</Text>
      </Box>

      <Box className="input-tester__section-label">
        Buttons ({gp.buttons.length})
      </Box>
      <Box className="input-tester__buttons">
        {gp.buttons.map((btn, i) => (
          <Box
            key={i}
            className={`input-tester__button ${
              btn.pressed ? 'input-tester__button--pressed'
                : btn.touched ? 'input-tester__button--touched'
                : 'input-tester__button--idle'
            }`}
            title={`B${i}: pressed=${btn.pressed} touched=${btn.touched} value=${btn.value.toFixed(2)}`}
          >
            {i}
          </Box>
        ))}
      </Box>

      <Box className="input-tester__section-label">
        Axes ({gp.axes.length})
      </Box>
      <Box className="input-tester__axes">
        {gp.axes.map((val, i) => (
          <Box key={i} className="input-tester__axis">
            <Text className="input-tester__axis-label">A{i}</Text>
            <Box className="input-tester__axis-bar">
              <Box
                className="input-tester__axis-fill"
                style={{
                  width: `${Math.abs(val) * 50}%`,
                  ...(val < 0 ? { left: `${50 + val * 50}%` } : { left: '50%' }),
                }}
              />
            </Box>
            <Text className="input-tester__axis-value">{val.toFixed(4)}</Text>
          </Box>
        ))}
      </Box>

      <Box className="input-tester__raw">
        timestamp: {gp.timestamp.toFixed(0)} | connected: {String(gp.connected)}
      </Box>
    </Box>
  );
};

export { GamepadCard };
