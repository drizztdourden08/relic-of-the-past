/* @layer renderer-components @kind component */
import { Box, Button, Icon, Text, TextInput } from '@drizztdourden08/tessera/primitives';
import { ListItemList, ListItemRow } from '@drizztdourden08/tessera/composites';
import type { PresetBarProps } from './PresetBar.type';
import { useT } from '@drizztdourden08/brock-react';

const PresetBar = (props: PresetBarProps) => {
  const t = useT();
  const { layouts, draft, dirty, busy, errors, onStartFrom, onRename, onSave, onSaveAs, onReset } = props;
  const invalid = errors.length > 0;

  return (
    <Box className="hud-editor-presets">
      <Text className="hud-editor__label">{t('hud-editor:preset-bar.text.start-from')}</Text>
      <ListItemList label={t('hud-editor:preset-bar.label.layouts')}>
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
        placeholder={t('hud-editor:preset-bar.placeholder.layout-name')}
        aria-label={t('hud-editor:preset-bar.aria.layout-name')}
        onChange={(event) => onRename(event.target.value)}
      />

      <Box className="hud-editor-presets__actions">
        <Button variant="primary" size="sm" disabled={busy || invalid || (!dirty && !draft.builtIn)} onClick={onSave}>
          {draft.builtIn ? 'Save a copy' : 'Save'}
        </Button>
        <Button variant="secondary" size="sm" disabled={busy || invalid} onClick={onSaveAs}>{t('hud-editor:preset-bar.text.save-as')}</Button>
        <Button variant="ghost" size="sm" disabled={busy || !dirty} onClick={onReset}>{t('hud-editor:preset-bar.text.reset')}</Button>
      </Box>

      {invalid && (
        <Text className="hud-inspect__warning" title={errors.join('\n')}>
          <Icon name="triangle-alert" size={14} aria-hidden /> {errors.length} issue{errors.length === 1 ? '' : 's'}. First: {errors[0]}
        </Text>
      )}

      {draft.builtIn && (
        <Text className="hud-editor__hint">
          {t('hud-editor:preset-bar.text.this-is-a-shipped-layout')}
        </Text>
      )}
    </Box>
  );
};

export { PresetBar };
