/* @layer shared-game @kind logic */
import type { ReferenceDataPackage } from './reference-source.type';

const isNameTable = (value: unknown): value is Record<string, number> => typeof value === 'object' && value !== null;

const loadReferenceDataPackage = (json: unknown): ReferenceDataPackage => {
  const { location_name_to_id: locations, item_name_to_id: items } =
    json as { location_name_to_id?: unknown; item_name_to_id?: unknown };
  if (!isNameTable(locations) || !isNameTable(items)) {
    throw new Error('reference-source: datapackage JSON missing location_name_to_id / item_name_to_id');
  }
  return { locationNameToId: locations, itemNameToId: items };
};

export { loadReferenceDataPackage };
