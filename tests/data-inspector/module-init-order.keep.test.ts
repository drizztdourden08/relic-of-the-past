/* @layer tests @kind test */
/**
 * These modules form a cycle: record-writers -> id-ref-options ->
 * collection-sources -> record-writers. A cycle only faults when something is
 * READ during module evaluation, which collection-sources used to do (eager
 * build at module scope). Entering through collection-sources worked;
 * entering through record-writers hit an undefined RECORD_WRITERS.
 *
 * So the assertion is about ENTRY POINT: each module must be safe to import
 * first, in a fresh graph.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

const DATA_INSPECTOR = '../../apps/web/src/ui/domains/app/views/DataInspector/behavior';

describe('module init order from every entry point into the cycle', () => {
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

  // The write path is what the cycle exists to serve, so pin that it is wired
  // after a record-writers-first load, not only that the import returned.
  it('wires a collection its write path when record-writers loaded first', async () => {
    await import(`${DATA_INSPECTOR}/record-writers`);
    const { COLLECTION_SOURCES } = await import(`${DATA_INSPECTOR}/collection-sources`);

    expect(COLLECTION_SOURCES.tag.onSave).toBeTypeOf('function');
    expect(COLLECTION_SOURCES.screen.onSave).toBeTypeOf('function');
  });
});
