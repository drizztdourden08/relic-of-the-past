/* @layer site-kit @kind types */
import type { ComponentType, ReactNode } from 'react';
import type { IconifyIcon } from '@iconify/react/offline';
import type { SiteLink } from '@drizztdourden08/tessera/composites';
import type { RightsModel, SiteId } from '@rotp/hub-contracts';
import type { ViewKeys } from '../saved-views/create-view-keys';

type SiteSection = {
  id: string;
  label: string;
  path: string;
  icon: IconifyIcon;
  adminOnly?: boolean;
  permission?: string;
};

type SiteNavGroup = { id: string; label: string; sections: string[] };

type SiteBrand = {
  wordmark: string;
  homeLabel: string;
};

type SiteFooter = {
  note: string;
  links: readonly SiteLink[];
};

type SiteSearch = {
  placeholder: string;
  Results: ComponentType<{ query: string; onDone: () => void }>;
};

type RightsEditorProps = {
  value: readonly string[];
  onChange: (next: string[]) => void;
};

type RightsEditorSlot = {
  model: RightsModel;
  Editor: ComponentType<RightsEditorProps>;
};

type SiteDefinition = {
  id: SiteId;
  name: string;
  brand: SiteBrand;
  footer: SiteFooter;
  signIn: { lead: string };
  sections: Record<string, SiteSection>;
  home: string;
  navGroups: SiteNavGroup[];
  search: SiteSearch;
  MemberData: ComponentType<{ children: ReactNode }>;
  rightsEditors: RightsEditorSlot[];
  viewKeys: ViewKeys;
};

export type {
  SiteDefinition,
  SiteSection,
  SiteNavGroup,
  SiteBrand,
  SiteFooter,
  SiteSearch,
  RightsEditorProps,
  RightsEditorSlot,
};
