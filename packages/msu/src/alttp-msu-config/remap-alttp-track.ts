/* @layer shared-storage @kind logic */
import { remapDeluxeTrack } from '@rotp/game-data';
import { isAlttpMusicContext } from './is-alttp-music-context';

const remapAlttpTrack = (track: number, context: unknown): number =>
  (isAlttpMusicContext(context) ? remapDeluxeTrack(track, context) : track);

export { remapAlttpTrack };
