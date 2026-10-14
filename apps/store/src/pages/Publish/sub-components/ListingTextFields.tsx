/* @layer store-site @kind component */
import { Field, Text, TextInput, Textarea } from '@drizztdourden08/tessera/primitives';
import { FIELD_LABELS, FIELD_MESSAGES } from '../Publish.constants';
import { LISTING_CAPS } from '../behavior/listing-errors.constants';
import type { ListingFieldsProps } from './ListingFields.type';

const ListingTextFields = (props: ListingFieldsProps) => {
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
    </>
  );
};

export { ListingTextFields };
