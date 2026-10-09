/* @layer renderer-other @kind constants */
import type { UpdateState } from './use-auto-update.type';

const INITIAL: UpdateState = {
  status: 'idle',
  info: null,
  percent: 0,
  error: null,
  versions: [],
  prefs: { allowPrerelease: false },
  currentVersion: '',
};

export { INITIAL };
