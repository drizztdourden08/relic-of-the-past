/* @layer renderer-app @kind config */
import type { RendererModule } from '@drizztdourden08/brock-react';
import { GameSession } from '@app/views/GameSession';
import { rotpPorts } from '@app/platform/rotp-ports';
import { ROTP_LOG_CHANNELS } from '@app/log-bus/log-channels.constants';
import { ROTP_MENU } from './rotp-menu.constants';
import { rotpLocaleSource } from '@app/app-language';

const rotpShellModule: RendererModule = {
  id: 'rotp',
  Provider: GameSession,
  ports: rotpPorts(),
  logChannels: ROTP_LOG_CHANNELS,
  menu: ROTP_MENU,
  i18n: rotpLocaleSource,
};

export { rotpShellModule };
