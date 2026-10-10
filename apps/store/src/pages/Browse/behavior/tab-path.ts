/* @layer store-site @kind logic */
import { KIND_SECTIONS, STORE_KINDS } from '../../../kinds';

const tabPath = (tabId: string): string => {
  const kind = STORE_KINDS.find((entry) => entry === tabId);
  return kind ? `/${KIND_SECTIONS[kind]}` : '/browse';
};

export { tabPath };
