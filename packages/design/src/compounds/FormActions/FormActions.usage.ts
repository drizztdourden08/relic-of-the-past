/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The Save and Cancel buttons at the foot of an edit form.',
  useWhen: ['A form that edits one record in place and submits as a whole.'],
  avoidWhen: [{ case: 'A dialog that already carries its own action row.', use: 'DialogShell' }],
  rules: ['Place it inside the form element so Save submits the form.', 'Pass canSave false while nothing changed or the draft is invalid.'],
  a11y: ['Both are buttons; Save is the submit button, Cancel never submits.'],
  buildingBlock: true,
  example: `import { FormActions } from '@rotp/design';\n\nconst Actions = () => <FormActions busy={false} canSave onCancel={() => undefined} />;\n`,
  propsHash: 'f7b5c0dfd9484e86',
} satisfies ComponentUsage;

export { usage };
