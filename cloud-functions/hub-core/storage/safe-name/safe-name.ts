/* @layer hub-core @kind logic */
import { MAX_CHARS } from './safe-name.constants';

const safeName = (name: string): string => {
  const cleaned = name
    .replace(/[\\/:*?"<>|\u0000-\u001f\u007f]/g, '')
    .replace(/[\s.]+$/g, '')
    .trim()
    .slice(0, MAX_CHARS);
  return cleaned || 'download';
};

export { safeName };
