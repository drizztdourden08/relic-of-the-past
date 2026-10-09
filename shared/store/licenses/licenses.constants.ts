/* @layer shared-store @kind constants */
import type { License } from './licenses.type';

const LICENSES: readonly License[] = [
  { id: 'CC-BY-4.0', label: 'CC-BY-4.0', description: 'Anyone may share and change it, crediting you.', allowsCopies: true },
  { id: 'CC-BY-SA-4.0', label: 'CC-BY-SA-4.0', description: 'The same, and changes keep this licence.', allowsCopies: true },
  { id: 'CC-BY-NC-4.0', label: 'CC-BY-NC-4.0', description: 'Credit you, and never sold.', allowsCopies: true },
  { id: 'CC0-1.0', label: 'CC0-1.0', description: 'No rights kept.', allowsCopies: true },
  { id: 'All rights reserved', label: 'All rights reserved', description: 'Players may install it, nothing more.', allowsCopies: false },
];

export { LICENSES };
