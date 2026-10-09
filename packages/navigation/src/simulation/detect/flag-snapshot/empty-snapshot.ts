/* @layer shared-game @kind logic */
import type { FlagSnapshot } from '../../types';
import { DUNG_INFO_LEN, OW_EVENT_LEN, PROGRESS_LEN } from './flag-snapshot.constants';

const emptySnapshot = (): FlagSnapshot => ({
  dungInfo: new Uint16Array(DUNG_INFO_LEN),
  owEventInfo: new Uint8Array(OW_EVENT_LEN),
  progress: new Uint8Array(PROGRESS_LEN),
});

export { emptySnapshot };
