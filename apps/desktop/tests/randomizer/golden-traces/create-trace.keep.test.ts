/* @layer tests @kind test */
import { describe, it, vi } from 'vitest';
import { buildOptionsSnapshot } from '@drizztdourden08/brock-randomizer/world';
import { registerRandomizerGame } from '@drizztdourden08/brock-randomizer/renderer';
import { PLACEMENT_SCHEMA } from '@rotp/randomizer';
import { rotpRandomizer } from '@app/randomizer/rotp-randomizer';
import { rotpCatalog } from '@app/randomizer/options/rotp-catalog';
import { randomizerChoiceOverrides } from '@app/hooks/randomizer/randomizer-choices';
import { EMPTY_RANDOMIZER_FORM } from '@app/views/DataManager/sub-components/profile-manager/build-randomizer-config';
import { applyProfilePreset } from '@app/views/DataManager/sub-components/profile-manager/profile-presets';
import type { RandomizerFormState } from '@app/views/DataManager/sub-components/profile-manager/build-randomizer-config/build-randomizer-config.type';
import type { CreateProfileOptions } from '@app/profiles/types';
import { configPath, createThroughModule } from './create-fake-profiles';
import { checkTrace } from './golden-trace';
import { traceFiles } from './trace-files';

vi.mock('@app/log-bus', async () => ({ log: (await import('./trace-log')).traceLog }));
vi.mock('@drizztdourden08/brock-react', async (importOriginal) => {
  const { traceFiles: files } = await import('./trace-files');
  return { ...(await importOriginal<object>()), getPlatform: () => ({ files }) };
});

interface ProfileWizardValues {
  name: string;
  rom: string;
  preset: Parameters<typeof applyProfilePreset>[0];
  language: string;
  msuPack: string;
  randomizer: RandomizerFormState;
}

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

const optionsOf = (values: ProfileWizardValues) =>
  buildOptionsSnapshot(rotpCatalog, randomizerChoiceOverrides(values.randomizer));

const createOptionsOf = (values: ProfileWizardValues, experimental: boolean): CreateProfileOptions => {
  const { name, rom, preset, language, msuPack, randomizer } = values;
  const overrides = applyProfilePreset(preset);
  return {
    name: name.trim(),
    romFile: rom,
    language: language || undefined,
    msuPack: msuPack || undefined,
    randomizer: randomizer.enabled
      ? rotpRandomizer.profile.toConfig({ enabled: true, seed: randomizer.seed, mode: randomizer.mode }, optionsOf(values))
      : undefined,
    initialConfig: experimental ? { ...overrides, developerToolsEnabled: true, experimentalFeaturesEnabled: true } : overrides,
  };
};

const placementTextOf = (text: string | null): string | null => {
  if (text === null) return null;
  const parsed = JSON.parse(text) as Record<string, unknown>;
  const placement = Object.fromEntries(Object.entries(parsed).filter(([key]) => key !== 'stamp'));
  return JSON.stringify({ schema: PLACEMENT_SCHEMA, ...placement }, null, 2);
};

const runCreateTrace = async () => {
  registerRandomizerGame({ ...rotpRandomizer });
  const outcomes = [];
  for (const [index, { name, values, experimental }] of CASES.entries()) {
    const profile = await createThroughModule(createOptionsOf(values, experimental));
    outcomes.push({
      name,
      outcome: { success: true, id: `trace-profile-${index + 1}` },
      configJson: await traceFiles.readText(configPath(profile.id)),
      randomizerJson: placementTextOf(await traceFiles.readText(`profiles/${profile.id}/randomizer.json`)),
    });
  }
  return outcomes;
};

describe('golden create trace', { tags: ['standard'] }, () => {
  it('records the bytes of randomizer.json and config.json for fixed wizard values', async () => {
    checkTrace('create', await runCreateTrace());
  });
});
