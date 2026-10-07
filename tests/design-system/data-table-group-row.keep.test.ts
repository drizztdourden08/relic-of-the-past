/* @layer tests @kind test */
import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { all } from '@shared/game/data';
import { buildSchema, createSchemaIndex } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import type * as GroupRowModule from '../../apps/web/src/ui/design-system/composites/DataTable/sub-components/GroupRow';
import { describeDataset } from '../dataset-guard';

// SSR smoke tests for one group-header row: its depth, key, field label and
// count. See data-table-render.test.ts for why these are SSR-only.

const screens = all('screen') as readonly Record<string, unknown>[];

let GroupRow: typeof GroupRowModule.GroupRow;

beforeEach(async () => {
  vi.resetModules();
  const load = vi.fn().mockResolvedValue({});
  const save = vi.fn().mockResolvedValue(undefined);
  // The view-state binding reaches lib/storage -> log-bus, which touches
  // window at module load, so the stub has to precede the import.
  vi.stubGlobal('window', {
    api: { uiViews: { load, save } },
    addEventListener: () => {},
    removeEventListener: () => {},
  });
  ({ GroupRow } = await import(
    '../../apps/web/src/ui/design-system/composites/DataTable/sub-components/GroupRow'
  ));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describeDataset('GroupRow level, key and count', () => {
  const renderGroup = (extra: Record<string, unknown> = {}): string => {
    const schema = createSchemaIndex(buildSchema(screens));
    return renderToStaticMarkup(createElement(GroupRow, {
      level: 0, groupKey: String(screens[0].kind), field: schema.byPath('kind'),
      count: 7, expanded: true, onToggle: () => {}, ...extra,
    }));
  };

  it('shows which field grouped it, the value and how many are under it', () => {
    const markup = renderGroup();
    expect(markup).toContain('Kind');
    expect(markup).toContain(String(screens[0].kind));
    expect(markup).toContain('7');
  });

  it('flips its chevron and its label with the collapse state', () => {
    expect(renderGroup()).toContain('Collapse group');
    expect(renderGroup({ expanded: false })).toContain('Expand group');
  });

  it('indents by depth, so layered grouping reads as a tree', () => {
    expect(renderGroup({ level: 2 })).toContain('* 3');
  });

  it('renders an absent group value as a dash instead of a blank row', () => {
    expect(renderGroup({ groupKey: '' })).toContain('-');
  });

  it('puts the field label after the group key, not before it', () => {
    const markup = renderGroup();
    const keyIndex = markup.indexOf(String(screens[0].kind));
    const labelIndex = markup.indexOf('Kind');
    expect(keyIndex).toBeGreaterThanOrEqual(0);
    expect(labelIndex).toBeGreaterThan(keyIndex);
  });

  it('pins the field label and the count together in the sticky trailing wrapper', () => {
    const markup = renderGroup();
    const totalIndex = markup.indexOf('data-table__group-total');
    const fieldIndex = markup.indexOf('data-table__group-field');
    const countIndex = markup.indexOf('data-table__group-count');
    expect(totalIndex).toBeGreaterThanOrEqual(0);
    expect(fieldIndex).toBeGreaterThan(totalIndex);
    expect(countIndex).toBeGreaterThan(fieldIndex);
  });
});
