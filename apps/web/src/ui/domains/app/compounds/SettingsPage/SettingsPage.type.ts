/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { HeaderTabItem } from '../../../../design-system/composites/HeaderTabs';

/** A section the header links to; `id` matches a `data-section` in the body. */
interface SettingsPageAnchor {
  id: string;
  label: string;
}

/** Header tabs for a page whose subsections are views, not scroll targets. */
interface SettingsPageTabs {
  items: HeaderTabItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

interface SettingsPageProps {
  icon: ReactNode;
  title: string;
  /** Fills the header behind the title; the host picks the scene. */
  backdrop?: ReactNode;
  anchors?: SettingsPageAnchor[];
  /** Drawn in the header in place of the anchors, and driven by the host. */
  tabs?: SettingsPageTabs;
  /** False when the content scrolls its own columns (the Controls tab). */
  scroll?: boolean;
  /** Drawn at the right end of the header line, vertically centred. */
  actions?: ReactNode;
  children: ReactNode;
}

export type { SettingsPageAnchor, SettingsPageProps, SettingsPageTabs };
