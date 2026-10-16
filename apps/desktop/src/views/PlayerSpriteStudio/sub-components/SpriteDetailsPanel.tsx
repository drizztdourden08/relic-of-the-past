/* @layer renderer-components @kind component */
import { EmptyState, Field, Text, TextInput } from '@drizztdourden08/tessera/primitives';
import { StudioWell } from '../../../compounds/StudioFrame';
import type { SpriteDetailsPanelProps } from '../PlayerSpriteStudio.type';
import { PaletteEditor } from './PaletteEditor';

const SpriteDetailsPanel = (props: SpriteDetailsPanelProps) => {
  const { sheet, outfit, readOnly, draft } = props;

  if (!sheet) return <EmptyState size="sm" message="Open a sprite to edit its name and colours." />;

  const { meta } = sheet;

  return (
    <>
      <Text variant="overline" tone="muted">Sprite</Text>
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
      <StudioWell>
        <PaletteEditor
          sheet={sheet}
          outfit={outfit}
          readOnly={readOnly}
          onColor={(index, word) => draft.setColor(outfit, index, word)}
          onGloveColor={draft.setGloveColor}
          onReset={(index) => draft.resetColor(outfit, index)}
        />
      </StudioWell>
    </>
  );
};

export { SpriteDetailsPanel };
