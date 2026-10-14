/* @layer store-site @kind component */
import { Field, Flex, Select } from '@drizztdourden08/tessera/primitives';
import { TagInput } from '@drizztdourden08/tessera/composites';
import { tagsSchema } from '@rotp/hub-contracts';
import { FIELD_LABELS, LICENSE_OPTIONS } from '../Publish.constants';
import { ColorField } from './ColorField';
import { TAG_HINT } from './ListingFields.constants';
import type { ListingFieldsProps } from './ListingFields.type';
import { ListingTextFields } from './ListingTextFields';

const validateTag = (raw: string) => tagsSchema.safeParse([raw]).success || TAG_HINT;

const ListingFields = (props: ListingFieldsProps) => {
  const { listing, errors, onLeave } = props;
  const { text, set } = listing;
  return (
    <>
      <ListingTextFields listing={listing} errors={errors} onLeave={onLeave} />
      <Flex gap="md" wrap align="start">
        <ColorField value={text.color} onChange={(value) => set('color', value)} />
        <Field label={FIELD_LABELS.license} className="publish__licence" error={errors.license}>
          <Select
            value={text.license}
            onChange={(value) => {
              set('license', value);
              onLeave('license');
            }}
            options={LICENSE_OPTIONS}
          />
        </Field>
        <Field label={FIELD_LABELS.tags} htmlFor="publish-tags" error={errors.tags} className="publish__tags">
          <TagInput
            id="publish-tags"
            value={text.tags}
            onChange={(next) => {
              set('tags', next);
              onLeave('tags');
            }}
            validate={validateTag}
            enforce
            placeholder="orchestral, layered..."
          />
        </Field>
      </Flex>
    </>
  );
};

export { ListingFields };
