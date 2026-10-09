/* @layer store-api @kind logic */
import type { ReviewTarget } from '../../../../../shared/store/api-types';
import { VERSION_TARGET } from './parse-target.constants';

const parseTarget = (raw: string): ReviewTarget => {
  const match = VERSION_TARGET.exec(raw);
  return match ? { kind: 'version', n: Number(match[1]) } : { kind: 'listing', editId: raw };
};

export { parseTarget };
