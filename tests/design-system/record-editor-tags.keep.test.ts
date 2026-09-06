/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { all, CONNECTION_TAG_METADATA, tagKeysOf, TAG_METADATA } from '@shared/game/data';
import { buildSchema } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import { RecordEditor } from '../../apps/web/src/ui/design-system/composites/RecordEditor';
import { isTagsField } from '../../apps/web/src/ui/design-system/composites/RecordEditor';
import { resolveIdRefOptionsFor } from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/id-ref-options';
import {
  resolveTagSuggestionsFor, tagSuggestionsResolverFor,
} from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/tag-suggestions';
import type { FieldDescriptor } from '../../apps/web/src/ui/design-system/data/schema/field-descriptor';
import { describeDataset } from '../dataset-guard';

// SSR smoke tests plus unit tests over the resolver: which control a tag list
// is offered as and what vocabulary reaches it. Typing and picking need a browser.

const TAG_ENTRY = 'class="tag-input';
const ROW_EDITOR = 'aria-label="Move up"';

const fieldAt = (rows: readonly unknown[], path: string): FieldDescriptor => {
  const field = buildSchema(rows).find((entry) => entry.path === path);
  if (!field) throw new Error(`no field at ${path}`);
  return field;
};

const render = (record: unknown, rows: readonly unknown[]): string =>
  renderToStaticMarkup(createElement(RecordEditor, {
    record,
    schema: buildSchema(rows),
    onSave: async () => undefined,
    resolveIdRefOptions: resolveIdRefOptionsFor,
    resolveTagSuggestions: tagSuggestionsResolverFor(
      (record as { id: string }).id.split('-')[0],
    ),
  }));

/** The terms one record's stored tag references stand for. */
const keysOf = (record: { tags: readonly string[] }): readonly string[] => tagKeysOf(record.tags);

describeDataset('which list of strings is a list of tags', () => {
  it('says yes for the real tag fields, which now hold references named `tags`', () => {
    for (const kind of ['screen', 'connection'] as const) {
      const field = fieldAt(all(kind), 'tags');
      // Every stored value is a `tag-NNN`, so the elements derive as references.
      expect(field.of?.kind, kind).toBe('idRef');
      expect(field.of?.targetKind, kind).toBe('tag');
      expect(isTagsField(field), kind).toBe(true);
    }
  });

  it('still says yes for a plain list of strings named `tags`', () => {
    const strings: FieldDescriptor = {
      path: 'tags', label: 'Tags', kind: 'array', optional: false,
      of: { path: 'tags[]', label: 'Tags item', kind: 'string', optional: false },
    };
    expect(isTagsField(strings)).toBe(true);
  });

  it('says no for a list of strings under any other name', () => {
    const notTags: FieldDescriptor = {
      path: 'aliases', label: 'Aliases', kind: 'array', optional: false,
      of: { path: 'aliases[]', label: 'Aliases item', kind: 'string', optional: false },
    };
    expect(isTagsField(notTags)).toBe(false);
  });

  it('says no for a field named `tags` that is not a list of strings', () => {
    const numbers: FieldDescriptor = {
      path: 'tags', label: 'Tags', kind: 'array', optional: false,
      of: { path: 'tags[]', label: 'Tags item', kind: 'number', optional: false },
    };
    expect(isTagsField(numbers)).toBe(false);
    expect(isTagsField({ ...numbers, kind: 'string', of: undefined })).toBe(false);
  });

  it('matches on the field\'s own key, so a nested one counts too', () => {
    const nested: FieldDescriptor = {
      path: 'meta.tags', label: 'Tags', kind: 'array', optional: false,
      of: { path: 'meta.tags[]', label: 'Tags item', kind: 'string', optional: false },
    };
    expect(isTagsField(nested)).toBe(true);
  });
});

describeDataset('the vocabulary behind a tag field', () => {
  const screenTags = resolveTagSuggestionsFor('screen', fieldAt(all('screen'), 'tags'));

  it('offers the whole canonical taxonomy, including terms nobody has used yet', () => {
    const canonical = TAG_METADATA.map((entry) => entry.id);
    for (const tag of canonical) expect(screenTags, tag).toContain(tag);
    // The dataset uses far fewer than the taxonomy defines, and that gap is the point.
    expect(canonical.length).toBeGreaterThan(0);
  });

  it('offers every term the collection actually holds, in use or not', () => {
    const used = new Set<string>();
    for (const row of all('screen')) for (const key of keysOf(row)) used.add(key);
    expect(used.size).toBeGreaterThan(0);
    for (const key of used) expect(screenTags, key).toContain(key);
  });

  it('is the union of the two, deduped', () => {
    const used = new Set<string>();
    for (const row of all('screen')) for (const key of keysOf(row)) used.add(key);
    const union = new Set([...used, ...TAG_METADATA.map((entry) => entry.id)]);
    expect(new Set(screenTags)).toEqual(union);
    expect(screenTags.length).toBe(union.size);
  });

  it('offers terms, never the ids the records actually store', () => {
    for (const key of screenTags) expect(key, key).toContain(':');
  });

  it('leads with what is in use, because that is the likelier pick', () => {
    const used = new Set<string>();
    for (const row of all('screen')) for (const key of keysOf(row)) used.add(key);
    const leading = screenTags.slice(0, used.size);
    expect(new Set(leading)).toEqual(used);
  });

  it('answers per collection, with that collection\'s own taxonomy', () => {
    const connectionTags = resolveTagSuggestionsFor('connection', fieldAt(all('connection'), 'tags'));
    for (const entry of CONNECTION_TAG_METADATA) expect(connectionTags).toContain(entry.id);
    // The two vocabularies are different sets.
    expect(connectionTags).not.toContain(TAG_METADATA[0].id);
  });

  it('offers nothing for a collection it cannot answer for', () => {
    expect(resolveTagSuggestionsFor('nowhere', fieldAt(all('screen'), 'tags'))).toHaveLength(0);
  });

  it('hands back the same list and the same resolver every time', () => {
    const field = fieldAt(all('screen'), 'tags');
    expect(resolveTagSuggestionsFor('screen', field)).toBe(resolveTagSuggestionsFor('screen', field));
    expect(tagSuggestionsResolverFor('screen')).toBe(tagSuggestionsResolverFor('screen'));
  });
});

describeDataset('the whole form, with a real tag list on it', () => {
  it('renders the tag entry instead of a row per tag', () => {
    const screens = all('screen');
    const record = screens.find((row) => row.tags.length > 1) ?? screens[0];
    const markup = render(record, screens);
    expect(markup).toContain(TAG_ENTRY);
    // The chips read as terms even though the record stores references.
    for (const key of keysOf(record)) expect(markup, key).toContain(key);
    // The rows are what the tag entry replaces, and screens have no other list
    // of single values on them apart from a reference list.
    expect(markup.indexOf(TAG_ENTRY)).toBeGreaterThan(-1);
  });

  it('keeps the rows for a list that is a sequence instead of a vocabulary', () => {
    const dungeons = all('dungeon');
    const record = dungeons.find((row) => (row.roomScreenIds?.length ?? 0) > 1) ?? dungeons[0];
    const markup = renderToStaticMarkup(createElement(RecordEditor, {
      record, schema: buildSchema(dungeons), onSave: async () => undefined,
    }));
    expect(markup).toContain(ROW_EDITOR);
    expect(markup).not.toContain(TAG_ENTRY);
  });
});
