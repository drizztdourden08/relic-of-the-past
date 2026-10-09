/* @layer store-api @kind constants */
import { STORE_LIMITS } from '../../../../shared/store/limits';

const OVER_CAP = `You have opened ${STORE_LIMITS.packPreviewsPerDay} pack previews today. Previews open again tomorrow.`;

export { OVER_CAP };
