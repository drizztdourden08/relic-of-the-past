/* @layer renderer-components @kind component */
/**
 * What holds for the whole message: its palette, where its box sits, whether the
 * box is framed. It also settles how much of the entry the editor may
 * restructure.
 *
 * The three display codes are not punctuation. The engine reads them in a
 * pre-pass and the last one in the message wins, so their position in the stream
 * carries no meaning and a chip sitting mid-sentence would misrepresent them.
 * Reading and writing them is `message-settings.ts`; this card only shows what
 * is in force and reports the new value.
 *
 * The structure mode belongs beside them for the same reason: it applies to the
 * entry as a whole, not to a spot in it. It is the one control here that changes
 * how typing behaves, so it carries a line saying what it will do.
 */
import { useCallback, useMemo } from 'react';
import { Divider, SegmentedControl, Text } from '@ds/primitives';
import { PopoverShell } from './PopoverShell';
import { SettingRow } from './SettingRow';
import { settingFieldsFor } from './settings-fields';
import { STRUCTURE_NOTES, STRUCTURE_OPTIONS } from './structure-modes';
import {
  clearMessageSetting, MESSAGE_SETTING_NAMES, readMessageSetting, setMessageSetting,
} from '../../sub-components/message-settings';
import type { StructureMode, Token } from '@shared/game/language';
import type { LanguageConfig } from '@shared/asset-extraction/text/data/language-data';
import './SettingsPopover.css';

type SettingsPopoverProps = {
  label: string;
  cfg: LanguageConfig;
  /** The entry's tokens, which the settings are read out of and written back into. */
  tokens: Token[];
  structureMode: StructureMode;
  onChangeSettings: (next: Token[]) => void;
  onChangeStructureMode: (mode: StructureMode) => void;
};

const STRUCTURE_LABEL = 'Line structure';

const SettingsPopover = (props: SettingsPopoverProps) => {
  const { label, cfg, tokens, structureMode, onChangeSettings, onChangeStructureMode } = props;

  const fields = useMemo(() => settingFieldsFor(cfg), [cfg]);

  /** Display value per setting: the empty string stands for "not set at all". */
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
export type { SettingsPopoverProps };
