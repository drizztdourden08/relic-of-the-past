/* @layer shared-game @kind logic */
/**
 * A small block-style YAML emitter: scalars, nested objects and arrays, two
 * spaces per level. Enough for an Archipelago player file, with no dependency.
 * A string is quoted whenever its plain spelling could read back as anything
 * other than that same string (a number, a boolean, null, or YAML syntax).
 *
 * The word `random` is never written bare. Archipelago reads it, as an option value, as its
 * own keyword for "roll one"; an option is resolved to a fixed spelling before it gets here
 * (concrete-option-values.ts), and any nested `random` (the pre-rolled readings) is quoted.
 */

type YamlValue = string | number | boolean | null | undefined | readonly unknown[] | { [key: string]: unknown };

const INDENT = '  ';

/** Words YAML 1.1 and 1.2 readers turn into booleans or null, and Archipelago's roll keyword. */
const RESERVED = /^(?:true|false|yes|no|on|off|y|n|null|~|random)$/i;
const NUMERIC = /^[-+]?(?:\d[\d_]*(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?$|^0x[\da-f]+$|^0o[0-7]+$|^[-+]?\.(?:inf|nan)$/i;
const PLAIN = /^[A-Za-z_./][\w ./()-]*$/;

const needsQuotes = (text: string): boolean =>
  text === '' || text !== text.trim() || RESERVED.test(text) || NUMERIC.test(text)
  || !PLAIN.test(text) || text.includes(': ') || text.includes(' #');

const quote = (text: string): string =>
  `"${text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\t/g, '\\t')}"`;

const formatString = (text: string): string => (needsQuotes(text) ? quote(text) : text);

const formatKey = (key: string): string => formatString(key);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const formatScalar = (value: unknown): string => {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'null';
  return formatString(String(value));
};

/** True for a value written on its own lines under its key, false for one written inline. */
const isBlock = (value: unknown): boolean =>
  (Array.isArray(value) && value.length > 0) || (isRecord(value) && Object.keys(value).length > 0);

const inlineEmpty = (value: unknown): string | null => {
  if (Array.isArray(value) && value.length === 0) return '[]';
  if (isRecord(value) && Object.keys(value).length === 0) return '{}';
  return null;
};

const emitLines = (value: unknown, depth: number): string[] => {
  const pad = INDENT.repeat(depth);
  if (Array.isArray(value)) return value.flatMap((item) => emitItem(item, depth));
  if (isRecord(value)) {
    return Object.entries(value).flatMap(([key, child]) => {
      if (isBlock(child)) return [`${pad}${formatKey(key)}:`, ...emitLines(child, depth + 1)];
      return [`${pad}${formatKey(key)}: ${inlineEmpty(child) ?? formatScalar(child)}`];
    });
  }
  return [`${pad}${formatScalar(value)}`];
};

/** One array entry: "- scalar", or a block whose first line joins the dash. */
const emitItem = (item: unknown, depth: number): string[] => {
  const pad = INDENT.repeat(depth);
  if (!isBlock(item)) return [`${pad}- ${inlineEmpty(item) ?? formatScalar(item)}`];
  const [first, ...rest] = emitLines(item, depth + 1);
  return [`${pad}- ${first.trimStart()}`, ...rest];
};

/** The whole document, ending in a newline. A top-level scalar is written on its own. */
const emitYaml = (value: YamlValue): string => `${emitLines(value, 0).join('\n')}\n`;

export { emitYaml, formatScalar };
export type { YamlValue };
