/* @layer store-site @kind component */
/**
 * The listing's words and look: name, the short description cards show with its count, the
 * description (markdown) that copies it until it is edited, colour, licence and tags. Each
 * field shows the error it is handed, outlined in red.
 */
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { Select } from '@ds/primitives/Select';
import { TagInput } from '@ds/primitives/TagInput';
import { Text } from '@ds/primitives/Text';
import { TextInput } from '@ds/primitives/TextInput';
import { Textarea } from '@ds/primitives/Textarea';
import { tagsSchema } from '@shared/hub/schemas/common';
import { FIELD_LABELS, FIELD_MESSAGES, LICENSE_OPTIONS } from '../Publish.constants';
import type { FieldErrors, FieldKey } from '../Publish.type';
import { LISTING_CAPS } from '../behavior/listing-errors';
import type { ListingFieldsState } from '../behavior/useListingFields';
import { ColorField } from './ColorField';

type ListingFieldsProps = {
  listing: ListingFieldsState;
  /** The errors to show now, by field. */
  errors: FieldErrors;
  /** Called when the player leaves a field, so its error may show. */
  onLeave: (field: FieldKey) => void;
};

const TAG_HINT = 'lowercase letters, digits, dots, dashes';
const FOLLOWING_HINT = <Text as="span" className="publish__following">{FIELD_MESSAGES.following}</Text>;

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
      <Field label={FIELD_LABELS.description} htmlFor="publish-description" error={errors.description} hint={following ? FOLLOWING_HINT : undefined}>
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
export type { ListingFieldsProps };
