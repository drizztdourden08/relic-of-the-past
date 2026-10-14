/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The form that creates a profile from one of the ROMs that are ready, with a way to import another.',
  useWhen: ['On the profile hub, when the player adds a profile.'],
  avoidWhen: [{ case: 'A form for a record that already exists.', use: 'Field' }],
  rules: ['List only the ROMs whose assets are extracted.', 'Show extracting while an import runs.'],
  a11y: ['The ROM select has a label and the import button names its action.'],
  tree: { path: ['a value the user sets', 'a whole record', 'create one in the page'], rule: 'The new profile form.' },
  example: `import type { ComponentProps } from 'react';
import { CreateProfileForm } from '@app/compounds/CreateProfileForm';

const Mounted = (props: ComponentProps<typeof CreateProfileForm>) => <CreateProfileForm {...props} />;
`,
  propsHash: '32d2f5f43ea21eba',
} satisfies ComponentUsage;

export { usage };
