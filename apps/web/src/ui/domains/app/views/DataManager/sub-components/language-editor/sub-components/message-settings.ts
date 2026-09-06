/* @layer renderer-components @kind logic */
/**
 * The message-wide display codes, read out of and written back into one entry's
 * token array.
 *
 * The engine consumes these in a pre-pass before it draws anything, so they do
 * not act where they sit: whichever one appears LAST in the message is the one
 * that applies. That makes them settings, not punctuation, which is why
 * they live here as pure array functions instead of being edited as inline
 * chips. Reading is "find the last matching command", writing is "make that
 * last one the only one".
 *
 * The catalog's `scope` field is deliberately not the filter: it also marks the
 * two substitution codes as message-scope, and those are things a translator
 * places at a spot in the sentence. Only the three display codes below are
 * settings, so the list is stated here and every label, description and value
 * range is still read back out of the catalog by the callers.
 */
import type { Token } from '@shared/game/language';

/** The three the pre-pass reads: text palette, box frame, box slot. */
const MESSAGE_SETTING_NAMES = ['Color', 'Window', 'Position'] as const;

type MessageSettingName = typeof MESSAGE_SETTING_NAMES[number];

const isSetting = (token: Token, name: string): boolean => token.t === 'cmd' && token.name === name;

const lastIndexOfSetting = (tokens: Token[], name: string): number => {
  for (let index = tokens.length - 1; index >= 0; index -= 1) {
    if (isSetting(tokens[index], name)) return index;
  }
  return -1;
};

/**
 * The value in force, or `null` when the entry never sets it (the engine
 * default applies). It is also null when the last occurrence carries no
 * parameter, which the encoders cannot produce but a hand-edited stream could.
 */
const readMessageSetting = (tokens: Token[], name: string): number | null => {
  const index = lastIndexOfSetting(tokens, name);
  if (index < 0) return null;
  const token = tokens[index];
  return token.t === 'cmd' ? token.param ?? null : null;
};

/**
 * Puts `param` in force. The last occurrence is rewritten where it stands so
 * the setting keeps its place in the stream, and any earlier duplicate is
 * dropped: it could never have applied, and leaving it behind would let the
 * settings strip and the token line disagree about the same entry.
 */
const setMessageSetting = (tokens: Token[], name: string, param: number): Token[] => {
  const last = lastIndexOfSetting(tokens, name);
  if (last < 0) return [...tokens, { t: 'cmd', name, param }];
  return tokens
    .filter((token, index) => index === last || !isSetting(token, name))
    .map((token) => (isSetting(token, name) ? { t: 'cmd', name, param } : token));
};

/** Takes the setting out entirely, duplicates and all, back to the engine default. */
const clearMessageSetting = (tokens: Token[], name: string): Token[] =>
  tokens.filter((token) => !isSetting(token, name));

export {
  clearMessageSetting, MESSAGE_SETTING_NAMES, readMessageSetting, setMessageSetting,
};
export type { MessageSettingName };
