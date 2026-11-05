/* @layer tests @kind test */
import { describe, it, vi } from 'vitest';
import { PLACEMENT_SCHEMA } from '@rotp/randomizer';
import { computeSaveFileChecks } from '@app/views/ProfileHub/sub-components/home-tab/compute-save-file-checks';
import { checkTrace } from './golden-traces/golden-trace';
import { buildTraceSram } from './tracker-trace/build-trace-sram';
import { traceSram, traceStored } from './tracker-trace/save-file-stores';
import { runTrackerTrace } from './tracker-trace/run-tracker-trace';
import { SEED_REQUESTS, goldenPlacement } from './tracker-trace/tracker-placements';
import { TRACKER_STEPS } from './tracker-trace/tracker-script';

vi.mock('@app/storage/saves-store', async (importOriginal) => {
  const { traceSram: sram } = await import('./tracker-trace/save-file-stores');
  return { ...(await importOriginal<Record<string, unknown>>()), readSram: async (id: string) => sram.get(id) ?? null };
});
vi.mock('@app/storage/profile-data-store', async (importOriginal) => {
  const { traceStored: stored } = await import('./tracker-trace/save-file-stores');
  return { ...(await importOriginal<Record<string, unknown>>()), loadRandomizerState: async (id: string) => stored.get(id) ?? null };
});

const SEED_PROFILE = 'trace-seed-profile';
const NORMAL_PROFILE = 'trace-normal-profile';

const runSaveFileTrace = async () => {
  const placement = goldenPlacement('defaults');
  traceStored.set(SEED_PROFILE, { ...placement, schema: PLACEMENT_SCHEMA });
  traceSram.set(SEED_PROFILE, buildTraceSram([
    { slot: 0, stride: 3, roomWord: 0x0030, owByte: 0x40 },
    { slot: 2, stride: 1, roomWord: 0x0ff0, owByte: 0xff },
  ]));
  traceSram.set(NORMAL_PROFILE, buildTraceSram([
    { slot: 0, stride: 2, roomWord: 0x0070, owByte: 0x60 },
    { slot: 1, stride: 5, roomWord: 0x0010, owByte: 0x01 },
  ]));
  return {
    seed: await computeSaveFileChecks(SEED_PROFILE, 'seed'),
    normal: await computeSaveFileChecks(NORMAL_PROFILE, 'normal'),
    online: await computeSaveFileChecks(NORMAL_PROFILE, 'online'),
    unknownProfile: await computeSaveFileChecks('trace-missing-profile', 'normal'),
  };
};

describe('golden tracker trace', { tags: ['standard'] }, () => {
  it('records the status map and reachable screens for four golden seeds and the normal placement', () => {
    const trace = [
      ...SEED_REQUESTS.map(({ name }) => ({ placement: name, steps: runTrackerTrace(goldenPlacement(name), TRACKER_STEPS) })),
      { placement: 'normal', steps: runTrackerTrace(null, TRACKER_STEPS) },
    ];
    checkTrace('tracker', trace);
  });

  it('records the per-slot check counts of a seed profile and a normal profile', async () => {
    checkTrace('save-file-checks', await runSaveFileTrace());
  });
});
