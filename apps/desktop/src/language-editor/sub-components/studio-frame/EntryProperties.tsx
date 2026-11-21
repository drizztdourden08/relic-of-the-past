/* @layer renderer-components @kind component */
import { Field, Textarea } from '@drizztdourden08/tessera/primitives';
import { useT } from '@drizztdourden08/brock-react';
import { EntryFacts } from '@rotp/design/packs';
import { StudioSection } from '@app/studio';
import type { EntryPropertiesProps } from './studio-frame.type';

const EntryProperties = (props: EntryPropertiesProps) => {
  const { selection, readOnly, onNote } = props;
  const { entry } = selection;
  const t = useT();

  return (
    <StudioSection title={t('language-editor:entry.properties.title')}>
      <EntryFacts {...selection} />
      <Field label={t('language-editor:entry.properties.note')}>
        <Textarea
          rows={3}
          resize="vertical"
          value={entry.note ?? ''}
          placeholder={t('language-editor:entry.properties.note-placeholder')}
          disabled={readOnly}
          onChange={(e) => onNote(entry.id, e.target.value)}
        />
      </Field>
    </StudioSection>
  );
};

export { EntryProperties };
