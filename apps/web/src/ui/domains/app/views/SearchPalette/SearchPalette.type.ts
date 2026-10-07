/* @layer renderer-components @kind types */
import type { GameSettings } from '@shared/types/settings';
import type { WindowControlsPort } from '@shared/platform';
import type { TitleBarProps } from '../TitleBar/TitleBar.type';
import type { ProfileHubTab } from '../ProfileHub/ProfileHub.type';
import type { PageId } from '@app/App/types';

type SearchKind = 'screen' | 'action' | 'setting' | 'tab';

/** Declarative destination, resolved by run-target.ts against the app's own nav setters. */
interface SearchTarget {
  page: PageId;
  tab?: ProfileHubTab;
  /** A [data-setting-key] or [data-section] to scroll to and flash once the tab is showing. */
  anchor?: string;
}

interface SearchEntry {
  /** Stable + unique across all sources: 'setting:hudMode', 'menu:data-roms', 'tab:graphics'. */
  id: string;
  kind: SearchKind;
  label: string;
  icon?: string;
  /** Path shown under the label, e.g. ['Home', 'Graphics', 'Appearance']. */
  breadcrumb: string[];
  description?: string;
  keywords?: string;
  /** Set when the entry's value is a top-level boolean GameSettings key. Enables the
   *  row's inline Toggle. Dotted paths (haptics.*) are intentionally excluded. */
  settingKey?: keyof GameSettings;
  /** The setting's current boolean value, read at catalog-build time. Only meaningful
   *  alongside settingKey. Lets the row render the switch without needing live settings. */
  toggleValue?: boolean;
  disabled?: boolean;
  /** Mirrors a MenuItem's checked flag (widgets), rendered as a small indicator and not editable. */
  checked?: boolean;
  /** Declarative nav (settings + tab entries). */
  target?: SearchTarget;
  /** Imperative command (menu-derived screen/action entries). Runs the exact same callback
   *  the title-bar menu itself would call. */
  run?: () => void;
}

/** Everything a catalog source needs to build its entries for the current app state. */
interface SearchContext {
  /** The same prop bag TitleBar/MobileChrome already consume, reused so menu-derived
   *  entries call the real navigation callbacks, not a re-implementation of them. */
  navProps: TitleBarProps;
  win: WindowControlsPort;
  /** null when no profile is active. Settings entries and the settings bridge are empty. */
  settings: GameSettings | null;
  isMobile: boolean;
  /** Closes the palette. Wired as `closeMenu` when reusing buildTitleBarMenuItems, so
   *  selecting a menu-derived result dismisses the palette exactly like the real menu does. */
  closePalette: () => void;
}

/** Strategy: one per source, all merged by build-catalog.ts. */
interface SearchSource {
  id: string;
  build: (ctx: SearchContext) => SearchEntry[];
}

export type {
  SearchKind,
  SearchTarget,
  SearchEntry,
  SearchContext,
  SearchSource,
};
