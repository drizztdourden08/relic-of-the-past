/**
 * @layer tooling-scripts
 * @kind logic
 *
 * Record → TypeScript source. Every emitted record is a MULTI-LINE literal (one
 * field per line, one record per readable block) so the per-region files diff
 * cleanly; nested values collapse onto one line when they fit. Plain typed
 * literals only — no `as unknown as X` casts.
 */
const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const WIDTH = 118;

const quote = (s: string): string => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const propKey = (k: string): string => (IDENT.test(k) ? k : quote(k));

const defined = (v: Record<string, unknown>): [string, unknown][] =>
  Object.entries(v).filter(([, val]) => val !== undefined);

const inline = (v: unknown): string => {
  if (v === null) return 'null';
  if (typeof v === 'string') return quote(v);
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.length ? `[${v.map(inline).join(', ')}]` : '[]';
  if (typeof v === 'object') {
    const parts = defined(v as Record<string, unknown>).map(([k, val]) => `${propKey(k)}: ${inline(val)}`);
    return parts.length ? `{ ${parts.join(', ')} }` : '{}';
  }
  throw new Error(`cannot serialize ${typeof v}`);
};

/**
 * `column` is where the value starts (it decides whether the value still fits on
 * one line); `indent` is the indentation of the LINE the value sits on, which is
 * what continuation lines align to.
 */
const pretty = (v: unknown, column: number, indent: number): string => {
  const flat = inline(v);
  if (column + flat.length <= WIDTH) return flat;
  const pad = ' '.repeat(indent);
  const padIn = ' '.repeat(indent + 2);
  if (Array.isArray(v) && v.length) {
    return `[\n${v.map(x => `${padIn}${pretty(x, indent + 2, indent + 2)},`).join('\n')}\n${pad}]`;
  }
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const rows = defined(v as Record<string, unknown>);
    if (rows.length) {
      const body = rows.map(([k, val]) => {
        const at = indent + 2 + propKey(k).length + 2;
        return `${padIn}${propKey(k)}: ${pretty(val, at, indent + 2)},`;
      });
      return `{\n${body.join('\n')}\n${pad}}`;
    }
  }
  return flat;
};

/** One record as a multi-line object literal, fields in `order`. Unknown keys throw. */
const recordLiteral = (record: Record<string, unknown>, order: readonly string[]): string => {
  const stray = Object.keys(record).filter(k => record[k] !== undefined && !order.includes(k));
  if (stray.length) throw new Error(`record ${String(record.id)} has unordered field(s): ${stray.join(', ')}`);
  const rows = order
    .filter(k => record[k] !== undefined)
    .map(k => `    ${propKey(k)}: ${pretty(record[k], 4 + propKey(k).length + 2, 4)},`);
  return `  {\n${rows.join('\n')}\n  },`;
};

interface DataFileSpec {
  typeName: string;
  typeImport: string;
  constName: string;
  records: readonly Record<string, unknown>[];
  order: readonly string[];
  doc?: string;
}

const dataFile = (spec: DataFileSpec): string => {
  const { typeName, typeImport, constName, records, order, doc } = spec;
  const head = `/* @layer shared-game @kind data */\n${doc ? `${doc}\n` : ''}import type { ${typeName} } from '${typeImport}';\n\n`;
  const body = records.length
    ? `const ${constName}: ${typeName}[] = [\n${records.map(r => recordLiteral(r, order)).join('\n')}\n];\n`
    : `const ${constName}: ${typeName}[] = [];\n`;
  return `${head}${body}\nexport { ${constName} };\n`;
};

interface CompositeSpec {
  typeName: string;
  typeImport: string;
  constName: string;
  /** Child module path (no extension) → the const it exports. */
  children: readonly { path: string; constName: string }[];
  doc?: string;
}

const compositeFile = (spec: CompositeSpec): string => {
  const { typeName, typeImport, constName, children, doc } = spec;
  const imports = children.map(c => `import { ${c.constName} } from '${c.path}';`).join('\n');
  const spread = children.map(c => `  ...${c.constName},`).join('\n');
  return [
    '/* @layer shared-game @kind data */',
    doc ?? null,
    `import type { ${typeName} } from '${typeImport}';`,
    imports,
    '',
    `const ${constName}: ${typeName}[] = [`,
    spread,
    '];',
    '',
    `export { ${constName} };`,
    '',
  ].filter(line => line !== null).join('\n');
};

export { compositeFile, dataFile, inline, recordLiteral };
export type { CompositeSpec, DataFileSpec };
