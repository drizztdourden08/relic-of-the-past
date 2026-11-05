/* @layer shared-game @kind constants */
import { createApIdLookup } from '@drizztdourden08/brock-randomizer/archipelago';
import { AP_ITEM_IDS, AP_LOCATION_IDS } from '../ap-ids.constants';

const ROTP_AP_IDS = createApIdLookup(AP_LOCATION_IDS, AP_ITEM_IDS);

export { ROTP_AP_IDS };
