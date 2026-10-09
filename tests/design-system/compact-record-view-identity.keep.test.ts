/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { all } from '@shared/game/data';
import { buildSchema } from '@drizztdourden08/tessera/data';
import { CompactRecordView } from '@drizztdourden08/tessera/composites';
import { defaultIdRefDisplay } from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/record-links';
import { describeDataset } from '../dataset-guard';

describeDataset('CompactRecordView always shows its own id in the identity field', () => {
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
    expect(markup).toContain(`>${record.id}<`);
    expect(markup).toContain(String(record.name));
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
