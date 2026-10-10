/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The Hookshop rights of one group, one checkbox per store permission.',
  useWhen: ['A rights editor slot of a site definition, for the store rights model, on either site.'],
  avoidWhen: [{ case: 'Sanctuary rights, by file type and reports.', use: 'Checkbox' }],
  rules: ['Hand it the group rights for the store and save what onChange returns.'],
  a11y: ['Each permission is a labelled checkbox.'],
  buildingBlock: true,
  example: `import { StoreRightsEditor } from '@rotp/design';

const RightsSample = () => <StoreRightsEditor value={['review']} onChange={() => undefined} />;
`,
  propsHash: 'f7cd2df5e82619c7',
} satisfies ComponentUsage;

export { usage };
