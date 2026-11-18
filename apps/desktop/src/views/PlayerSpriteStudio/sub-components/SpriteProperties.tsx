/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Field, TextInput } from '@drizztdourden08/tessera/primitives';
import { StudioSection } from '@app/studio';
import type { SpritePropertiesProps } from '../PlayerSpriteStudio.type';
import { PaletteEditor } from './PaletteEditor';

const SpriteProperties = (props: SpritePropertiesProps) => {
  const t = useT();
  const { sheet, outfit, readOnly, draft } = props;
  const { meta } = sheet;

  return (
    <>
      <StudioSection title={t('views-player-sprite-studio:properties.section')}>
        <Field label={t('views-player-sprite-studio:properties.name')}>
          <TextInput
            value={meta.name}
            placeholder={t('views-player-sprite-studio:properties.namePlaceholder')}
            disabled={readOnly}
            onChange={(e) => draft.patch({ meta: { ...meta, name: e.target.value } })}
          />
        </Field>
        <Field label={t('views-player-sprite-studio:properties.author')}>
          <TextInput
            value={meta.author}
            placeholder={t('views-player-sprite-studio:properties.author')}
            disabled={readOnly}
            onChange={(e) => draft.patch({ meta: { ...meta, author: e.target.value, authorShort: e.target.value } })}
          />
        </Field>
      </StudioSection>

      <PaletteEditor
        sheet={sheet}
        outfit={outfit}
        readOnly={readOnly}
        onColor={(index, word) => draft.setColor(outfit, index, word)}
        onGloveColor={draft.setGloveColor}
        onReset={(index) => draft.resetColor(outfit, index)}
      />
    </>
  );
};

export { SpriteProperties };
