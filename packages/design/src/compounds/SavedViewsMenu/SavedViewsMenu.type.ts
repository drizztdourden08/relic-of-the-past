/* @layer site-kit @kind types */
import type { SavedViewsState } from '../../hooks/useSavedViews/saved-views.type';

type SavedViewsMenuProps = {
  state: SavedViewsState;
};

type Prompt = 'save' | 'rename' | 'delete' | null;

export type { SavedViewsMenuProps, Prompt };
