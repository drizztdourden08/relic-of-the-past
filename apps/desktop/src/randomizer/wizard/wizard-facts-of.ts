/* @layer renderer-app @kind logic */
import { RANDOMIZER_SLICE } from '@drizztdourden08/brock-randomizer/renderer';
import type { WizardFacts } from './wizard-facts-of.type';

const textOf = (value: unknown): string => (typeof value === 'string' ? value : '');

const wizardFactsOf = (values: Readonly<Record<string, unknown>>): WizardFacts => {
  const form = values[RANDOMIZER_SLICE];
  const record: Record<string, unknown> = typeof form === 'object' && form !== null ? { ...form } : {};
  const mode = record.mode === 'online' || record.mode === 'archipelia' ? record.mode : 'local';
  return { enabled: record.enabled === true, rom: textOf(values.rom), seed: textOf(record.seed), mode };
};

export { wizardFactsOf };
