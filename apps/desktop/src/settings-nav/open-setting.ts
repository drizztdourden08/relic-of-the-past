/* @layer renderer-app @kind logic */
import { nav, openSearchTarget } from '@drizztdourden08/brock-react';
import { searchIndex } from '../../.brock/search';
import { HOME_HUB } from '@app/views/GameSession/GameSession.constants';

const openSetting = (key: string): void => {
  const entry = searchIndex.find((candidate) => candidate.target?.anchor === key);
  if (entry?.target) openSearchTarget(entry.target, entry.label);
  else nav.home(HOME_HUB);
};

export { openSetting };
