/* @layer tests @kind test */
/**
 * These four modules form a cycle: record-writers imports updateIdRefOption
 * from id-ref-options, which reads COLLECTION_SOURCES from collection-sources,
 * which reads RECORD_WRITERS back from record-writers.
 *
 * A cycle is only a real fault when something is READ during module
 * evaluation, and that is exactly what collection-sources used to do: it built
 * every source eagerly at module scope. Entering the graph through
 * collection-sources happened to work, because record-writers had finished
 * evaluating by then. Entering through record-writers did not, because the
 * eager build ran mid-way through record-writers' own evaluation, when
 * RECORD_WRITERS was still undefined.
 *
 * So the assertion is about ENTRY POINT, not about any one module: each of
 * these has to be safe to import first, in a fresh graph, with nothing else
 * loaded to paper over the order.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

const DATA_INSPECTOR = '../../apps/web/src/ui/domains/app/views/DataInspector/behavior';

describe('module init order — every entry point into the cycle', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('survives entering through record-writers, the one that used to throw', async () => {
    const { RECORD_WRITERS } = await import(`${DATA_INSPECTOR}/record-writers`);

    // Populated, not merely defined: reading a writer is what the crash used
    // to poison, so an empty-but-present map would still be a regression.
    expect(RECORD_WRITERS.tag).toBeTypeOf('function');
    expect(RECORD_WRITERS.screen).toBeTypeOf('function');
  });

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

  /*
   * The write path is the half the cycle exists to serve, so it is worth
   * pinning that it is really wired after a record-writers-first load, rather
   * than only that the import returned.
   */
  it('wires a collection its write path when record-writers loaded first', async () => {
    await import(`${DATA_INSPECTOR}/record-writers`);
    const { COLLECTION_SOURCES } = await import(`${DATA_INSPECTOR}/collection-sources`);

    expect(COLLECTION_SOURCES.tag.onSave).toBeTypeOf('function');
    expect(COLLECTION_SOURCES.screen.onSave).toBeTypeOf('function');
  });
});
