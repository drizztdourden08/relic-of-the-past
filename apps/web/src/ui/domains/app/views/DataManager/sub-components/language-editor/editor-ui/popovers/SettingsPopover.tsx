/* @layer renderer-components @kind component */
import { useCallback, useMemo } from 'react';
import { Divider, SegmentedControl, Text } from '@ds/primitives';
import { PopoverShell } from './PopoverShell';
import { SettingRow } from './SettingRow';
import { settingFieldsFor } from './settings-fields';
import { STRUCTURE_NOTES, STRUCTURE_OPTIONS } from './structure-modes.constants';
import { STRUCTURE_LABEL } from './SettingsPopover.constants';
import {
  clearMessageSetting, MESSAGE_SETTING_NAMES, readMessageSetting, setMessageSetting,
} from '../../sub-components/message-settings';
import type { SettingsPopoverProps } from './SettingsPopover.type';
import './SettingsPopover.css';

const SettingsPopover = (props: SettingsPopoverProps) => {
  const { label, cfg, tokens, structureMode, onChangeSettings, onChangeStructureMode } = props;

  const fields = useMemo(() => settingFieldsFor(cfg), [cfg]);

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
        options={STRUCTURE_OPTIONS}
        label={STRUCTURE_LABEL}
        onChange={onChangeStructureMode}
      />
      <Text as="span" variant="caption" className="settings-popover__note">
        {STRUCTURE_NOTES[structureMode]}
      </Text>
    </PopoverShell>
  );
};

export { SettingsPopover };
