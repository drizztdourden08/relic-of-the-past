/* @layer renderer-app @kind config */
import type { ScreenMeta, Section } from '@drizztdourden08/brock-react';

const meta: ScreenMeta = { title: 'Contributing', icon: 'braces', order: 1, keywords: ['developer', 'debug', 'logs', 'sanctuary', 'account', 'contributor'] };

const sections: Section[] = [
  {
    id: 'developer-instrumentation',
    title: 'Instrumentation',
    items: [
      { key: 'developerToolsEnabled', label: 'Developer Mode', description: "Turns on developer tools.", hint: 'On, developer tools and experimental features can be enabled below.', keywords: 'developer mode debug instrumentation transition event hook navigation auto flood' },
      { key: 'experimentalFeaturesEnabled', label: 'Experimental Features', description: 'Enables unfinished features: the HUD Layout Editor, Modern HUD and controls, GBA settings, and Archipelago online play. Turning this off also turns off Modern HUD and the extra dungeon.', hint: 'Needs Developer Mode. These features are unfinished and may have bugs.', keywords: 'experimental unfinished hud layout modern gba archipelago online' },
      { key: 'devNavigationData', label: 'Navigation Data', description: 'Room, grid and sprite data for the Location & Navigation widget, the flood fill and the simulator.', hint: 'On, the navigation widget, flood fill and simulator get room data. Needs Developer Mode.', keywords: 'navigation room grid sprite flood fill simulator data reads widget' },
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
      { key: 'allowDebugLogging', label: 'Allow debugging logs tracking', description: 'Keeps detailed logs and adds a titlebar capture button (Tab) and a floating button for sending a debug report.', hint: 'On, the app keeps detailed logs and shows the debug report buttons.', keywords: 'debug logs tracking report crash performance capture titlebar floating button contributor' },
    ],
  },
];

export default sections;
export { meta };
