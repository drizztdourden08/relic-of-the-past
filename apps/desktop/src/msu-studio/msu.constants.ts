/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { AmbientRole } from '@rotp/game-data';

const AUDIO_ACCEPT = ['.wav', '.mp3', '.ogg', '.flac', '.opus', '.pcm'];

const AMBIENT_ROLE_LABELS: Record<AmbientRole, Message> = {
  bed: msg('msu-studio:sound.role.bed'),
  control: msg('msu-studio:sound.role.control'),
  cue: msg('msu-studio:sound.role.cue'),
};

const AMBIENT_ROLE_HINTS: Record<AmbientRole, Message> = {
  bed: msg('msu-studio:sound.role.bed-hint'),
  control: msg('msu-studio:sound.role.control-hint'),
  cue: msg('msu-studio:sound.role.cue-hint'),
};

export { AMBIENT_ROLE_HINTS, AMBIENT_ROLE_LABELS, AUDIO_ACCEPT };
