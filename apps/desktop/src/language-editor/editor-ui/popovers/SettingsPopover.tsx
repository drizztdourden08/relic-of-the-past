/* @layer renderer-components @kind component */
import { useCallback, useMemo } from 'react';
import { Divider, SegmentedControl, Text } from '@drizztdourden08/tessera/primitives';
import { useT, useText } from '@drizztdourden08/brock-react';
import { STRUCTURE_MODES } from '@rotp/languages';
import { PopoverShell } from './PopoverShell';
import { SettingRow } from './SettingRow';
import { settingFieldsFor } from './settings-fields';
import { STRUCTURE_NOTES, STRUCTURE_WORDS } from './structure-modes.constants';
import {
  clearMessageSetting, MESSAGE_SETTING_NAMES, readMessageSetting, setMessageSetting,
} from '../../sub-components/message-settings';
import type { SettingsPopoverProps } from './SettingsPopover.type';
import './SettingsPopover.css';

const SettingsPopover = (props: SettingsPopoverProps) => {
  const { label, cfg, tokens, structureMode, onChangeSettings, onChangeStructureMode } = props;
  const t = useT();
  const text = useText();
  const options = useMemo(
    () => STRUCTURE_MODES.map((mode) => ({ value: mode, label: text(STRUCTURE_WORDS[mode]) })),
    [text],
  );

  const fields = useMemo(() => settingFieldsFor(t, cfg), [t, cfg]);

  const current = useMemo(() => new Map<string, string>(
    MESSAGE_SETTING_NAMES.map((name) => {
      const value = readMessageSetting(tokens, name);
      return [name, value === null ? '' : String(value)];
    }),
  ), [tokens]);

  const handleChange = useCallback((name: string, value: string) => {
    onChangeSettings(value === ''
      ? clearMessageSetting(tokens, name)
      : setMessageSetting(tokens, name, Number(value)));
  }, [tokens, onChangeSettings]);

  return (
    <PopoverShell label={label} align="end">
      {fields.map((field) => (
        <SettingRow
          key={field.name}
          field={field}
          value={current.get(field.name) ?? ''}
          onChange={handleChange}
        />
      ))}

      <Divider />

      <SegmentedControl
        value={structureMode}
        options={options}
        label={t('language-editor:structure.label')}
        onChange={onChangeStructureMode}
      />
      <Text as="span" variant="caption" className="settings-popover__note">
        {text(STRUCTURE_NOTES[structureMode])}
      </Text>
    </PopoverShell>
  );
};

export { SettingsPopover };
