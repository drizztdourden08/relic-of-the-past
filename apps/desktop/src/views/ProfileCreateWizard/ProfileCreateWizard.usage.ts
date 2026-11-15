/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The step by step wizard that creates a profile: its name, ROM, preset, language, MSU pack and randomizer modules, then a review.',
  useWhen: ['When a player adds a profile from the profile manager.'],
  avoidWhen: [{ case: 'A single action button.', use: 'Button' }],
  rules: ['Pass the ready ROMs, the languages, the MSU packs and the create, cancel and created callbacks.'],
  a11y: ['Each step has its own heading and the wizard buttons are labelled.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';\nimport { ProfileCreateWizard } from '@app/views/ProfileCreateWizard';\n\nconst Create = (props: ComponentProps<typeof ProfileCreateWizard>) => <ProfileCreateWizard {...props} />;\n`,
  propsHash: '1a34ec61890b04e6',
} satisfies ComponentUsage;

export { usage };
