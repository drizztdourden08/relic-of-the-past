/* @layer shared-store @kind logic */
import { licenseById } from './license-by-id';

const allowsCopies = (id: string): boolean => licenseById(id)?.allowsCopies ?? false;

export { allowsCopies };
