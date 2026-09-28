/* @layer store-site @kind component */
/** What changed in this version, shown to players once it is approved. Store-api numbers the version itself. */
import { Field } from '@ds/primitives/Field';
import { Textarea } from '@ds/primitives/Textarea';
import type { PublishForm } from '../behavior/usePublishForm';

type ChangesFieldProps = { changes: PublishForm['changes'] };

const ChangesField = (props: ChangesFieldProps) => {
  const { changes } = props;
  return (
    <Field label="Changes" htmlFor="publish-changes">
      <Textarea id="publish-changes" rows={3} value={changes.changelog} onChange={(event) => changes.setChangelog(event.target.value)} />
    </Field>
  );
};

export { ChangesField };
export type { ChangesFieldProps };
