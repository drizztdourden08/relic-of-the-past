/* @layer shared-game @kind logic */
import { NUMERIC, PLAIN, RESERVED } from './yaml-emit.constants';

const needsQuotes = (text: string): boolean =>
  text === '' || text !== text.trim() || RESERVED.test(text) || NUMERIC.test(text)
  || !PLAIN.test(text) || text.includes(': ') || text.includes(' #');

const quote = (text: string): string =>
  `"${text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\t/g, '\\t')}"`;

/** A string quoted whenever its plain spelling could read back as anything but that same string. */
const formatString = (text: string): string => (needsQuotes(text) ? quote(text) : text);

export { formatString };
