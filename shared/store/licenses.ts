/* @layer shared-store @kind constants */
/**
 * The licences an author can publish under, read by the store's Publish form and by the app.
 * `allowsCopies` says whether a player may make a copy of an installed item and change it;
 * every licence but "All rights reserved" does.
 */

type License = {
  id: string;
  label: string;
  description: string;
  /** May a player make and change a copy? */
  allowsCopies: boolean;
};

const LICENSES: readonly License[] = [
  { id: 'CC-BY-4.0', label: 'CC-BY-4.0', description: 'Anyone may share and change it, crediting you.', allowsCopies: true },
  { id: 'CC-BY-SA-4.0', label: 'CC-BY-SA-4.0', description: 'The same, and changes keep this licence.', allowsCopies: true },
  { id: 'CC-BY-NC-4.0', label: 'CC-BY-NC-4.0', description: 'Credit you, and never sold.', allowsCopies: true },
  { id: 'CC0-1.0', label: 'CC0-1.0', description: 'No rights kept.', allowsCopies: true },
  { id: 'All rights reserved', label: 'All rights reserved', description: 'Players may install it, nothing more.', allowsCopies: false },
];

const licenseById = (id: string): License | null => LICENSES.find((license) => license.id === id) ?? null;

/** An id the table does not know allows nothing. */
const allowsCopies = (id: string): boolean => licenseById(id)?.allowsCopies ?? false;

/** Why a copy is refused, in words for the player; null when the licence allows one. */
const copyRefusal = (id: string): string | null => {
  if (allowsCopies(id)) return null;
  return licenseById(id)
    ? `Its licence, ${id}, does not allow copies.`
    : 'Its licence is not one the app knows, so it does not allow copies.';
};

export { LICENSES, licenseById, allowsCopies, copyRefusal };
export type { License };
