/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import { TextInput } from '@ds/primitives/TextInput';
import type { PresetBarProps } from './PresetBar.type';

const PresetBar = (props: PresetBarProps) => {
  const { layouts, draft, dirty, busy, errors, onStartFrom, onRename, onSave, onSaveAs, onReset } = props;
  const invalid = errors.length > 0;

  return (
    <Box className="hud-editor-presets">
      <Text className="hud-editor__label">Start from</Text>
      <Box className="hud-editor-list">
        {layouts.map((layout) => (
          <Button
            variant="bare"
            key={layout.id}
            className={`hud-editor-list__row${layout.id === draft.id ? ' is-selected' : ''}`}
            aria-pressed={layout.id === draft.id}
            disabled={busy}
            onClick={() => onStartFrom(layout)}
          >
            <Text className="hud-editor-list__name">{layout.name}</Text>
            <Text className="hud-editor-list__kind">{layout.builtIn ? 'built-in' : 'custom'}</Text>
          </Button>
        ))}
      </Box>

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
