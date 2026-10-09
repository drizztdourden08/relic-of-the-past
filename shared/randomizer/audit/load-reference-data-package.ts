/* @layer shared-game @kind logic */
import type { ReferenceDataPackage } from './reference-source.type';

const loadReferenceDataPackage = (json: unknown): ReferenceDataPackage => {
  const { location_name_to_id: locations, item_name_to_id: items } =
    json as { location_name_to_id?: Record<string, number>; item_name_to_id?: Record<string, number> };
  if (typeof locations !== 'object' || locations === null || typeof items !== 'object' || items === null) {
    throw new Error('reference-source: datapackage JSON missing location_name_to_id / item_name_to_id');
  }
  return { locationNameToId: locations, itemNameToId: items };
};

export { loadReferenceDataPackage };
