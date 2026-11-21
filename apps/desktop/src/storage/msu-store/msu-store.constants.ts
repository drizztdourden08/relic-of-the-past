/* @layer renderer-lib @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';

const MSU_TRACK_PATTERN = /.(pcm|opuz|msu)$/i;
const NO_TRACKS_ERROR = msg('errors:msu.noTracks');

export { MSU_TRACK_PATTERN, NO_TRACKS_ERROR };
