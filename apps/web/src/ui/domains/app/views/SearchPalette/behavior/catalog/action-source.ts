/* @layer renderer-components @kind logic */
/**
 * The one hand-maintained source: in-screen actions that exist as a real callback but
 * aren't reachable through the title-bar menu (which only navigates to a tab, not the
 * "add" affordance inside it). Most in-screen buttons (add a sprite pack, an MSU pack, a
 * language) have no callback lifted above their own DataManager sub-tab, so there is
 * nothing correct to wire here yet without a larger refactor — this stays intentionally
 * small rather than faking behavior. Add an entry only when a real callback exists.
 */
import type { SearchContext, SearchEntry, SearchSource } from '../../SearchPalette.type';

const build = (ctx: SearchContext): SearchEntry[] => [
  {
    id: 'action:import-rom',
    kind: 'action',
    label: 'Add a ROM',
    icon: '🎮',
    breadcrumb: ['Data Manager', 'ROMs'],
    keywords: 'add import rom file game',
    run: () => {
      ctx.navProps.onShowDataManager('roms');
      ctx.navProps.onImportRom();
    },
  },
];

const actionSource: SearchSource = { id: 'action', build };

export { actionSource };
