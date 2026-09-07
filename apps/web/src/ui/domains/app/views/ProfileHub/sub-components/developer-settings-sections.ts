/* @layer renderer-components @kind logic */
/** Section/subsection config for the Developer settings tab. */
import type { Section } from '../../../compounds/SettingsLayout';

const SECTIONS: Section[] = [
  {
    id: 'developer-instrumentation',
    title: 'Instrumentation',
    subsections: [
      {
        id: 'developer-instrumentation-options',
        title: 'Options',
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
    ],
  },
  {
    id: 'developer-debugger-options',
    title: 'Debugger options',
    subsections: [
      {
        id: 'developer-debugger-options-list',
        title: 'Debug reporting',
        items: [
          {
            key: 'allowDebugLogging',
            label: 'Allow debugging logs tracking',
            description: 'Turns on the same verbose logging this app uses in development (Electron, crash, and performance logs), and adds a titlebar capture button (Tab) plus a floating button for sending a packaged debug report to the team from any save state.',
            keywords: 'debug logs tracking report crash performance capture titlebar floating button contributor',
          },
        ],
      },
    ],
  },
];

export { SECTIONS };
