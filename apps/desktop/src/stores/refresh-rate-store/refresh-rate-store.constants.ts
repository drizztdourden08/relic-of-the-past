/* @layer renderer-stores @kind constants */
import type { RefreshRateInfo } from '@shared/types/display';

const EMPTY_REFRESH_RATE: RefreshRateInfo = { reportedHz: null, measuredHz: null, modes: [] };

export { EMPTY_REFRESH_RATE };
