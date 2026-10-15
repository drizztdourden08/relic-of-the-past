/* @layer tooling-scripts @kind logic */
import { capFor } from '../policy.mjs';

const run = async (records) =>
  records.flatMap((r) => {
    const cap = capFor(r.kind);
    if (cap == null || r.code <= cap) return [];
    return [{
      path: r.rel, tool: 'line-policy', rule: 'max-lines', severity: 'error',
      message: `${r.kind} file has ${r.code} code lines (cap ${cap})`,
    }];
  });

const adapter = { name: 'line-policy', appliesTo: () => true, available: () => true, run };

export { adapter };
