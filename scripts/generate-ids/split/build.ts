/**
 * @layer tooling-scripts
 * @kind logic
 *
 * Seeds → one source string per target file. Groups records by their derived
 * home, emits each leaf, then walks the directory tree upward emitting the
 * composite index that concatenates its children (Composite pattern) so
 * bootstrap only ever imports the top-level ALL_* arrays.
 */
import { compositeFile, dataFile } from './emit';
import { constNameFor, typeImportFor } from './names';
import type { Loose } from './seed-types';

interface KindSpec {
  /** Root folder under shared/game/data, or '' for a single top-level file. */
  root: string;
  typeName: string;
  constSuffix: string;
  order: readonly string[];
  /** Leaf files that must exist even with no records (keeps the on-disk layout stable). */
  alwaysEmit?: readonly string[];
  doc?: string;
}

type FileMap = Map<string, string>;

const groupByFile = (rows: readonly { file: string; record: Loose }[], alwaysEmit: readonly string[] = []): Map<string, Loose[]> => {
  const groups = new Map<string, Loose[]>();
  for (const file of alwaysEmit) groups.set(file, []);
  for (const { file, record } of rows) {
    const bucket = groups.get(file);
    if (bucket) bucket.push(record); else groups.set(file, [record]);
  }
  return groups;
};

const emitLeaves = (groups: Map<string, Loose[]>, spec: KindSpec, out: FileMap): void => {
  for (const [file, records] of groups) {
    out.set(`${file}.ts`, dataFile({
      typeName: spec.typeName,
      typeImport: typeImportFor(file),
      constName: constNameFor(file, spec.constSuffix),
      records,
      order: spec.order,
      doc: spec.doc,
    }));
  }
};

const parentOf = (path: string): string => path.split('/').slice(0, -1).join('/');

/**
 * Every ancestor directory of every leaf, deepest first, so a composite is
 * always emitted after the children it imports are known.
 */
const directoriesOf = (leaves: readonly string[], root: string): string[] => {
  const dirs = new Set<string>();
  for (const leaf of leaves) {
    let dir = parentOf(leaf);
    while (dir) {
      dirs.add(dir);
      if (dir === root) break;
      dir = parentOf(dir);
    }
  }
  return [...dirs].sort((a, b) => b.split('/').length - a.split('/').length);
};

const emitComposites = (leaves: readonly string[], spec: KindSpec, out: FileMap): void => {
  const emitted = new Set<string>(leaves);
  for (const dir of directoriesOf(leaves, spec.root)) {
    const children = [...emitted]
      .filter(path => parentOf(path) === dir)
      .sort()
      .map(path => ({ path: `./${path.slice(dir.length + 1)}`, constName: constNameFor(path, spec.constSuffix) }));
    const indexPath = `${dir}/index`;
    out.set(`${indexPath}.ts`, compositeFile({
      typeName: spec.typeName,
      typeImport: typeImportFor(indexPath),
      constName: constNameFor(dir, spec.constSuffix),
      children,
    }));
    emitted.add(dir);
  }
};

/** A hierarchical kind: leaf data files plus one composite per directory. */
const buildKind = (rows: readonly { file: string; record: Loose }[], spec: KindSpec, out: FileMap): Map<string, Loose[]> => {
  const groups = groupByFile(rows, spec.alwaysEmit);
  emitLeaves(groups, spec, out);
  emitComposites([...groups.keys()], spec, out);
  return groups;
};

/** A single top-level file (dungeons.ts, areas.ts, locations.ts). */
const buildSingle = (records: readonly Loose[], file: string, spec: Omit<KindSpec, 'root'>, out: FileMap): void => {
  out.set(`${file}.ts`, dataFile({
    typeName: spec.typeName,
    typeImport: typeImportFor(file),
    constName: spec.constSuffix,
    records,
    order: spec.order,
    doc: spec.doc,
  }));
};

export { buildKind, buildSingle, directoriesOf, groupByFile };
export type { FileMap, KindSpec };
