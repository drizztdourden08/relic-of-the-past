/* @layer renderer-components @kind constants */
import { LANGUAGE_NAMES } from './language-names.constants';

const LANGUAGE_OPTIONS = [
  { value: '', label: 'Select language...' },
  ...Object.entries(LANGUAGE_NAMES).map(([code, name]) => ({
    value: code,
    label: `${name} (${code})`,
  })),
];

export { LANGUAGE_OPTIONS };
