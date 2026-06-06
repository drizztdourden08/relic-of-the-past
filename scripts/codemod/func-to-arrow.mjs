// Codemod: convert named `function NAME(...) {}` declarations to arrow consts
// `const NAME = (...) => {}`. Guards skip cases where conversion would change
// behavior or break:
//   - generators (function*)            — can't be arrows
//   - overload signatures / no body     — can't convert
//   - `this` usage or `this` param      — arrows don't bind `this`
//   - exported/default                  — (exports already moved to end by the
//                                          inline-export codemod; default skipped)
//
// Hoisting note: declarations are NOT reordered. A const arrow referenced before
// its definition at module-eval would TDZ — caught by the boot check, not tsc.
//
// Usage: node scripts/codemod/func-to-arrow.mjs <glob> [<glob> ...]
import { Project, SyntaxKind } from 'ts-morph';

const globs = process.argv.slice(2);
if (globs.length === 0) { console.error('need glob args'); process.exit(1); }

const project = new Project({ skipAddingFilesFromTsConfig: true });
project.addSourceFilesAtPaths(globs);

let count = 0, fileCount = 0, skipped = 0;

// ts-morph re-wraps a source file after each structural edit, invalidating other
// node references. So re-query after every conversion: convert the first eligible
// function, then re-scan, until none remain.
const tryConvert = (fn) => {
  const name = fn.getName();
  if (!name) return false;
  if (fn.isGenerator()) { skipped++; return false; }
  const body = fn.getBody();
  if (!body) { skipped++; return false; }
  if (fn.getOverloads && fn.getOverloads().length > 0) { skipped++; return false; }
  // Skip only INLINE `export` (would need `export const`) and default exports.
  // A function exported via an end-of-file `export { }` block converts fine — the
  // block keeps referencing the new const. isExported() is too broad (it's true for
  // anything named in an export block), so check the actual modifier instead.
  if (fn.hasExportKeyword() || fn.isDefaultExport()) { skipped++; return false; }
  const params = fn.getParameters();
  if (params.length && params[0].getName() === 'this') { skipped++; return false; }
  if (body.getDescendantsOfKind(SyntaxKind.ThisKeyword).length > 0) { skipped++; return false; }

  const isAsync = fn.isAsync();
  const tps = fn.getTypeParameters();
  const generics = tps.length ? `<${tps.map(t => t.getText()).join(', ')},>` : '';
  const paramText = params.map(p => p.getText()).join(', ');
  const rt = fn.getReturnTypeNode();
  const retText = rt ? `: ${rt.getText()}` : '';
  const arrow = `const ${name} = ${isAsync ? 'async ' : ''}${generics}(${paramText})${retText} => ${body.getText()};`;
  fn.replaceWithText(arrow);
  return true;
};

for (const sf of project.getSourceFiles()) {
  if (sf.getFilePath().endsWith('.d.ts')) continue;
  let changed = false;
  // Converge: convert the first eligible function, re-scan, repeat. The `done` set
  // remembers functions we already decided to skip so we don't loop forever.
  const skippedNames = new Set();
  for (;;) {
    const fns = sf.getDescendantsOfKind(SyntaxKind.FunctionDeclaration);
    const next = fns.find(fn => !skippedNames.has(fn.getStart() + ':' + (fn.getName() ?? '')));
    if (!next) break;
    const key = next.getStart() + ':' + (next.getName() ?? '');
    if (tryConvert(next)) { count++; changed = true; }
    else skippedNames.add(key);
  }
  if (changed) fileCount++;
}

project.saveSync();
console.log(`func-to-arrow: ${count} converted across ${fileCount} files, ${skipped} skipped (generator/overload/this/exported)`);
