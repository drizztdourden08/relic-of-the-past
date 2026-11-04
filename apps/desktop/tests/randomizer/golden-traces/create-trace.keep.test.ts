/* @layer tests @kind test */
import { describe, it, vi } from 'vitest';
import { EMPTY_RANDOMIZER_FORM } from '@app/views/DataManager/sub-components/profile-manager/build-randomizer-config';
import { createProfileFromValues } from '@app/views/DataManager/sub-components/profile-manager/ProfileCreateWizard/behavior/create-profile-from-values';
import { runCreateProfileFlow } from '@app/views/GameSession/behavior/create-profile-flow';
import type { ProfileWizardValues } from '@app/views/DataManager/sub-components/profile-manager/ProfileCreateWizard/ProfileCreateWizard.type';
import { configPath, traceFiles } from './create-fake-profiles';
import { checkTrace } from './golden-trace';

vi.mock('@app/log-bus', async () => ({ log: (await import('./trace-log')).traceLog }));
vi.mock('@app/storage/platform-files', async () => {
  const { traceFiles: files } = await import('./create-fake-profiles');
  return { platformFiles: () => files };
});
vi.mock('@app/storage/profile-store', async () => {
  const { fakeCreateProfile, fakeUpdateConfig } = await import('./create-fake-profiles');
  return { createProfile: fakeCreateProfile, updateConfig: fakeUpdateConfig };
});

const LOCAL_VALUES: ProfileWizardValues = {
  name: '  Trace Local  ',
  rom: 'alttp.sfc',
  preset: 'enhanced',
  language: 'us',
  msuPack: '',
  randomizer: {
    ...EMPTY_RANDOMIZER_FORM,
    enabled: true,
    mode: 'local',
    seed: ' trace-seed-1 ',
    capacity: { ...EMPTY_RANDOMIZER_FORM.capacity, wallet: { mode: 'custom', start: 500, max: 999, count: 3, shape: { curve: 'equal' } } },
  },
};

const ONLINE_VALUES: ProfileWizardValues = {
  name: 'Trace Online',
  rom: 'alttp.sfc',
  preset: 'vanilla',
  language: '',
  msuPack: '',
  randomizer: {
    ...EMPTY_RANDOMIZER_FORM,
    enabled: true,
    mode: 'online',
    seed: 'trace-seed-2',
    server: { host: 'ap.example.test', port: '38281', password: 'trace-room-pass', slotName: 'Link' },
  },
};

const NO_RANDOMIZER_VALUES: ProfileWizardValues = {
  name: 'Trace Plain', rom: 'alttp.sfc', preset: 'vanilla', language: '', msuPack: '', randomizer: EMPTY_RANDOMIZER_FORM,
};

const CASES = [
  { name: 'local randomizer, enhanced preset', values: LOCAL_VALUES, experimental: false },
  { name: 'online randomizer, experimental on', values: ONLINE_VALUES, experimental: true },
  { name: 'no randomizer', values: NO_RANDOMIZER_VALUES, experimental: false },
];

const textOf = async (path: string): Promise<string | null> => traceFiles.readText(path);

const runCreateTrace = async () => {
  const outcomes = [];
  for (const { name, values, experimental } of CASES) {
    const outcome = await createProfileFromValues(values, {
      experimental, onCreateProfile: runCreateProfileFlow, onProgress: (): void => undefined,
    });
    const id = outcome.success ? outcome.id : '';
    outcomes.push({
      name,
      outcome: outcome.success ? { success: true, id } : outcome,
      configJson: await textOf(configPath(id)),
      randomizerJson: await textOf(`profiles/${id}/randomizer.json`),
    });
  }
  return outcomes;
};

describe('golden create trace', { tags: ['standard'] }, () => {
  it('records the bytes of randomizer.json and config.json for fixed wizard values', async () => {
    checkTrace('create', await runCreateTrace());
  });
});
