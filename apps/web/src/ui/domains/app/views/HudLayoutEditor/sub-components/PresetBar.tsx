/* @layer renderer-components @kind component */
/**
 * Where a layout comes from, and where it goes.
 *
 * "Start from" restyles the layout being edited instead of switching to
 * another one: picking a preset copies its placements over the draft and keeps
 * the draft's own identity, so a player who has already named and saved
 * something cannot lose it by browsing. Nothing here writes until Save.
 *
 * A shipped preset is code, not data, so it can never be saved over. Save on
 * one is a fork, which the button says out loud.
 *
 * AN INVALID EXPRESSION BLOCKS SAVE, here, not per-field: the WHOLE
 * document's own validator (`validateLayout`, run by the caller) is the one
 * source of truth for "is this document real", so a bad expression anywhere
 * (not only in the currently selected node's `ValueField`) disables both
 * buttons, and the first offending line is named instead of left silent.
 */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import { TextInput } from '@ds/primitives/TextInput';
import type { HudLayout } from '@shared/types/hud';

interface PresetBarProps {
  layouts: readonly HudLayout[];
  draft: HudLayout;
  dirty: boolean;
  busy: boolean;
  /** `validateLayout`'s own `errors` for the current draft. Non-empty blocks
   *  both Save buttons. */
  errors: readonly string[];
  onStartFrom: (layout: HudLayout) => void;
  onRename: (name: string) => void;
  onSave: () => void;
  onSaveAs: () => void;
  onReset: () => void;
}

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
export type { PresetBarProps };
