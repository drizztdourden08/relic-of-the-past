/* @layer renderer-components @kind logic */
import { connectionStep } from '@drizztdourden08/brock-randomizer/renderer';
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';
import type { ConnectionFacts } from './connection-form-of.type';

const textOf = (value: unknown): string => (typeof value === 'string' ? value : '');

const connectionFormOf = (values: ProfileWizardValues): ConnectionFacts => {
  const slice = values[connectionStep.slice];
  const record: Record<string, unknown> = typeof slice === 'object' && slice !== null ? { ...slice } : {};
  return { host: textOf(record.host), port: textOf(record.port), slotName: textOf(record.slotName), hasPassword: textOf(record.password) !== '' };
};

export { connectionFormOf };
