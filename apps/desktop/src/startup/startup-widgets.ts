/* @layer renderer-lib @kind logic */
import { startupFlag } from './startup-flag';

const startupWidgets = (): string[] => {
  const value = startupFlag('widgets');
  return typeof value === 'string' ? value.split(',').map((id) => id.trim()).filter(Boolean) : [];
};

export { startupWidgets };
