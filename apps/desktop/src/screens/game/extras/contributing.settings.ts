/* @layer renderer-app @kind config */
import type { ScreenMeta, Section } from '@drizztdourden08/brock-react';

const meta: ScreenMeta = { title: 'Contributing', icon: 'braces', order: 4, keywords: ['developer', 'debug', 'logs', 'sanctuary', 'account', 'contributor'] };

const sections: Section[] = [
  {
    id: 'developer-instrumentation',
    title: 'Instrumentation',
    items: [
      { key: 'developerToolsEnabled', label: 'Developer Tools', description: "Master gate for developer-only instrumentation, such as the Navigation widget's transition-settled event. Off by default: the underlying C hooks make zero host-calls while this is off. Purely observational, never changes gameplay.", hint: 'On, the developer tools and their game hooks work. Gameplay stays the same.', keywords: 'developer debug instrumentation transition event hook navigation auto flood' },
      { key: 'devNavigationData', label: 'Navigation Data', description: 'Feeds the Location & Navigation widget, the flood fill, and the simulator with room/grid/sprite reads. Also needs Developer Tools on above. With either off, those reads return nothing while the rest of Developer Tools keeps working.', hint: 'On, the navigation widget, flood fill and simulator get room data. Needs Developer Tools.', keywords: 'navigation room grid sprite flood fill simulator data reads widget' },
    ],
  },
  {
    id: 'developer-sanctuary',
    title: 'Sanctuary account',
    items: [
      { key: 'sanctuaryAccount', label: 'Sanctuary account', description: 'Sign in so bug reports carry your name and appear on the hub.', hint: 'Sign in to put your name on the bug reports you send.', keywords: 'sanctuary account sign in hub contributor device code reports' },
    ],
  },
  {
    id: 'developer-debug-reporting',
    title: 'Debug Reporting',
    items: [
      { key: 'allowDebugLogging', label: 'Allow debugging logs tracking', description: 'Turns on the same verbose logging this app uses in development (Electron, crash, and performance logs), and adds a titlebar capture button (Tab) plus a floating button for sending a packaged debug report to the team from any save state.', hint: 'On, the app keeps detailed logs and shows the debug report buttons.', keywords: 'debug logs tracking report crash performance capture titlebar floating button contributor' },
    ],
  },
];

export default sections;
export { meta };
