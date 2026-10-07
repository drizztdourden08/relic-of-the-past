/* @layer renderer-components @kind logic */
/** Section config for the Developer settings tab. */
import type { Section } from '../../../compounds/SettingsLayout';

/** The row DeveloperSettings swaps for the account card; it maps to no setting. */
const SANCTUARY_ACCOUNT_KEY = 'sanctuaryAccount';

const SECTIONS: Section[] = [
  {
    id: 'developer-instrumentation',
    title: 'Instrumentation',
    items: [
      {
        key: 'developerToolsEnabled',
        label: 'Developer Tools',
        description: 'Master gate for developer-only instrumentation, such as the Navigation widget\'s transition-settled event. Off by default: the underlying C hooks make zero host-calls while this is off. Purely observational, never changes gameplay.',
        keywords: 'developer debug instrumentation transition event hook navigation auto flood',
      },
      {
        key: 'devNavigationData',
        label: 'Navigation Data',
        description: 'Feeds the Location & Navigation widget, the flood fill, and the simulator with room/grid/sprite reads. Also needs Developer Tools on above. With either off, those reads return nothing while the rest of Developer Tools keeps working.',
        keywords: 'navigation room grid sprite flood fill simulator data reads widget',
      },
    ],
  },
  {
    id: 'developer-sanctuary',
    title: 'Sanctuary account',
    items: [
      {
        // Not a GameSettings key: DeveloperSettings renders the account card for it.
        key: SANCTUARY_ACCOUNT_KEY,
        label: 'Sanctuary account',
        description: 'Sign in so bug reports carry your name and appear on the hub.',
        keywords: 'sanctuary account sign in hub contributor device code reports',
      },
    ],
  },
  {
    id: 'developer-debug-reporting',
    title: 'Debug Reporting',
    items: [
      {
        key: 'allowDebugLogging',
        label: 'Allow debugging logs tracking',
        description: 'Turns on the same verbose logging this app uses in development (Electron, crash, and performance logs), and adds a titlebar capture button (Tab) plus a floating button for sending a packaged debug report to the team from any save state.',
        keywords: 'debug logs tracking report crash performance capture titlebar floating button contributor',
      },
    ],
  },
];

export { SECTIONS, SANCTUARY_ACCOUNT_KEY };
