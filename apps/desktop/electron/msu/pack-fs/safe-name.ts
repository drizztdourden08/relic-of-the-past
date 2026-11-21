/* @layer electron-main @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { mainText } from '../../lib/main-text';
import { isSafeName } from '@rotp/msu/main';

const safeName = (name: string): string => {
  if (!isSafeName(name)) throw new Error(mainText(msg('main:msu.invalidName')));
  return name;
};

export { safeName };
