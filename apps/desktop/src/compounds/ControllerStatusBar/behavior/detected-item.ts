/* @layer renderer-components @kind logic */
import { DETECTED_ICON } from '../ControllerStatusBar.constants';
import type { StatusItemProps } from '../ControllerStatusBar.type';

const detectedItem = (detected: boolean | undefined): StatusItemProps | null =>
  (detected === undefined ? null : { icon: DETECTED_ICON, label: detected ? 'Detected' : 'Not detected', dim: !detected });

export { detectedItem };
