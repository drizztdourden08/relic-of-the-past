/* @layer renderer-components @kind component */
import { Field, Textarea } from '@drizztdourden08/tessera/primitives';
import { EntryFacts } from '@rotp/design/packs';
import { StudioSection } from '@app/studio';
import type { EntryPropertiesProps } from './studio-frame.type';

const EntryProperties = (props: EntryPropertiesProps) => {
  const { selection, readOnly, onNote } = props;
  const { entry } = selection;

  return (
    <StudioSection title="Line">
      <EntryFacts {...selection} />
      <Field label="Note">
        <Textarea
          rows={3}
          resize="vertical"
          value={entry.note ?? ''}
          placeholder="A note for translators"
          disabled={readOnly}
          onChange={(e) => onNote(entry.id, e.target.value)}
        />
      </Field>
    </StudioSection>
  );
};

export { EntryProperties };
