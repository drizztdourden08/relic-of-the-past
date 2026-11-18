/* @layer shared-store @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import { allowsCopies } from './allows-copies';
import { licenseById } from './license-by-id';

const copyRefusal = (id: string): Message | null => {
  if (allowsCopies(id)) return null;
  return licenseById(id) ? msg('hub-contracts:copy-refusal.known', { id }) : msg('hub-contracts:copy-refusal.unknown');
};

export { copyRefusal };
