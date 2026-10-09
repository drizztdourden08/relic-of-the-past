/* @layer renderer-lib @kind logic */
import type { DeviceEnvironment } from '../diagnostics.type';
import type { DebugSection } from './section.type';
import { section } from './section';

const inputSection = ({ hidDevices, maxTouchPoints }: DeviceEnvironment): DebugSection => section('Input', [
  'Keyboard: always available',
  `HID controllers (read directly, most controllers on this app): ${hidDevices.length}`,
  ...hidDevices.map((dev, index) => `   ${index + 1}. ${dev}`),
  `Max touch points: ${maxTouchPoints}`,
]);

export { inputSection };
