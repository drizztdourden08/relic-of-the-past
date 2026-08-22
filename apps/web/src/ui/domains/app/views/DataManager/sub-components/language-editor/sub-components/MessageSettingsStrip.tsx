/* @layer renderer-components @kind component */
/**
 * The message-wide display settings, as a strip of pickers above the line.
 *
 * These three codes are not punctuation: the engine reads them in a pre-pass
 * and the last one in the message wins, so their position in the stream carries
 * no meaning and a chip sitting mid-sentence would be a lie about how they
 * work. Reading and writing them is `message-settings.ts`; this component only
 * renders the current value and reports the new one.
 */
import { useCallback, useMemo } from 'react';
import { Box, Text } from '@ds/primitives';
import type { SelectOption } from '@ds/primitives';
import { codeInfoFor } from '@shared/game/language';
import type { Token } from '@shared/game/language';
import type { LanguageConfig } from '@shared/asset-extraction/text/data/language-data';
import { MessageSettingField } from './MessageSettingField';
import { paramValuesFor } from './code-params';
import {
  clearMessageSetting, MESSAGE_SETTING_NAMES, readMessageSetting, setMessageSetting,
} from './message-settings';

type MessageSettingsStripProps = {
  tokens: Token[];
  cfg: LanguageConfig;
  onChangeTokens: (tokens: Token[]) => void;
};

/** "Say nothing", which is a real choice here: the engine default then applies. */
const AUTO_OPTION: SelectOption = { value: '', label: 'automatic' };

const MessageSettingsStrip = (props: MessageSettingsStripProps) => {
  const { tokens, cfg, onChangeTokens } = props;

  const fields = useMemo(() => MESSAGE_SETTING_NAMES.map((name) => {
    const info = codeInfoFor(name);
    const values = paramValuesFor(name, cfg) ?? [];
    return {
      name,
      label: info?.label ?? name,
      description: info?.description ?? '',
      options: [AUTO_OPTION, ...values.map((value) => ({ value: String(value), label: String(value) }))],
    };
  }), [cfg]);

  /** Display value per setting: the empty string stands for "not set at all". */
  const current = useMemo(() => new Map<string, string>(
    MESSAGE_SETTING_NAMES.map((name) => {
      const value = readMessageSetting(tokens, name);
      return [name, value === null ? '' : String(value)];
    }),
  ), [tokens]);

  const handleChange = useCallback((name: string, value: string) => {
    onChangeTokens(value === ''
      ? clearMessageSetting(tokens, name)
      : setMessageSetting(tokens, name, Number(value)));
  }, [tokens, onChangeTokens]);

  return (
    <Box className="entry-editor__settings">
      <Text className="entry-editor__settings-label" variant="caption">
        Whole-message look
      </Text>
      {fields.map((field) => (
        <MessageSettingField
          key={field.name}
          name={field.name}
          label={field.label}
          description={field.description}
          value={current.get(field.name) ?? ''}
          options={field.options}
          onChange={handleChange}
        />
      ))}
    </Box>
  );
};

export { MessageSettingsStrip };
export type { MessageSettingsStripProps };
