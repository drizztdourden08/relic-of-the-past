/* @layer tooling-scripts @kind logic */
// Codemod: convert inline `export const/function/class/interface/type/enum NAME`
// into a bare declaration + a grouped `export { ... }` / `export type { ... }` at
// the end of the file. Declarations are NOT reordered, so there is no hoisting risk.
//
// Usage: node scripts/codemod/inline-export-to-end.mjs <glob> [<glob> ...]
import { Project, Node } from 'ts-morph';

const globs = process.argv.slice(2);
if (globs.length === 0) { console.error('need glob args'); process.exit(1); }

const project = new Project({ skipAddingFilesFromTsConfig: true });
project.addSourceFilesAtPaths(globs);

let changedFiles = 0;
let movedDecls = 0;

for (const sf of project.getSourceFiles()) {
  const fp = sf.getFilePath();
  if (fp.endsWith('.d.ts')) continue;

  const values = [];
  const types = [];

  for (const stmt of sf.getStatements()) {
    // Only named, non-default exported declarations.
    if (!Node.isExportable(stmt)) continue;
    if (!stmt.hasExportKeyword?.() || stmt.hasDefaultKeyword?.()) continue;

    if (Node.isVariableStatement(stmt)) {
      const names = stmt.getDeclarations().map(d => d.getName());
      stmt.setIsExported(false);
      values.push(...names);
    } else if (Node.isFunctionDeclaration(stmt) || Node.isClassDeclaration(stmt) || Node.isEnumDeclaration(stmt)) {
      const name = stmt.getName();
      if (!name) continue;
      stmt.setIsExported(false);
      values.push(name);
    } else if (Node.isInterfaceDeclaration(stmt) || Node.isTypeAliasDeclaration(stmt)) {
      const name = stmt.getName();
      if (!name) continue;
      stmt.setIsExported(false);
      types.push(name);
    }
  }

  if (values.length === 0 && types.length === 0) continue;

  if (values.length) sf.addExportDeclaration({ namedExports: values });
  if (types.length) sf.addExportDeclaration({ namedExports: types, isTypeOnly: true });
  movedDecls += values.length + types.length;
  changedFiles++;
}

project.saveSync();
console.log(`inline-export codemod: ${changedFiles} files changed, ${movedDecls} declarations moved to end`);
