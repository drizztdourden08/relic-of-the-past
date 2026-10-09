/* @layer shared-game @kind logic */
import type { FieldSpec } from './record-codegen.type';
import { RECORD_INDENT } from './record-codegen.constants';
import { prettyLiteral } from './pretty-literal';
import { propKey } from './prop-key';

const recordLiteral = <T,>(record: T, spec: FieldSpec<T>): string => {
  const row = record as Record<string, unknown>;
  const stray = Object.keys(row).filter(k => row[k] !== undefined && !(k in spec.known));
  if (stray.length) throw new Error(`record has field(s) the emitter does not know: ${stray.join(', ')}`);
  const rows = spec.order
    .filter(k => row[k] !== undefined)
    .map(k => `    ${propKey(k)}: ${prettyLiteral(row[k], RECORD_INDENT + propKey(k).length + 2, RECORD_INDENT)},`);
  return `  {\n${rows.join('\n')}\n  },`;
};

export { recordLiteral };
