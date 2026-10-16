/* @layer renderer-components @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A sunken block that holds a list or a text area inside a raised side panel, so it reads as set into the panel.',
  useWhen: [
    'A list, a form or a text area sits in a SidePanel of a studio.',
    'A group of controls needs to read as one inset area on a raised surface.',
  ],
  avoidWhen: [
    { case: 'The editing area of a studio.', use: 'StudioLayout' },
    { case: 'A block that needs no inset look.', use: 'Box' },
  ],
  rules: [
    'Put one list or one form in it, and keep the rest of the panel outside.',
    'It stacks its children in a column with a small gap.',
  ],
  a11y: ['It adds no role; name the list or the form inside it.'],
  buildingBlock: true,
  example: `import { SunkenWell } from '@app/compounds/SunkenWell';

const Mounted = () => <SunkenWell>The list or the form</SunkenWell>;
`,
  propsHash: 'e93a2b5ad6729c81',
} satisfies ComponentUsage;

export { usage };
