/* @layer renderer-components @kind hook */
/** Builds the SearchContext for the current app state, memoizes the derived catalog, and
 *  ranks it against the live query. */
import { useMemo } from 'react';
import { usePlatform } from '@app/platform';
import { useSearchStore } from '@app/stores/search-store';
import type { TitleBarProps } from '../../TitleBar/TitleBar.type';
import type { SearchContext } from '../SearchPalette.type';
import { buildCatalog } from './catalog/build-catalog';
import { rankEntries } from './match';

const useSearchResults = (navProps: TitleBarProps) => {
  const { window: win, info } = usePlatform();
  const settings = useSearchStore((s) => s.settings);
  const query = useSearchStore((s) => s.query);
  const closePalette = useSearchStore((s) => s.closePalette);

  const ctx: SearchContext = useMemo(() => ({
    navProps,
    win,
    settings,
    isMobile: info.formFactor === 'mobile',
    closePalette,
  }), [navProps, win, settings, info.formFactor, closePalette]);

  const catalog = useMemo(() => buildCatalog(ctx), [ctx]);
  const results = useMemo(() => rankEntries(catalog, query), [catalog, query]);

  return { catalog, results, query };
};

export { useSearchResults };
