/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { COLLECTION_SOURCES } from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/collection-sources';
import { ENTITY_KINDS } from '../../apps/web/src/ui/domains/app/views/DataInspector/DataInspector.constants';
import { resolveIdRef } from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/id-ref-target';
import { buildSchema, createSchemaIndex } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import { describeDataset } from '../dataset-guard';

// The adapter layer against the real dataset. `buildSchema` is imported from its
// own module instead of the ds/data barrel on purpose: the barrel pulls in the
// view-state binding, which touches `window` at module load.

describeDataset('collection sources', () => {
  it('adapts every collection, with real rows behind each one', () => {
    expect(Object.keys(COLLECTION_SOURCES)).toHaveLength(ENTITY_KINDS.length);
    for (const kind of ENTITY_KINDS) {
      const source = COLLECTION_SOURCES[kind];
      expect(source.id).toBe(kind);
      expect(source.label.length).toBeGreaterThan(0);
      expect(source.rows.length).toBeGreaterThan(0);
    }
  });

  // Every id is `${prefix}-${digits}`, where the prefix equals the kind name
  // for every kind except `item-group` (`ig`) and `enumeration` (`enum`). See
  // `KIND_ID_PREFIXES`.
  it('identifies a row by the id the row itself carries, prefixed with its kind', () => {
    const idPrefixes: Partial<Record<string, string>> = { 'item-group': 'ig', enumeration: 'enum' };
    for (const kind of ENTITY_KINDS) {
      const source = COLLECTION_SOURCES[kind];
      const idPattern = new RegExp(`^${idPrefixes[kind] ?? kind}-\\d+$`);
      for (const row of source.rows) {
        expect(source.getId(row)).toBe(row.id);
        expect(source.getId(row)).toMatch(idPattern);
      }
    }
  });

  // Every collection with a write path also has a serializer, so its source
  // tab shows exactly the text a save would produce.
  it('emits source text for every collection that has a serializer, and the record is in it', () => {
    for (const kind of ENTITY_KINDS) {
      const source = COLLECTION_SOURCES[kind];
      const first = source.rows[0];
      const code = source.serialize?.(first);
      expect(code, kind).toBeDefined();
      expect(code).toContain(source.getId(first));
    }
  });

  // A default column set is a list of paths typed by hand; a typo there would
  // silently open the table with a column that renders nothing.
  it('names only paths the derived schema actually has in every default column set', () => {
    for (const kind of ENTITY_KINDS) {
      const source = COLLECTION_SOURCES[kind];
      const schema = createSchemaIndex(buildSchema(source.rows, source.config));
      for (const path of source.config?.defaultColumns ?? []) {
        expect(schema.byPath(path), `${kind}: ${path}`).toBeDefined();
      }
    }
  });

  // Editor groups may name a path no row carries, so existence is not the
  // assertion. Claiming a field twice is: the layout would render it in the
  // first group and silently drop the other.
  it('claims each grouped path once per collection', () => {
    for (const kind of ENTITY_KINDS) {
      const groups = COLLECTION_SOURCES[kind].config?.groups ?? [];
      const paths = groups.flatMap(group => group.paths);
      const ids = groups.map(group => group.id);
      expect(new Set(paths).size, kind).toBe(paths.length);
      expect(new Set(ids).size, kind).toBe(ids.length);
    }
  });

  it('offers a save path for every collection', () => {
    for (const kind of ENTITY_KINDS) {
      expect(COLLECTION_SOURCES[kind].onSave, kind).toBeTypeOf('function');
    }
  });
});

describeDataset('id reference resolution', () => {
  it('resolves the published target kind and a display name', () => {
    const screen = COLLECTION_SOURCES.screen.rows[0];
    const id = COLLECTION_SOURCES.screen.getId(screen);
    const target = resolveIdRef(id, 'screen');
    expect(target?.kind).toBe('screen');
    expect(target?.id).toBe(id);
    expect(target?.label.length).toBeGreaterThan(0);
  });

  it('falls back to the id prefix when no target kind was published', () => {
    const id = COLLECTION_SOURCES.item.getId(COLLECTION_SOURCES.item.rows[0]);
    expect(resolveIdRef(id, undefined)?.kind).toBe('item');
  });

  it('ignores a target kind that names no collection', () => {
    const id = COLLECTION_SOURCES.check.getId(COLLECTION_SOURCES.check.rows[0]);
    expect(resolveIdRef(id, 'nonsense')?.kind).toBe('check');
  });

  it('resolves nothing from an absent, blank or unprefixed reference', () => {
    expect(resolveIdRef(undefined, 'screen')).toBeUndefined();
    expect(resolveIdRef('   ', 'screen')).toBeUndefined();
    expect(resolveIdRef('not-a-known-kind-42', undefined)).toBeUndefined();
  });

  it('trims a reference before resolving it', () => {
    const id = COLLECTION_SOURCES.area.getId(COLLECTION_SOURCES.area.rows[0]);
    expect(resolveIdRef(` ${id} `, undefined)?.id).toBe(id);
  });
});
