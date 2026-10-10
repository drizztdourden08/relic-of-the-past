/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'Edits the player sprite sheet: its palette, its preview and the files it is saved to.',
  useWhen: ['As the body of the characters page of the studios.'],
  avoidWhen: [{ case: 'Rows of records to sort and filter.', use: 'DataTable' }],
  rules: ['Pass the ROM statuses and a confirm callback for deletes.'],
  a11y: ['Every colour swatch is a button with its own label.'],
  tree: { path: ['a full screen view', 'one big custom surface, such as calibration'], rule: 'The player sprite editor.' },
  example: `import { PlayerSpriteStudio } from '@app/views/PlayerSpriteStudio';\n\nconst Page = () => <PlayerSpriteStudio romStatuses={[]} onDeleteConfirm={() => undefined} />;\n`,
  propsHash: '012b16b90eadf297',
} satisfies ComponentUsage;

export { usage };
