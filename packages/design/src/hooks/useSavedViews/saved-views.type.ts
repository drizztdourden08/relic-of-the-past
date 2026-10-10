/* @layer site-kit @kind types */
import type { SiteViews } from '../../saved-views/create-view-storage.type';
import type { useSavedViews } from './useSavedViews';

type UseSavedViewsParams = {
  views: SiteViews;
  surface: string;
  onApplied: () => void;
};

type SavedViewsState = ReturnType<typeof useSavedViews>;

export type { SavedViewsState, UseSavedViewsParams };
