/**
 * @layer tooling-scripts
 * @kind logic
 *
 * R12 — per-component folder-structure policy (warn → error). A "component
 * folder" is any folder under ui/ that contains <FolderName>.tsx. Its root may
 * hold ONLY <Name>.{tsx,css,type.ts,constants.ts} + index.ts; everything else
 * belongs under behavior/ or sub-components/. Emits 'warn' so it never gates
 * while the codebase is brought into shape.
 */
import path from 'path';

const UI_PREFIX = 'apps/desktop/src/ui/';
const posix = path.posix;

const run = async (records) => {
  // Reconstruct the folder tree (direct files + subdirs) from the file list.
  const byDir = new Map();
  const ensure = (d) => { if (!byDir.has(d)) byDir.set(d, { files: new Set(), subdirs: new Set() }); return byDir.get(d); };
  for (const r of records) {
    const dir = posix.dirname(r.rel);
    ensure(dir).files.add(posix.basename(r.rel));
    ensure(posix.dirname(dir)).subdirs.add(posix.basename(dir));
  }

  const findings = [];
  for (const [dir, info] of byDir) {
    const name = posix.basename(dir);
    if (!info.files.has(`${name}.tsx`)) continue; // only validate component folders
    const allowed = new Set([`${name}.tsx`, `${name}.css`, `${name}.type.ts`, `${name}.constants.ts`, 'index.ts']);
    for (const f of info.files) {
      if (!allowed.has(f)) {
        findings.push({
          path: `${dir}/${f}`, tool: 'structure-policy', rule: 'root-file', severity: 'warn',
          message: `Unexpected file in component root "${name}/": ${f} — root allows only ${name}.{tsx,css,type.ts,constants.ts} + index.ts (move to behavior/ or sub-components/)`,
        });
      }
    }
    for (const sd of info.subdirs) {
      if (sd !== 'behavior' && sd !== 'sub-components') {
        findings.push({
          path: `${dir}/${sd}`, tool: 'structure-policy', rule: 'sub-folder', severity: 'warn',
          message: `Unexpected subfolder in component "${name}/": ${sd}/ — only behavior/ and sub-components/ allowed`,
        });
      }
    }
  }
  return findings;
};

const adapter = {
  name: 'structure-policy',
  appliesTo: (r) => r.rel.startsWith(UI_PREFIX),
  available: () => true,
  run,
};

export { adapter };
