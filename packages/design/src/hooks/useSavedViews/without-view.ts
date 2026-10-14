/* @layer site-kit @kind logic */
import type { SavedView } from '@rotp/hub-contracts';

const withoutView = (rows: SavedView[], id: string): SavedView[] => rows.filter((row) => row.id !== id);

export { withoutView };
