/* @layer renderer-appshell @kind logic */
import { HOME_HUB } from '@app/views/GameSession/GameSession.constants';
import { searchIndex } from '../../.brock/search';

const settingTarget = (key: string): string => {
  const target = searchIndex.find((candidate) => candidate.target?.anchor === key)?.target;
  return target ? `${target.route}#${key}` : HOME_HUB;
};

export { settingTarget };
