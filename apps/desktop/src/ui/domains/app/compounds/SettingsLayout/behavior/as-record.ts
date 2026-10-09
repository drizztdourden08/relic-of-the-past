/* @layer renderer-components @kind logic */
import type { SettingsRecord } from '../SettingsLayout.type';

const asRecord = (value: unknown): SettingsRecord | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? value as SettingsRecord : null;

export { asRecord };
