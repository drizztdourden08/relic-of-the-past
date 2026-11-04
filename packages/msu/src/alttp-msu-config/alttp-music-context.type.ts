/* @layer shared-storage @kind types */
interface AlttpMusicContext {
  entrance: number;
  overworldArea: number;
}

type MsuChannelName = 'music' | 'ambient' | 'sfx1' | 'sfx2';

export type { AlttpMusicContext, MsuChannelName };
