/* @layer electron-main @kind logic */
import { isSafeName } from '@rotp/msu';

const safeName = (name: string): string => {
  if (!isSafeName(name)) throw new Error('Invalid filename');
  return name;
};

export { safeName };
