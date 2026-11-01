/* @layer renderer-app @kind logic */
import { detectHost } from '@drizztdourden08/brock-core';
import type { RendererModule, Section, TabDef } from '@drizztdourden08/brock-react';
import { REFRESH_SEARCH_SECTION, WINDOW_SEARCH_SECTION } from './display-search-sections.constants';
import { DISPLAY_MODULE_ID } from './with-display-search-rows.constants';

const displaySearchSections = (): Section[] => (detectHost() === 'capacitor' ? [REFRESH_SEARCH_SECTION] : [WINDOW_SEARCH_SECTION, REFRESH_SEARCH_SECTION]);

const withSearchRows = (tab: TabDef<object>): TabDef<object> => ({ ...tab, sections: displaySearchSections });

const withDisplaySearchRows = (modules: readonly RendererModule[]): RendererModule[] =>
  modules.map((module) => (module.id === DISPLAY_MODULE_ID && module.settingsTabs ? { ...module, settingsTabs: module.settingsTabs.map(withSearchRows) } : module));

export { withDisplaySearchRows };
