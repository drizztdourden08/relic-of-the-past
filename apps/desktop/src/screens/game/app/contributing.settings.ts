/* @layer renderer-app @kind config */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { ScreenMeta, SectionDef } from '@drizztdourden08/brock-react';

const meta: ScreenMeta = { title: 'Contributing', icon: 'braces', order: 1, keywords: ['developer', 'debug', 'logs', 'sanctuary', 'account', 'contributor'] };

const sections: SectionDef[] = [
  {
    id: 'developer-instrumentation',
    title: msg('settings-contributing:section.developer-instrumentation.title'),
    items: [
      { key: 'developerToolsEnabled', label: msg('settings-contributing:developer-tools-enabled.label'), description: msg('settings-contributing:developer-tools-enabled.description'), keywords: 'developer mode debug instrumentation transition event hook navigation auto flood' },
      { key: 'experimentalFeaturesEnabled', label: msg('settings-contributing:experimental-features-enabled.label'), description: msg('settings-contributing:experimental-features-enabled.description'), hint: msg('settings-contributing:experimental-features-enabled.hint'), keywords: 'experimental unfinished hud layout modern gba archipelago online' },
      { key: 'devNavigationData', label: msg('settings-contributing:dev-navigation-data.label'), description: msg('settings-contributing:dev-navigation-data.description'), hint: msg('settings-contributing:dev-navigation-data.hint'), keywords: 'navigation room grid sprite flood fill simulator data reads widget' },
    ],
  },
  {
    id: 'developer-sanctuary',
    title: msg('settings-contributing:section.developer-sanctuary.title'),
    items: [
      { key: 'sanctuaryAccount', label: msg('settings-contributing:sanctuary-account.label'), description: msg('settings-contributing:sanctuary-account.description'), keywords: 'sanctuary account sign in hub contributor device code reports' },
    ],
  },
  {
    id: 'developer-debug-reporting',
    title: msg('settings-contributing:section.developer-debug-reporting.title'),
    items: [
      { key: 'allowDebugLogging', label: msg('settings-contributing:allow-debug-logging.label'), description: msg('settings-contributing:allow-debug-logging.description'), keywords: 'debug logs tracking report crash performance capture titlebar floating button contributor' },
    ],
  },
];

export default sections;
export { meta };
