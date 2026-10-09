/* @layer renderer-app @kind types */
import type { ControlRowLook } from '../ControlRow/ControlRow.type';

interface KeyedControlRowProps extends ControlRowLook {
  settingKey: string;
}

export type { KeyedControlRowProps };
