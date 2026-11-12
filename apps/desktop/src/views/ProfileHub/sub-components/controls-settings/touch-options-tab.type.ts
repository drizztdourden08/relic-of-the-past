/* @layer renderer-components @kind types */
import type { TouchControlsSettings } from '@rotp/features';
import type { SettingsChange } from './controls-settings.type';

interface TouchOptionsTabProps {
  touch: TouchControlsSettings;
  onChange: SettingsChange;
}

export type { TouchOptionsTabProps };
