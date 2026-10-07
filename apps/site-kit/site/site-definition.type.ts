/* @layer site-kit @kind types */
/**
 * One site on the kit: its brand, its sign-in words, the sections its nav reaches, its
 * search, the data its member pages share and the rights editor each site adds to the
 * admin page. The kit's frame, nav, pages and guard read only this, so a second site is a
 * second definition.
 */
import type { ComponentType, ReactNode } from 'react';
import type { IconifyIcon } from '@iconify/react/offline';
import type { RightsModel, SiteId } from '@shared/hub';
import type { ViewKeys } from '../views/create-view-keys';

type SiteSection = {
  id: string;
  label: string;
  /** The path the section opens; the active section is the one whose path the location starts with. */
  path: string;
  icon: IconifyIcon;
  adminOnly?: boolean;
  /** Shown only to a caller holding this permission on the site. */
  permission?: string;
};

type SiteNavGroup = { id: string; label: string; sections: string[] };

type SiteBrand = {
  wordmark: string;
  logo: string;
  /** The home link's accessible name. */
  homeLabel: string;
};

type SiteSearch = {
  placeholder: string;
  /** What the content pane shows while the search is in use. */
  Results: ComponentType<{ query: string; onDone: () => void }>;
};

type RightsEditorProps = {
  /** The permissions the group holds on this editor's site. */
  value: readonly string[];
  onChange: (next: string[]) => void;
};

/** One site's section of the group editor: its model and the form that edits it. */
type RightsEditorSlot = {
  model: RightsModel;
  Editor: ComponentType<RightsEditorProps>;
};

type SiteDefinition = {
  id: SiteId;
  /** The site's name in sentences, such as "Sanctuary is unreachable". */
  name: string;
  brand: SiteBrand;
  signIn: { lead: string };
  sections: Record<string, SiteSection>;
  /** The section pinned as the nav's home; the root path counts as it. */
  home: string;
  navGroups: SiteNavGroup[];
  search: SiteSearch;
  /** Wraps every member page, for the lists and uploads they share. */
  MemberData: ComponentType<{ children: ReactNode }>;
  /** One editor per site whose rights this admin page sets. */
  rightsEditors: RightsEditorSlot[];
  viewKeys: ViewKeys;
};

export type {
  SiteDefinition,
  SiteSection,
  SiteNavGroup,
  SiteBrand,
  SiteSearch,
  RightsEditorProps,
  RightsEditorSlot,
};
