/* @layer renderer-app @kind types */
import type { ReactNode } from 'react';
import type { Text } from '@drizztdourden08/brock-core/i18n';
import type { LockOverlayProps, RenderControl } from '@drizztdourden08/brock-react';
import type { GameSettings } from '@rotp/features';
import type { AppSettings } from '@app/settings.type';

type SettingsPatch = (patch: Partial<GameSettings>) => void;

type TextOf = (value: Text) => string;

interface ControlContext {
  settings: GameSettings;
  onChange: SettingsPatch;
  disabled: boolean;
}

interface SettingsControls {
  renderControl: RenderControl<AppSettings>;
  isDisabled: (key: string, settings: AppSettings) => boolean;
  lockOverlay: (props: LockOverlayProps) => ReactNode;
}

export type { ControlContext, SettingsControls, SettingsPatch, TextOf };
