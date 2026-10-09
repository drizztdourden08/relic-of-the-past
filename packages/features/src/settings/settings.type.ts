/* @layer shared-types @kind types */
import type { OnlineNoticeSettings } from '../archipelago/online-notice-settings/online-notice-settings.type';
import type { QuietReceiptSettings } from '@rotp/game-data';
import type { AspectSettings } from './aspect-settings.type';
import type { AudioSettings } from './audio-settings.type';
import type { ControlSettings } from './control-settings.type';
import type { DeveloperSettings } from './developer-settings.type';
import type { DialogSettings } from './dialog-settings.type';
import type { GameplaySettings } from './gameplay-settings.type';
import type { GeneralSettings } from './general-settings.type';
import type { GraphicsSettings } from './graphics-settings.type';
import type { HudSettings } from './hud-settings.type';

interface GameSettings extends
  OnlineNoticeSettings,
  QuietReceiptSettings,
  GeneralSettings,
  AspectSettings,
  GraphicsSettings,
  GameplaySettings,
  AudioSettings,
  DialogSettings,
  HudSettings,
  ControlSettings,
  DeveloperSettings {}

export type { GameSettings };
