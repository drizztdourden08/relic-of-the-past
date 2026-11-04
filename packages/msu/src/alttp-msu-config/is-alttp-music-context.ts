/* @layer shared-storage @kind logic */
import type { AlttpMusicContext } from './alttp-music-context.type';

const isAlttpMusicContext = (value: unknown): value is AlttpMusicContext =>
  typeof value === 'object' && value !== null
  && typeof (value as AlttpMusicContext).entrance === 'number'
  && typeof (value as AlttpMusicContext).overworldArea === 'number';

export { isAlttpMusicContext };
