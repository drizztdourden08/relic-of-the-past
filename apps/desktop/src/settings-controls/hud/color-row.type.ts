/* @layer renderer-app @kind types */
import type { SettingsPatch } from '../settings-controls.type';
import type { ColorKey } from './hud.type';

interface ColorRowProps {
  settingKey: ColorKey;
  value: string;
  original: string;
  onChange: SettingsPatch;
  disabled: boolean;
}

export type { ColorRowProps };
