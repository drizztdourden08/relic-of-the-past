/* @layer store-site @kind component */
/** The listing's words and look: name, the one line cards show, the description (markdown), colour, licence and tags. */
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { Select } from '@ds/primitives/Select';
import { TagInput } from '@ds/primitives/TagInput';
import { TextInput } from '@ds/primitives/TextInput';
import { Textarea } from '@ds/primitives/Textarea';
import { tagsSchema } from '@shared/hub/schemas/common';
import { LICENSE_OPTIONS } from '../Publish.constants';
import type { ListingFieldsState } from '../behavior/useListingFields';
import { ColorField } from './ColorField';

type ListingFieldsProps = { listing: ListingFieldsState };

const TAG_HINT = 'lowercase letters, digits, dots, dashes';

const validateTag = (raw: string) => tagsSchema.safeParse([raw]).success || TAG_HINT;

const ListingFields = (props: ListingFieldsProps) => {
  const { listing } = props;
  const { text, set } = listing;
  return (
    <>
      <Field label="Name" htmlFor="publish-name">
        <TextInput id="publish-name" value={text.name} onChange={(event) => set('name', event.target.value)} placeholder="Orchestral Overworld" />
      </Field>
      <Field label="One line" htmlFor="publish-summary">
        <TextInput id="publish-summary" value={text.summary} onChange={(event) => set('summary', event.target.value)} placeholder="Every track rescored for strings and brass" />
      </Field>
      <Field label="Description" htmlFor="publish-description">
        <Textarea id="publish-description" rows={6} value={text.description} onChange={(event) => set('description', event.target.value)} />
      </Field>
      <Flex gap="md" wrap align="start">
        <ColorField value={text.color} onChange={(value) => set('color', value)} />
        <Field label="Licence" className="publish__licence">
          <Select value={text.license} onChange={(value) => set('license', value)} options={LICENSE_OPTIONS} />
        </Field>
        <TagInput
          label="Tags"
          value={text.tags}
          onChange={(next) => set('tags', next)}
          validate={validateTag}
          enforce
          placeholder="orchestral, layered..."
          className="publish__tags"
        />
      </Flex>
    </>
  );
};

export { ListingFields };
export type { ListingFieldsProps };
