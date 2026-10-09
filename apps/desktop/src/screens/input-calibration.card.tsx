/* @layer renderer-app @kind component */
import type { ScreenMeta } from '@drizztdourden08/brock-react';
import { InputCalibration } from '@domains/app/views/InputTester';

const meta: ScreenMeta = { title: 'Input Calibration', icon: 'gamepad-2', menu: 'Advanced', requiresProfile: false, keywords: ['controller', 'gamepad', 'stick', 'trigger', 'hid', 'rumble', 'calibrate'] };

const InputCalibrationCard = () => <InputCalibration />;

export default InputCalibrationCard;
export { meta };
