/* @layer shared-storage @kind logic */
import type { SaveKind } from './save-paths.type';

const saveStem = (kind: SaveKind, id: string | number): string => (kind === 'quick' ? `save${id}` : String(id));

export { saveStem };
