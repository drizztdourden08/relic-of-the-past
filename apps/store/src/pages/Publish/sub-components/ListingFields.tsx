/* @layer store-site @kind component */
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { Select } from '@ds/primitives/Select';
import { TagInput } from '@ds/primitives/TagInput';
import { Text } from '@ds/primitives/Text';
import { TextInput } from '@ds/primitives/TextInput';
import { Textarea } from '@ds/primitives/Textarea';
import { tagsSchema } from '@shared/hub/schemas/common';
import { FIELD_LABELS, FIELD_MESSAGES, LICENSE_OPTIONS } from '../Publish.constants';
import { LISTING_CAPS } from '../behavior/listing-errors.constants';
import { ColorField } from './ColorField';
import { TAG_HINT } from './ListingFields.constants';
import type { ListingFieldsProps } from './ListingFields.type';

const validateTag = (raw: string) => tagsSchema.safeParse([raw]).success || TAG_HINT;

const ListingFields = (props: ListingFieldsProps) => {
  const { listing, errors, onLeave } = props;
  const { text, set, setSummary, following } = listing;
  return (
    <>
      <Field label={FIELD_LABELS.name} htmlFor="publish-name" error={errors.name}>
        <TextInput
          id="publish-name"
          value={text.name}
          aria-invalid={errors.name ? true : undefined}
          onChange={(event) => set('name', event.target.value)}
          onBlur={() => onLeave('name')}
          placeholder="Orchestral Overworld"
        />
      </Field>
      <Field label={FIELD_LABELS.summary} htmlFor="publish-summary" error={errors.summary} hint={`${text.summary.length} / ${LISTING_CAPS.summary}`}>
        <TextInput
          id="publish-summary"
          value={text.summary}
          aria-invalid={errors.summary ? true : undefined}
          onChange={(event) => setSummary(event.target.value)}
          onBlur={() => onLeave('summary')}
          placeholder="Every track rescored for strings and brass"
        />
      </Field>
      <Field label={FIELD_LABELS.description} htmlFor="publish-description" error={errors.description} hint={following ? <Text as="span" className="publish__following">{FIELD_MESSAGES.following}</Text> : undefined}>
        <Textarea
          id="publish-description"
          rows={6}
          value={text.description}
          aria-invalid={errors.description ? true : undefined}
          onChange={(event) => set('description', event.target.value)}
          onBlur={() => onLeave('description')}
        />
      </Field>
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
