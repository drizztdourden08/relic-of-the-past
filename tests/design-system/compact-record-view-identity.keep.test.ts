/* @layer tests @kind test */
/**
 * The identity field is exempt from `resolveIdRefDisplay`, split out of
 * `compact-record-view-render.test.ts` (already near the line cap) alongside
 * `id-ref-display-default.test.ts`'s equivalent coverage for `DataTable`.
 *
 * A collection's own `id` is itself id-shaped, so it infers as `idRef`
 * targeting its own collection — with the default resolver wired in
 * generally, that would otherwise look the id up and hand back its own name,
 * making the `Id` row repeat whatever name field the record already shows
 * elsewhere. The `Id` row's one job is showing the id.
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { all } from '@shared/game/data';
import { buildSchema } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import { CompactRecordView } from '../../apps/web/src/ui/design-system/composites/CompactRecordView';
import { defaultIdRefDisplay } from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/record-links';
import { describeDataset } from '../dataset-guard';

describeDataset('CompactRecordView — the identity field always shows its own id', () => {
  it('is itself inferred as idRef, targeting its own collection', () => {
    const rows = all('screen');
    const schema = buildSchema(rows);
    const idField = schema.find((entry) => entry.path === 'id');
    expect(idField?.kind).toBe('idRef');
    expect(idField?.targetKind).toBe('screen');
  });

  it('shows the raw id, never its own name, with the default resolver wired', () => {
    const rows = all('screen');
    const [record] = rows;
    const schema = buildSchema(rows);
    const markup = renderToStaticMarkup(createElement(CompactRecordView, {
      record, schema, resolveIdRefDisplay: defaultIdRefDisplay,
    }));
    // The Id row reads the raw id...
    expect(markup).toContain(`>${record.id}<`);
    // ...even though the SAME resolver correctly turns a genuine reference —
    // Randomizer Name — into readable text elsewhere on the same record, so
    // this is the identity exemption, not the resolver failing to run at all.
    expect(markup).toContain(String(record.randomizerName));
  });

  it('an explicit resolveIdRefDisplay result for another field is unaffected by the exemption', () => {
    const rows = all('actor');
    const [record] = rows;
    const schema = buildSchema(rows);
    const markup = renderToStaticMarkup(createElement(CompactRecordView, {
      record, schema, resolveIdRefDisplay: (id) => (id === record.id ? 'SHOULD NOT SHOW' : defaultIdRefDisplay(id)),
    }));
    expect(markup).not.toContain('SHOULD NOT SHOW');
    expect(markup).toContain(`>${record.id}<`);
  });
});
