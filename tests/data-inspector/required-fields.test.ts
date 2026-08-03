/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { requiredPaths } from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/required-fields';
import { blankRecordFor } from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/blank-record';
import { getPath } from '../../apps/web/src/ui/design-system/data/schema/path';
import type { FieldDescriptor } from '../../apps/web/src/ui/design-system/data/schema/field-descriptor';

const field = (path: string, kind: FieldDescriptor['kind'], overrides: Partial<FieldDescriptor> = {}): FieldDescriptor =>
  ({ path, label: path, kind, optional: false, ...overrides });

describe('requiredPaths', () => {
  it('names every non-optional top-level field, and none of the optional ones', () => {
    const schema = [
      field('randomizerName', 'string'),
      field('vanillaName', 'string', { optional: true }),
      field('world', 'enum', { options: ['light', 'dark'] }),
    ];
    expect(requiredPaths(schema)).toEqual(['randomizerName', 'world']);
  });

  it('recurses into a required object\'s own required children', () => {
    const schema = [
      field('gameId', 'object', {
        children: [
          field('gameId.roomIndex', 'number', { optional: true }),
          field('gameId.palaceIndex', 'number'),
        ],
      }),
    ];
    expect(requiredPaths(schema)).toEqual(['gameId', 'gameId.palaceIndex']);
  });

  it('does not follow an array or a union past its own top path', () => {
    const schema = [
      field('tags', 'array', { of: field('tags[]', 'idRef', { optional: false }) }),
      field('requirements', 'union', {
        optional: false,
        children: [field('requirements.itemId', 'idRef', { optional: true })],
      }),
    ];
    expect(requiredPaths(schema)).toEqual(['tags', 'requirements']);
  });

  it('skips a field a config or a create schema has marked hidden', () => {
    const schema = [field('id', 'string'), field('name', 'string', { hidden: true })];
    expect(requiredPaths(schema)).toEqual(['id']);
  });

  it('names nothing for a schema with no required fields at all', () => {
    expect(requiredPaths([field('note', 'string', { optional: true })])).toEqual([]);
  });
});

describe('blankRecordFor + requiredPaths together gate a create form', () => {
  const schema = [
    field('randomizerName', 'string'),
    field('vanillaName', 'string', { optional: true }),
    field('world', 'enum', { options: ['light', 'dark'] }),
  ];

  it('a fresh blank draft is missing its required string field', () => {
    const draft = blankRecordFor(schema);
    const paths = requiredPaths(schema);
    expect(paths.some((path) => !getPath(draft, path) || getPath(draft, path) === '')).toBe(true);
  });

  it('a draft with every required field filled in satisfies them all', () => {
    const draft = { ...blankRecordFor(schema), randomizerName: 'The Wilds' };
    const paths = requiredPaths(schema);
    const missing = paths.filter((path) => {
      const value = getPath(draft, path);
      return value === undefined || value === null || value === '';
    });
    expect(missing).toEqual([]);
  });
});
