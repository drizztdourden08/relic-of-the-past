/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { all } from '@shared/game/data';
import { buildSchema } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import { RecordEditor } from '../../apps/web/src/ui/design-system/composites/RecordEditor';
import { resolveIdRefOptionsFor } from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/id-ref-options';
import { describeDataset } from '../dataset-guard';

// The identity field ("id") stays read-only on a writable record: the fix for
// the rename-then-clobber bug (record-writers.ts uses the EDITED id as the
// file-search key) and, for item-group, the sibling-id footgun (7 rows make
// `id` infer as an enum, rendering a dropdown of other records' ids).

const noop = async (): Promise<void> => undefined;

const inputTagFor = (markup: string, value: string): string => {
  const match = markup.match(new RegExp(`<input[^>]*value="${value}"[^>]*>`));
  if (!match) throw new Error(`no <input> found with value="${value}"`);
  return match[0];
};

const buttonTagFor = (markup: string, text: string): string => {
  const match = markup.match(new RegExp(`<button[^>]*>${text}</button>`));
  if (!match) throw new Error(`no <button> found with text "${text}"`);
  return match[0];
};

describeDataset('RecordEditor keeps the identity field read-only', () => {
  it('disables the id control on a writable tag record while a sibling field stays editable', () => {
    const rows = all('tag');
    const record = rows[0];
    const markup = renderToStaticMarkup(createElement(RecordEditor, {
      record,
      schema: buildSchema(rows),
      onSave: noop,
      resolveIdRefOptions: resolveIdRefOptionsFor,
    }));
    expect(inputTagFor(markup, String(record.id))).toContain('disabled=""');
    expect(inputTagFor(markup, String(record.label))).not.toContain('disabled=""');
  });

  it('disables the id control on a writable screen record the same way', () => {
    const rows = all('screen');
    const record = rows[0];
    const markup = renderToStaticMarkup(createElement(RecordEditor, {
      record,
      schema: buildSchema(rows),
      onSave: noop,
      resolveIdRefOptions: resolveIdRefOptionsFor,
    }));
    expect(inputTagFor(markup, String(record.id))).toContain('disabled=""');
  });

  it('no longer lets item-group\'s id offer a sibling id as a clickable choice', () => {
    const rows = all('item-group');
    const record = rows[0];
    const field = buildSchema(rows).find((entry) => entry.path === 'id');
    // Confirms the premise: with 7 rows, id infers as a closed set, which is
    // exactly what routed it to a picker in the first place.
    expect(field?.kind).toBe('enum');

    const sibling = rows.find((row) => row.id !== record.id);
    expect(sibling).toBeDefined();

    const markup = renderToStaticMarkup(createElement(RecordEditor, {
      record,
      schema: buildSchema(rows),
      onSave: noop,
    }));
    // The sibling's id still appears as an option (it is a real enum value),
    // but the button for it must be disabled, so it can no longer be picked.
    expect(buttonTagFor(markup, String(sibling?.id))).toContain('disabled=""');
    // A sibling member field on the same record stays editable.
    // (`label` is not used for this check: with only 7 rows it infers as its
    // own enum, same as `id`, so it is not a representative "ordinary" field.)
    expect(inputTagFor(markup, String(record.memberIds[0]))).not.toContain('disabled=""');
  });
});
