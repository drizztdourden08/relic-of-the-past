/* @layer renderer-other @kind constants */
import type { UpdateState } from './useAutoUpdate.type';

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
