/* @layer renderer-widgets @kind logic */
import { IN_PLAY_REASON } from '../../../CheatsWidget.constants';

const magicLevelTitle = (settable: boolean, inPlay: boolean): string | undefined => {
  if (!settable) return 'Magic level: fixed on this file';
  return inPlay ? undefined : `Magic level: ${IN_PLAY_REASON}`;
};

export { magicLevelTitle };
