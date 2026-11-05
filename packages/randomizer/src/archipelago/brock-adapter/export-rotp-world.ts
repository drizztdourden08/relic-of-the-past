/* @layer shared-game @kind logic */
import { exportApWorld } from '@drizztdourden08/brock-randomizer/archipelago';
import { ROTP_AP_EXPORT_SOURCE } from './rotp-ap-export-source.constants';
import type { WorldExport } from '@drizztdourden08/brock-randomizer/archipelago';

const exportRotpWorld = (): WorldExport => exportApWorld(ROTP_AP_EXPORT_SOURCE);

export { exportRotpWorld };
