/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The items the player holds, as a grid of icons, in a default, compact or in game layout.',
  useWhen: ['In the inventory widget and the tracker pop out.'],
  avoidWhen: [{ case: 'A list of items with the same few fields.', use: 'ItemList' }],
  rules: ['Pass the set of held item ids; absent items show dimmed.'],
  a11y: ['Each slot has the item name as its title.'],
  tree: { path: ['data', 'items of a catalogue, as cards'], rule: 'The inventory of a run.' },
  example: `import { TrackerInventory } from '@app/compounds/TrackerInventory';

const Mounted = () => <TrackerInventory inventory={new Set()} />;
`,
  propsHash: '4d44a6ef3d7ba23c',
} satisfies ComponentUsage;

export { usage };
