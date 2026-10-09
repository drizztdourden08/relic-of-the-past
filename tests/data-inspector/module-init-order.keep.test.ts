/* @layer tests @kind test */
import { describe, it, expect, beforeEach, vi } from 'vitest';

const DATA_INSPECTOR = '../../apps/desktop/src/ui/domains/app/views/DataInspector/behavior';
const COLD_GRAPH_TIMEOUT_MS = 30_000;

describe('module init order from every entry point into the cycle', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('survives entering through record-writers, the one that used to throw', async () => {
    const { RECORD_WRITERS } = await import(`${DATA_INSPECTOR}/record-writers`);

    expect(RECORD_WRITERS.tag).toBeTypeOf('function');
    expect(RECORD_WRITERS.screen).toBeTypeOf('function');
  }, COLD_GRAPH_TIMEOUT_MS);

  it('survives entering through record-creators, which has the same shape', async () => {
    const { RECORD_CREATORS } = await import(`${DATA_INSPECTOR}/record-creators`);

    expect(RECORD_CREATORS.tag).toBeTypeOf('function');
  });

  it('survives entering through id-ref-options, the middle of the cycle', async () => {
    const { resolveIdRefOptionsFor } = await import(`${DATA_INSPECTOR}/id-ref-options`);

    expect(resolveIdRefOptionsFor).toBeTypeOf('function');
  });

  it('still survives entering through collection-sources, which always worked', async () => {
    const { COLLECTION_SOURCES } = await import(`${DATA_INSPECTOR}/collection-sources`);

    expect(COLLECTION_SOURCES.tag.onSave).toBeTypeOf('function');
  });

  it('wires a collection its write path when record-writers loaded first', async () => {
    await import(`${DATA_INSPECTOR}/record-writers`);
    const { COLLECTION_SOURCES } = await import(`${DATA_INSPECTOR}/collection-sources`);

    expect(COLLECTION_SOURCES.tag.onSave).toBeTypeOf('function');
    expect(COLLECTION_SOURCES.screen.onSave).toBeTypeOf('function');
  });
});
