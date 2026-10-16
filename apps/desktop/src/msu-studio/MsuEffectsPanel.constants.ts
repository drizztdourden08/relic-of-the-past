/* @layer renderer-components @kind constants */
import { SOUND_FILTER_HINT } from './msu.constants';

const EFFECTS_NOTE = 'The sound chip raises one-shot effects on two ports, each numbering its'
  + ' sounds from scratch, so the same id is a different sound on each. Every row leads with the'
  + ` port it belongs to. ${SOUND_FILTER_HINT} Add SFX1 or SFX2 to narrow to one port.`;

export { EFFECTS_NOTE };
