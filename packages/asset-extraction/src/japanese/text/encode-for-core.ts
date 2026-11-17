/* @layer shared-asset-extraction @kind logic */
import { US_COMMAND_NAMES, US_COMMAND_START, US_PARAM_COMMANDS } from './japanese-commands.constants';
import { COMMAND_PARAM_RE, CORE_GLYPH_PREFIX } from './core-encoding.constants';
import { charToGlyph } from './char-to-glyph';

const encodeCommand = (inner: string): number[] => {
  const [, paramName, digits] = COMMAND_PARAM_RE.exec(inner) ?? [];
  const name = paramName ?? inner;
  const index = US_COMMAND_NAMES.indexOf(name);
  if (index < 0) throw new Error(`encodeForCore: unknown command [${inner}]`);
  const code = US_COMMAND_START + index;
  if (US_PARAM_COMMANDS.has(code) !== (digits !== undefined)) {
    throw new Error(`encodeForCore: command [${inner}] has the wrong number of parameters`);
  }
  return digits === undefined ? [code] : [code, Number(digits) & 0xff];
};

const encodeGlyph = (char: string): number[] => {
  const glyph = charToGlyph(char);
  return [CORE_GLYPH_PREFIX + (glyph >> 8), glyph & 0xff];
};

const encodeForCore = (text: string): Uint8Array => {
  const bytes: number[] = [];
  let at = 0;
  while (at < text.length) {
    if (text.charAt(at) === '[') {
      const close = text.indexOf(']', at);
      if (close < 0) throw new Error(`encodeForCore: unclosed command in "${text}"`);
      bytes.push(...encodeCommand(text.slice(at + 1, close)));
      at = close + 1;
    } else {
      const char = String.fromCodePoint(text.codePointAt(at) ?? 0);
      bytes.push(...encodeGlyph(char));
      at += char.length;
    }
  }
  return new Uint8Array(bytes);
};

export { encodeForCore };
