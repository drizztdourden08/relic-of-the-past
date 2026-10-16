/* @layer renderer-components @kind logic */
import type { DataLocation } from '@drizztdourden08/brock-core';
import type { FactsPanelGroup } from '@drizztdourden08/tessera/composites';

const locationFacts = (location: DataLocation): FactsPanelGroup[] => [[
  { label: 'Location', value: location.osLabel },
  { label: 'Folder', value: location.path, mono: true, copyable: true },
]];

export { locationFacts };
