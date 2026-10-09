/* @layer renderer-app @kind logic */
import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { renderAudioControl } from './audio/render-audio-control';
import { renderBugFixControl } from './bugfixes/render-bug-fix-control';
import { renderDisplayControl } from './display/render-display-control';
import { renderGameplayControl } from './gameplay/render-gameplay-control';
import { renderGraphicsControl } from './graphics/render-graphics-control';
import { renderHapticsControl } from './haptics/render-haptics-control';
import { renderHudControl } from './hud/render-hud-control';
import { renderNoticeControl } from './notices/render-notice-control';
import { renderOnlineControl } from './online/render-online-control';
import { isSettingDisabled } from './is-setting-disabled';
import type { SettingsPatch } from './settings-controls.type';

const renderSettingControl = (key: string, settings: GameSettings, onChange: SettingsPatch): ReactNode | null => {
  const ctx = { settings, onChange, disabled: isSettingDisabled(key, settings) };
  return renderDisplayControl(key, ctx)
    ?? renderGraphicsControl(key, ctx)
    ?? renderGameplayControl(key, ctx)
    ?? renderAudioControl(key, ctx)
    ?? renderHudControl(key, ctx)
    ?? renderHapticsControl(key, ctx)
    ?? renderBugFixControl(key, ctx)
    ?? renderOnlineControl(key, ctx)
    ?? renderNoticeControl(key);
};

export { renderSettingControl };
