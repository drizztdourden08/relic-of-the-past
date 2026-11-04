/* @layer renderer-app @kind logic */
import type { CheckDetection } from '@rotp/randomizer';
import type { FlagProbe } from '@drizztdourden08/brock-randomizer/session';
import { OVERWORLD_REGION, PROGRESS_REGION, ROOM_REGION } from './rotp-memory.constants';

const NEVER_MET: FlagProbe = { custom: () => false };

const progressProbe = (detection: Extract<CheckDetection, { mode: 'progress' }>): FlagProbe => {
  if (detection.mask !== undefined) return { region: PROGRESS_REGION, offset: detection.bufferIndex, mask: detection.mask };
  if (detection.compare === undefined) return NEVER_MET;
  return {
    region: PROGRESS_REGION,
    offset: detection.bufferIndex,
    compare: detection.compare === 'any-of' ? 'anyOf' : detection.compare,
    value: detection.value ?? [],
  };
};

const probeOfDetection = (detection: CheckDetection): FlagProbe => {
  if (detection.mode === 'room-mask') return { region: ROOM_REGION, offset: detection.roomId, width: 2, mask: detection.mask };
  if (detection.mode === 'ow-mask') return { region: OVERWORLD_REGION, offset: detection.owScreen, mask: detection.mask };
  return progressProbe(detection);
};

export { probeOfDetection };
