/* @layer shared-game @kind logic */
import { WIDTH } from './record-codegen.constants';
import { definedEntries } from './defined-entries';
import { inlineLiteral } from './inline-literal';
import { propKey } from './prop-key';

const prettyLiteral = (v: unknown, column: number, indent: number): string => {
  const flat = inlineLiteral(v);
  if (column + flat.length <= WIDTH) return flat;
  const pad = ' '.repeat(indent);
  const padIn = ' '.repeat(indent + 2);
  if (Array.isArray(v) && v.length) {
    return `[\n${v.map(x => `${padIn}${prettyLiteral(x, indent + 2, indent + 2)},`).join('\n')}\n${pad}]`;
  }
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const rows = definedEntries(v as Record<string, unknown>);
    if (rows.length) {
      const body = rows.map(([k, val]) => {
        const at = indent + 2 + propKey(k).length + 2;
        return `${padIn}${propKey(k)}: ${prettyLiteral(val, at, indent + 2)},`;
      });
      return `{\n${body.join('\n')}\n${pad}}`;
    }
  }
  return flat;
};

export { prettyLiteral };
