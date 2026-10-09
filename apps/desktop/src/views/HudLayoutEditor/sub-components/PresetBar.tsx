/* @layer renderer-components @kind component */
import { Box, Button, Text, TextInput } from '@drizztdourden08/tessera/primitives';
import { ListItemList, ListItemRow } from '@drizztdourden08/tessera/composites';
import type { PresetBarProps } from './PresetBar.type';

const PresetBar = (props: PresetBarProps) => {
  const { layouts, draft, dirty, busy, errors, onStartFrom, onRename, onSave, onSaveAs, onReset } = props;
  const invalid = errors.length > 0;

  return (
    <Box className="hud-editor-presets">
      <Text className="hud-editor__label">Start from</Text>
      <ListItemList label="Layouts">
        {layouts.map((layout) => (
          <ListItemRow
            key={layout.id}
            name={layout.name}
            meta={layout.builtIn ? 'built-in' : 'custom'}
            selected={layout.id === draft.id}
            onClick={busy ? undefined : () => onStartFrom(layout)}
          />
        ))}
      </ListItemList>

      <TextInput
        value={draft.name}
        placeholder="Layout name"
        aria-label="Layout name"
        onChange={(event) => onRename(event.target.value)}
      />

      <Box className="hud-editor-presets__actions">
        <Button variant="primary" size="sm" disabled={busy || invalid || (!dirty && !draft.builtIn)} onClick={onSave}>
          {draft.builtIn ? 'Save a copy' : 'Save'}
        </Button>
        <Button variant="secondary" size="sm" disabled={busy || invalid} onClick={onSaveAs}>Save as...</Button>
        <Button variant="ghost" size="sm" disabled={busy || !dirty} onClick={onReset}>Reset</Button>
      </Box>

      {invalid && (
        <Text className="hud-inspect__warning" title={errors.join('\n')}>
          ⚠ {errors.length} issue{errors.length === 1 ? '' : 's'}. First: {errors[0]}
        </Text>
      )}

      {draft.builtIn && (
        <Text className="hud-editor__hint">
          This is a shipped layout, so saving makes a copy of your own. The original stays as it is.
        </Text>
      )}
    </Box>
  );
};

export { PresetBar };
export type { PresetBarProps } from './PresetBar.type';
