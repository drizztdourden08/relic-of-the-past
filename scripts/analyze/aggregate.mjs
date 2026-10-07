/**
 * @layer tooling-scripts
 * @kind logic
 *
 * Merge FileRecords + Findings into one report. Vendored (zelda3) findings are
 * downgraded to 'info' hints and never count as violations. Prints summary
 * tables + violations and returns the report object.
 */
const countBy = (rows, key) => {
  const m = {};
  for (const r of rows) m[r[key]] = (m[r[key]] ?? 0) + 1;
  return Object.fromEntries(Object.entries(m).sort((a, b) => b[1] - a[1]));
};

const buildReport = (records, findings, stampedAt) => {
  const vendored = new Set(records.filter((r) => r.vendored).map((r) => r.rel));
  const graded = findings.map((f) => (vendored.has(f.path) ? { ...f, severity: 'info' } : f));
  const violations = graded.filter((f) => f.severity === 'error');
  return {
    generatedAt: stampedAt,
    totals: {
      files: records.length,
      untagged: records.filter((r) => r.tagSource === 'heuristic').length,
      byLayer: countBy(records, 'layer'),
      byKind: countBy(records, 'kind'),
    },
    files: records,
    findings: graded,
    violations,
  };
};

const printReport = (report) => {
  const { totals, findings, violations } = report;
  console.log(`\nFiles: ${totals.files}   Untagged: ${totals.untagged}`);
  console.log('\nBy kind:', JSON.stringify(totals.byKind));
  const byTool = {};
  for (const f of findings) {
    byTool[f.tool] ??= { error: 0, warn: 0, info: 0 };
    byTool[f.tool][f.severity]++;
  }
  console.log('\nFindings by tool (error/warn/info):');
  for (const [t, c] of Object.entries(byTool)) console.log(`  ${t.padEnd(14)} ${c.error}e / ${c.warn}w / ${c.info}i`);

  const cap = violations.slice(0, 40);
  console.log(`\nVIOLATIONS (gating errors): ${violations.length}`);
  for (const v of cap) console.log(`  ${v.tool.padEnd(12)} ${v.rule.padEnd(16)} ${v.path}${v.line ? ':' + v.line : ''}  ${v.message}`);
  if (violations.length > cap.length) console.log(`  ... +${violations.length - cap.length} more`);
};

export { buildReport, printReport };
