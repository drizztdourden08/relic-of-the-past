/* @layer store-site @kind component */
import { Field } from '@ds/primitives/Field';
import { Textarea } from '@ds/primitives/Textarea';
import type { ChangesFieldProps } from './ChangesField.type';

const ChangesField = (props: ChangesFieldProps) => {
  const { changes } = props;
  return (
    <Field label="Changes" htmlFor="publish-changes">
      <Textarea id="publish-changes" rows={3} value={changes.changelog} onChange={(event) => changes.setChangelog(event.target.value)} />
    </Field>
  );
};

export { ChangesField };
