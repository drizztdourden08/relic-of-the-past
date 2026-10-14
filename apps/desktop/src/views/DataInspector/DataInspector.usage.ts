/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'Browses and edits the game data records of one collection at a time: a side rail of collections, a filtered table and a detail pane with the JSON, the TypeScript and an editor.',
  useWhen: ['As the body of the data page of the studios.'],
  avoidWhen: [{ case: 'Rows of records to sort and filter in an ordinary screen.', use: 'DataTable' }],
  rules: ['Place it once; it reads and writes the game data itself and takes no props.'],
  a11y: ['The side rail, the table and the tabs each answer the keyboard on their own.'],
  tree: { path: ['layout', 'a list beside its detail'], rule: 'The data inspector.' },
  example: `import { DataInspector } from '@app/views/DataInspector';\n\nconst Page = () => <DataInspector />;\n`,
  propsHash: '69a6789bb8733db8',
} satisfies ComponentUsage;

export { usage };
