/* @layer shared-store @kind logic */
import { allowsCopies } from './allows-copies';
import { licenseById } from './license-by-id';

const copyRefusal = (id: string): string | null => {
  if (allowsCopies(id)) return null;
  return licenseById(id)
    ? `Its licence, ${id}, does not allow copies.`
    : 'Its licence is not one the app knows, so it does not allow copies.';
};

export { copyRefusal };
