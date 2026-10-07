/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { all } from '@shared/game/data';
import { buildSchema } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import { setPath } from '../../apps/web/src/ui/design-system/data/schema/path';
import { changedPaths, hasPathChanged } from '../../apps/web/src/ui/design-system/composites/RecordEditor/behavior/dirty-paths';
import { layoutGroups } from '../../apps/web/src/ui/design-system/composites/RecordEditor/behavior/layout-groups';
import type { FieldDescriptor, SchemaConfig } from '../../apps/web/src/ui/design-system/data/schema/field-descriptor';
import { describeDataset } from '../dataset-guard';

// The two pieces of the editor that are pure functions: what counts as changed,
// and how a schema lays itself out with and without a config to steer it.

const connections = all('connection');
const withRect = connections.find((row) => row.placement.form === 'area');
if (!withRect) throw new Error('the dataset no longer holds an area placement');

const PATHS = ['id', 'tags', 'placement', 'placement.rect', 'placement.rect.x', 'placement.rect.y'];

describeDataset('dirty tracking of which paths changed', () => {
  it('reports nothing changed for the record itself', () => {
    expect(changedPaths(withRect, withRect, PATHS)).toEqual([]);
    expect(hasPathChanged(withRect, withRect, '')).toBe(false);
  });

  it('reports the edited leaf and every container above it, and nothing else', () => {
    const working = setPath(withRect, 'placement.rect.x', 999);
    const changed = changedPaths(withRect, working, PATHS);
    expect(changed).toContain('placement.rect.x');
    expect(changed).toContain('placement.rect');
    expect(changed).toContain('placement');
    expect(changed).not.toContain('placement.rect.y');
    expect(changed).not.toContain('id');
    expect(changed).not.toContain('tags');
  });

  it('answers the whole-record question through the empty path', () => {
    const working = setPath(withRect, 'direction', 'one-way');
    expect(hasPathChanged(withRect, working, '')).toBe(hasPathChanged(withRect, working, 'direction'));
    expect(hasPathChanged(withRect, working, '')).toBe(true);
  });

  it('leaves the original record untouched, because edits are immutable', () => {
    const before = JSON.stringify(withRect);
    setPath(withRect, 'placement.rect.x', 1234);
    expect(JSON.stringify(withRect)).toBe(before);
  });

  it('does not call a value edited back to what it was a change', () => {
    const original = withRect.placement?.at === 'area' ? withRect.placement.rect.x : 0;
    const working = setPath(setPath(withRect, 'placement.rect.x', 999), 'placement.rect.x', original);
    // The container was rewritten, so identity says different and only the
    // serialised compare gets this right.
    expect(working.placement).not.toBe(withRect.placement);
    expect(hasPathChanged(withRect, working, 'placement')).toBe(false);
    expect(hasPathChanged(withRect, working, '')).toBe(false);
  });

  it('treats an added optional field as a change', () => {
    const working = setPath(withRect, 'name', 'a name it did not have');
    expect(hasPathChanged(withRect, working, 'name')).toBe(true);
  });
});

describeDataset('auto-layout on a real schema with no config at all', () => {
  const schema = buildSchema(all('screen'));

  it('lays every top-level field out as one unnamed group', () => {
    const groups = layoutGroups(schema);
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBeUndefined();
    expect(groups[0].fields.length).toBeGreaterThan(0);
    expect(groups[0].fields).toHaveLength(schema.length);
  });

  it('keeps schema order', () => {
    const groups = layoutGroups(schema);
    expect(groups[0].fields.map((field) => field.path)).toEqual(schema.map((field) => field.path));
  });

  it('does the same for two other real collections', () => {
    for (const rows of [all('connection'), all('item')]) {
      const groups = layoutGroups(buildSchema(rows));
      expect(groups).toHaveLength(1);
      expect(groups[0].fields.length).toBeGreaterThan(0);
    }
  });
});

describeDataset('auto-layout with a config steering it', () => {
  const rows = all('connection');
  const config: SchemaConfig = {
    groups: [
      { id: 'ends', label: 'Endpoints', paths: ['toConnectionId', 'screenId'] },
      { id: 'empty', label: 'Nothing here', paths: ['no.such.path'] },
    ],
  };
  const schema = buildSchema(rows, config);
  const groups = layoutGroups(schema, config);

  it('renders configured groups first, in config order, and drops empty ones', () => {
    expect(groups[0].id).toBe('ends');
    expect(groups.map((group) => group.id)).not.toContain('empty');
  });

  it('orders fields within a group the way the group names them', () => {
    expect(groups[0].fields.map((field) => field.path)).toEqual(['toConnectionId', 'screenId']);
  });

  it('puts everything unclaimed in a final implicit group instead of losing it', () => {
    const last = groups[groups.length - 1];
    expect(last.id).toBe('other');
    const laidOut = groups.flatMap((group) => group.fields.map((field) => field.path));
    expect(new Set(laidOut)).toEqual(new Set(schema.map((field) => field.path)));
  });

  it('omits hidden fields', () => {
    const hidden: SchemaConfig = { hidden: ['tags'] };
    const paths = layoutGroups(buildSchema(rows, hidden), hidden)
      .flatMap((group) => group.fields.map((field: FieldDescriptor) => field.path));
    expect(paths).not.toContain('tags');
    expect(paths).toContain('id');
  });
});
