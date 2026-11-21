/* @layer renderer-components @kind logic */
import { WEB_PROTOCOLS } from './is-web-address.constants';

const isWebAddress = (text: string): boolean => {
  try {
    return WEB_PROTOCOLS.includes(new URL(text).protocol);
  } catch {
    return false;
  }
};

export { isWebAddress };
