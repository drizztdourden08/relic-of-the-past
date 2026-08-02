/* @layer tests @kind test */
/**
 * SSR smoke tests for the screen editor's own body panels.
 *
 * There is no jsdom in this repo, and the wizard shell renders through a portal,
 * so the dialog itself cannot be rendered here — these cover the two field
 * panels and the code-preview panel directly. They prove the panels build for
 * every screen kind now that the rows are the design system's `Field` primitive
 * and the preview is the `CodeBlock` composite. Typing, stepping and the write
 * button need a browser and are NOT covered.
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ScreenEditorFieldsTop } from '../../apps/web/src/ui/domains/widgets/navigation/screen-editor/ScreenEditorFieldsTop';
import { ScreenEditorFieldsBottom } from '../../apps/web/src/ui/domains/widgets/navigation/screen-editor/ScreenEditorFieldsBottom';
import { ScreenCodePreview } from '../../apps/web/src/ui/domains/widgets/navigation/screen-editor/ScreenCodePreview';
import { dungeonGeographyFor } from '../../apps/web/src/ui/domains/widgets/navigation/screen-editor/dungeon-geography';
import type { ScreenEditor } from '../../apps/web/src/ui/domains/widgets/navigation/screen-editor/useScreenEditor';

const noop = (): undefined => undefined;
const asyncNoop = async (): Promise<void> => undefined;

/**
 * Only the read surface the two panels touch. Asserted once, here, because a
 * stub that implemented every setter faithfully would still be a stub.
 */
const BASE = {
  kind: 'dungeon', setKind: noop, world: 'light', setWorld: noop,
  dungeonGeography: null, effectiveWorld: 'light', isDungeonLocked: false,
  palaceIdx: '2', handlePalaceChange: noop,
  floor: '0', setFloor: noop, gridX: '1', setGridX: noop, gridY: '2', setGridY: noop,
  effectiveGridX: '1', effectiveGridY: '2',
  interiorKind: 'cave', setInteriorKind: noop,
  randomizerName: 'Test Room', setRandomizerName: noop,
  areaId: 'area-011', setAreaId: noop, locationId: 'location-011', setLocationId: noop,
  areaOptions: [{ value: 'area-011', label: 'An Area' }],
  locationOptions: [{ value: 'location-011', label: 'A Location' }],
  resolvedLocation: 'A Location', resolvedArea: 'An Area',
  creatingArea: false, setCreatingArea: noop, newAreaName: '', setNewAreaName: noop,
  creatingLocation: false, setCreatingLocation: noop, newLocationName: '', setNewLocationName: noop,
  handleCreateArea: asyncNoop, handleCreateLocation: asyncNoop,
  entranceId: '', setEntranceId: noop, selectedTags: [], setSelectedTags: noop,
  hasVariant: false, setHasVariant: noop,
  variantKey: '', setVariantKey: noop, variantLabel: '', setVariantLabel: noop,
  conditionType: 'always', setConditionType: noop,
  condCheckId: '', setCondCheckId: noop, condCheckCollected: false, setCondCheckCollected: noop,
  condFlagAddr: '', setCondFlagAddr: noop, condFlagBit: '', setCondFlagBit: noop,
  condFlagValue: true, setCondFlagValue: noop,
  condEntranceId: '', setCondEntranceId: noop,
  condProgressMin: '', setCondProgressMin: noop, condProgressMax: '', setCondProgressMax: noop,
  newOptionValue: '__new__',
} as unknown as ScreenEditor;

const editor = (over: Partial<ScreenEditor>): ScreenEditor => ({ ...BASE, ...over });

const top = (over: Partial<ScreenEditor> = {}): string =>
  renderToStaticMarkup(createElement(ScreenEditorFieldsTop, { editor: editor(over) }));

const bottom = (over: Partial<ScreenEditor> = {}): string =>
  renderToStaticMarkup(createElement(ScreenEditorFieldsBottom, { editor: editor(over) }));

const KINDS = ['dungeon', 'overworld', 'interior'] as const;

describe('screen editor fields — every screen kind renders', () => {
  for (const kind of KINDS) {
    it(`${kind}: the classification panel builds`, () => {
      expect(() => top({ kind })).not.toThrow();
    });

    it(`${kind}: the identity panel builds`, () => {
      expect(() => bottom({ kind })).not.toThrow();
    });
  }

  it('rows are the design system Field primitive, not a local wrapper', () => {
    expect(top()).toContain('class="field');
    expect(top()).toContain('field__label');
    expect(top()).toContain('field__control');
  });

  it('keeps the editor row classes the panel styles hang off', () => {
    expect(top()).toContain('screen-editor__row');
  });
});

describe('screen editor fields — what each kind offers', () => {
  it('a dungeon offers a palace picker and a floor', () => {
    const markup = top({ kind: 'dungeon' });
    expect(markup).toContain('Palace Index');
    expect(markup).toContain('Floor');
  });

  it('a dungeon names the dungeon its geography came from', () => {
    const geography = dungeonGeographyFor(2);
    expect(geography).not.toBeNull();
    const markup = top({ kind: 'dungeon', dungeonGeography: geography });
    expect(markup).toContain(geography?.randomizerName ?? '');
    expect(markup).toContain('screen-editor__locked-value');
  });

  it('an overworld screen shows its grid as locked rather than editable', () => {
    const markup = top({ kind: 'overworld' });
    expect(markup).toContain('Grid X');
    expect(markup).toContain('screen-editor__locked-value');
    expect(markup).not.toContain('Palace Index');
  });

  it('an interior offers its kind and an entrance id', () => {
    expect(top({ kind: 'interior' })).toContain('Interior Kind');
    expect(bottom({ kind: 'interior' })).toContain('Entrance ID');
  });

  it('a dungeon shows the resolved location locked, not a picker', () => {
    const markup = bottom({ isDungeonLocked: true });
    expect(markup).toContain('A Location');
    expect(markup).toContain('screen-editor__locked-value');
  });

  it('a variant reveals its condition fields only when one is asked for', () => {
    expect(bottom({ hasVariant: false })).not.toContain('Condition');
    expect(bottom({ hasVariant: true })).toContain('Condition');
  });

  it('each condition type reveals its own operands', () => {
    expect(bottom({ hasVariant: true, conditionType: 'check' })).toContain('Check Id');
    expect(bottom({ hasVariant: true, conditionType: 'flag' })).toContain('WRAM Address');
    expect(bottom({ hasVariant: true, conditionType: 'progress' })).toContain('Min Tier');
  });
});

describe('screen code preview', () => {
  const CODE = 'const record = { id: \'screen-183\' };\n';

  it('highlights the generated record through the code composite', () => {
    const markup = renderToStaticMarkup(createElement(ScreenCodePreview, {
      code: CODE, targetPath: 'screens/dungeons/castle.ts',
    }));
    expect(markup).toContain('code-block');
    expect(markup).toContain('screen-183');
    expect(markup).toContain('screens/dungeons/castle.ts');
  });

  it('says why there is no destination instead of showing an empty one', () => {
    const markup = renderToStaticMarkup(createElement(ScreenCodePreview, {
      code: '// A name is required', targetPath: null, unresolved: 'the record is incomplete',
    }));
    expect(markup).toContain('the record is incomplete');
    expect(markup).toContain('A name is required');
  });

  it('shows a write failure when there is one, and nothing when there is not', () => {
    const shown = renderToStaticMarkup(createElement(ScreenCodePreview, {
      code: CODE, targetPath: 'a.ts', error: 'Write failed',
    }));
    const quiet = renderToStaticMarkup(createElement(ScreenCodePreview, {
      code: CODE, targetPath: 'a.ts', error: null,
    }));
    expect(shown).toContain('Write failed');
    expect(quiet).not.toContain('screen-editor__error');
  });
});
