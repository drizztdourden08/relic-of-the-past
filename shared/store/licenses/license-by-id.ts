/* @layer shared-store @kind logic */
import { LICENSES } from './licenses.constants';
import type { License } from './licenses.type';

const licenseById = (id: string): License | null => LICENSES.find((license) => license.id === id) ?? null;

export { licenseById };
