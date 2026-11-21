/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';

const DISABLED_SETTING_MESSAGES: Record<string, Message> = {
  vanillaSafe: msg('settings-controls:disabled.vanilla-safe'),
  randomizer: msg('settings-controls:disabled.randomizer'),
  cheatsEnabled: msg('settings-controls:disabled.cheats-enabled'),
  trackerEnabled: msg('settings-controls:disabled.tracker-enabled'),
  devNavigationData: msg('settings-controls:disabled.dev-navigation-data'),
  developerTools: msg('settings-controls:disabled.developer-tools'),
  onlineOnly: msg('settings-controls:disabled.online-only'),
  japaneseGraphics: msg('settings-controls:disabled.japanese-graphics'),
  languageGraphics: msg('settings-controls:disabled.language-graphics'),
  mobileOnly: msg('settings-controls:disabled.mobile-only'),
};

export { DISABLED_SETTING_MESSAGES };
