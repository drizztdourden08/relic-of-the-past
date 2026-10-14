/* @layer store-site @kind component */
import { Checkbox, Field, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { usePublishForm } from '../behavior/usePublishForm';
import { useScrollToFirstError } from '../behavior/useScrollToFirstError';
import { ListingFields } from './ListingFields';
import { PackField } from './PackField';
import { ChangesField } from './ChangesField';
import { PublishFooter } from './PublishFooter';
import { PublishPictures } from './PublishPictures';
import { RIGHTS_LINE } from './PublishForm.constants';
import type { PublishFormProps } from './PublishForm.type';

const PublishForm = (props: PublishFormProps) => {
  const { mode, item } = props;
  const form = usePublishForm(mode, item);
  const { shown, leave, attempts } = form.fields;
  useScrollToFirstError(attempts);

  const tickRights = (checked: boolean) => {
    form.rights.set(checked);
    leave('rights');
  };

  return (
    <Stack gap="lg" align="stretch" className="publish">
      {form.note && <Text as="p" variant="caption" role="status" className="publish__note">{form.note}</Text>}
      {form.alertLine && <Text as="p" variant="caption" role="alert" className="publish__alert">{form.alertLine}</Text>}
      {form.takesPack && <PackField pack={form.pack} error={shown.pack} onLeave={() => leave('pack')} />}
      {form.takesChanges && <ChangesField changes={form.changes} />}
      {form.takesListing && <ListingFields listing={form.listing} errors={shown} onLeave={leave} />}
      {form.takesListing && <PublishPictures mode={mode} item={item} form={form} />}
      <Field error={shown.rights}>
        <Checkbox checked={form.rights.checked} onChange={tickRights} label={RIGHTS_LINE} />
      </Field>
      <PublishFooter mode={mode} form={form} />
    </Stack>
  );
};

export { PublishForm };
