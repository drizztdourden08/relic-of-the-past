/* @layer renderer-components @kind logic */
import type { DataLocation } from '@drizztdourden08/brock-core';
import type { FactsPanelGroup } from '@drizztdourden08/tessera/composites';

const locationFacts = (location: DataLocation, labels: { location: string; folder: string }): FactsPanelGroup[] => [[
  { label: labels.location, value: location.osLabel },
  { label: labels.folder, value: location.path, mono: true, copyable: true },
]];

export { locationFacts };
