/* @layer hub-core @kind logic */
import { MAX_CHARS } from './safe-name.constants';

const safeName = (name: string): string => {
  const cleaned = name
    .replace(/[\\/:*?"<>|]|(?![\u0080-\u009f])\p{Cc}/gu, '')
    .replace(/[\s.]+$/g, '')
    .trim()
    .slice(0, MAX_CHARS);
  return cleaned || 'download';
};

export { safeName };
