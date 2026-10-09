/* @layer sanctuary-site @kind types */
import type { IconifyIcon } from '@iconify/react/offline';
import type { FileType } from '@rotp/hub-contracts';
import type { ListSurface } from '../../data/site-data-context.type';

type SearchCategory = {
  key: string;
  label: string;
  icon: IconifyIcon;
  surface: ListSurface;
  scope: string;
  path: string;
};

type CategoryRights = { types: readonly FileType[]; reports: boolean };

export type { SearchCategory, CategoryRights };
