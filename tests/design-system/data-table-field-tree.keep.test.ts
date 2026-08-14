/* @layer tests @kind test */
import { describe, it, expect, vi } from 'vitest';
import { all } from '@shared/game/data';
import { buildSchema } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import {
  buildPickerNodes, pickableLeafPaths,
} from '../../apps/web/src/ui/design-system/composites/DataTable/behavior/field-picker-nodes';
import {
  buildFieldMenuItems,
} from '../../apps/web/src/ui/design-system/composites/DataTable/behavior/field-menu-items';
import type { MenuItem } from '../../apps/web/src/ui/design-system/composites/DropdownMenu';
import type { FieldDescriptor } from '../../apps/web/src/ui/design-system/data/schema/field-descriptor';
import { describeDataset } from '../dataset-guard';

// The two halves of "which field would you like?": the recursive walk that
// turns a schema into a choosable tree, and the adapter that hands that tree to
// a menu as nested entries. Where those entries END UP — a column's ⋯ menu and
// the footer's — is asserted in data-table-menus.test.ts.

const field = (path: string, kind: FieldDescriptor['kind'], children?: FieldDescriptor[]): FieldDescriptor => {
  const descriptor: FieldDescriptor = { path, label: path, kind, optional: false };
  if (children) descriptor.children = children;
  return descriptor;
};

const NESTED: readonly FieldDescriptor[] = [
  field('id', 'idRef'),
  field('outer', 'object', [
    field('outer.a', 'string'),
    field('outer.mid', 'object', [
      field('outer.mid.b', 'number'),
      field('outer.mid.deep', 'union', [field('outer.mid.deep.c', 'boolean')]),
    ]),
  ]),
  field('tags', 'array'),
];

describeDataset('FieldPicker — the recursive walk', () => {
  it('makes leaves pickable and object/union nodes submenus', () => {
    const [id, outer] = buildPickerNodes(NESTED);
    expect(id.pickable).toBe(true);
    expect(id.children).toEqual([]);
    expect(outer.pickable).toBe(false);
    expect(outer.children.map((child) => child.path)).toEqual(['outer.a', 'outer.mid']);
  });

  it('recurses to any depth the schema has', () => {
    expect(pickableLeafPaths(buildPickerNodes(NESTED)))
      .toEqual(['id', 'outer.a', 'outer.mid.b', 'outer.mid.deep.c', 'tags']);
  });

  it('treats an array as a leaf — element paths are not addressable', () => {
    const arrayField = field('tags', 'array');
    arrayField.of = field('tags[]', 'string');
    expect(buildPickerNodes([arrayField])[0].pickable).toBe(true);
  });

  it('drops excluded leaves', () => {
    expect(pickableLeafPaths(buildPickerNodes(NESTED, ['id', 'outer.mid.b'])))
      .toEqual(['outer.a', 'outer.mid.deep.c', 'tags']);
  });

  it('drops a branch once its whole subtree is excluded, but keeps a partial one', () => {
    const paths = buildPickerNodes(NESTED, ['outer.mid.b', 'outer.mid.deep.c']).map((node) => node.path);
    expect(paths).toEqual(['id', 'outer', 'tags']);
    const outer = buildPickerNodes(NESTED, ['outer.mid.b', 'outer.mid.deep.c'])[1];
    expect(outer.children.map((child) => child.path)).toEqual(['outer.a']);
  });

  it('empties out entirely when every field is already in use', () => {
    expect(buildPickerNodes(NESTED, pickableLeafPaths(buildPickerNodes(NESTED)))).toEqual([]);
  });

  it('walks a real collection schema without losing a nested field', () => {
    const schema = buildSchema(all('connection'));
    const leaves = pickableLeafPaths(buildPickerNodes(schema));
    expect(leaves).toContain('id');
    expect(leaves).toContain('placement.side');
    expect(leaves).not.toContain('placement');
  });
});

describeDataset('the field tree as menu entries', () => {
  const items = (exclude: readonly string[] = [], onPick = vi.fn()) => ({
    onPick,
    entries: buildFieldMenuItems({ nodes: buildPickerNodes(NESTED, exclude), onPick }),
  });

  it('turns a leaf into an acting entry and a branch into a submenu', () => {
    const { entries } = items();
    const [id, outer] = entries;
    expect(id.onClick).toBeTypeOf('function');
    expect(id.children).toBeUndefined();
    expect(outer.onClick).toBeUndefined();
    expect(outer.children?.map((child) => child.key)).toEqual(['outer.a', 'outer.mid']);
  });

  it('keeps nesting, so a menu can open a grandchild rather than showing a dead row', () => {
    const mid = items().entries[1].children?.[1] as MenuItem;
    expect(mid.children?.map((child) => child.key)).toEqual(['outer.mid.b', 'outer.mid.deep']);
    expect(mid.children?.[1].children?.[0].key).toBe('outer.mid.deep.c');
  });

  it('reports the path it was asked about, from whatever depth it sits at', () => {
    const { onPick, entries } = items();
    const deep = entries[1].children?.[1].children?.[1].children?.[0] as MenuItem;
    deep.onClick?.();
    expect(onPick).toHaveBeenCalledWith('outer.mid.deep.c');
  });

  it('says so, greyed, rather than offering an empty submenu', () => {
    const { entries } = items(pickableLeafPaths(buildPickerNodes(NESTED)));
    expect(entries).toHaveLength(1);
    expect(entries[0].disabled).toBe(true);
    expect(entries[0].onClick).toBeUndefined();
  });
});
