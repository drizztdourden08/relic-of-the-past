/* @layer renderer-app @kind component */
import type { ScreenMeta } from '@drizztdourden08/brock-react';
import { InputCalibration } from '@app/views/InputTester';

const meta: ScreenMeta = { title: 'Controllers', icon: 'gamepad-2', bare: true, menu: false, requiresProfile: false, keywords: ['controller', 'gamepad', 'hid', 'rumble', 'diagnostics', 'report', 'raw bytes'] };

const InputCalibrationCard = () => <InputCalibration />;

export default InputCalibrationCard;
export { meta };
