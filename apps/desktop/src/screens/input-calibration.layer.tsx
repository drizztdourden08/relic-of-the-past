/* @layer renderer-app @kind component */
import type { CardProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { FreeWindow } from '@app/shell/free-window';
import { InputCalibration } from '@app/views/InputTester';

const meta: ScreenMeta = { title: 'Controllers', icon: 'gamepad-2', menu: false, requiresProfile: false, keywords: ['controller', 'gamepad', 'hid', 'rumble', 'diagnostics', 'report', 'raw bytes'] };

const InputCalibrationLayer = (props: CardProps) => (
  <FreeWindow title={meta.title ?? 'Controllers'} scroll onClose={props.close}><InputCalibration /></FreeWindow>
);

export default InputCalibrationLayer;
export { meta };
