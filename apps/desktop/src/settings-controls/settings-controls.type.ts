/* @layer renderer-app @kind types */
import type { ReactNode } from 'react';
import type { LockOverlayProps, RenderControl, SettingLockCause } from '@drizztdourden08/brock-react';
import type { GameSettings } from '@shared/types/settings';
import type { AppSettings } from '@app/settings.type';

type SettingsPatch = (patch: Partial<GameSettings>) => void;

interface ControlContext {
  settings: GameSettings;
  onChange: SettingsPatch;
  disabled: boolean;
}

type ControlRenderer = (key: string, ctx: ControlContext) => ReactNode | null;

interface SettingsControls {
  renderControl: RenderControl<AppSettings>;
  isDisabled: (key: string, settings: AppSettings) => boolean;
  lockCauseOf: (key: string, settings: AppSettings) => SettingLockCause | null;
  lockOverlay: (props: LockOverlayProps) => ReactNode;
}

export type { ControlContext, ControlRenderer, SettingsControls, SettingsPatch };
