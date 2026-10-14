/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A side card for one selected item: a title with a close button, optional media, a list of label and value fields, extra content, actions and a notice.',
  useWhen: [
    'The detail of the row picked in a list, shown beside the list.',
    'Any item page that lists its facts as label and value pairs.',
  ],
  avoidWhen: [{ case: 'A form that edits the item.', use: 'Card' }],
  rules: [
    'Pass the facts as fields; each label must be unique inside the pane.',
    'Put buttons in actions and a short result line in notice.',
  ],
  a11y: ['The card is an aside landmark, and the notice is announced as a status.'],
  buildingBlock: true,
  example: `import { DetailPane } from '@rotp/design';\n\nconst PackDetail = () => <DetailPane title="Pack" fields={[{ label: 'Size', value: '4 MB' }]} />;\n`,
  propsHash: 'f499105552224712',
} satisfies ComponentUsage;

export { usage };
