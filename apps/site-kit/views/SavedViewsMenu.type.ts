/* @layer site-kit @kind types */
import type { SavedViewsState } from './useSavedViews.type';

type SavedViewsMenuProps = {
  state: SavedViewsState;
};

type Prompt = 'save' | 'rename' | 'delete' | null;

export type { SavedViewsMenuProps, Prompt };
