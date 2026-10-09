/* @layer renderer-components @kind logic */
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
