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
        ],
      },
    ],
  },
];

export { SECTIONS };
