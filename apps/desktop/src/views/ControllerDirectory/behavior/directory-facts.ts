/* @layer renderer-components @kind logic */
import type { FactsPanelGroup } from '@drizztdourden08/tessera/composites';
import type { DirectoryCounts } from './directory-facts.type';

const directoryFacts = (counts: DirectoryCounts): FactsPanelGroup[] => {
  const { connected, mapping } = counts;
  const own = mapping.entries.filter((entry) => entry.source === 'user').length;
  return [[
    { label: 'Connected', value: String(connected), mono: true },
    ...(mapping.complete
      ? [
        { label: 'Known to SDL3', value: String(mapping.entries.length), mono: true },
        { label: 'Your mappings', value: String(own), mono: true },
      ]
      : []),
  ]];
};

export { directoryFacts };
