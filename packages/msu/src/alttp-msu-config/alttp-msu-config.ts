/* @layer shared-storage @kind logic */
import { defineMsuGame } from '@drizztdourden08/brock-msu';
import { trackRepeats } from '@rotp/game-data';
import {
  ALTTP_DELUXE_VARIANT, ALTTP_GAME_ID, ALTTP_MUSIC_LABELS, ALTTP_PACK_ROOT, ALTTP_SOUND_CHANNELS,
  ALTTP_SOUND_ID_COUNT, ALTTP_TITLE_SCENES,
} from './alttp-msu-config.constants';
import { alttpResumePath } from './alttp-resume-path';
import { classifyAlttpMusic } from './classify-alttp-music';
import { remapAlttpTrack } from './remap-alttp-track';

const alttpMsuConfig = defineMsuGame({
  id: ALTTP_GAME_ID,
  packRoot: ALTTP_PACK_ROOT,
  soundChannels: ALTTP_SOUND_CHANNELS,
  soundIdCount: ALTTP_SOUND_ID_COUNT,
  trackLoops: trackRepeats,
  classifyMusic: classifyAlttpMusic,
  musicLabels: ALTTP_MUSIC_LABELS,
  isTitleScene: (scene) => ALTTP_TITLE_SCENES.has(scene),
  variants: { [ALTTP_DELUXE_VARIANT]: { remapTrack: remapAlttpTrack } },
  resumePath: alttpResumePath,
});

export { alttpMsuConfig };
