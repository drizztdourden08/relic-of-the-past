/* @layer renderer-components @kind component */
import { Field, TextInput } from '@drizztdourden08/tessera/primitives';
import { StudioSection } from '@app/studio';
import type { SpritePropertiesProps } from '../PlayerSpriteStudio.type';
import { PaletteEditor } from './PaletteEditor';

const SpriteProperties = (props: SpritePropertiesProps) => {
  const { sheet, outfit, readOnly, draft } = props;
  const { meta } = sheet;

  return (
    <>
      <StudioSection title="Sprite">
        <Field label="Name">
          <TextInput
            value={meta.name}
            placeholder="Sprite name"
            disabled={readOnly}
            onChange={(e) => draft.patch({ meta: { ...meta, name: e.target.value } })}
          />
        </Field>
        <Field label="Author">
          <TextInput
            value={meta.author}
            placeholder="Author"
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
