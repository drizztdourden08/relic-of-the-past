/* @layer bridge-wasm @kind logic */
import { openSocketLink, serverUrlCandidates } from '@rotp/randomizer';
import type { OnlineContext } from '@rotp/randomizer';
import { dispatchMessage } from '../online-dispatch';
import type { ClientKit } from './online-client-kit.type';

const makeConnect = (kit: ClientKit, ctx: OnlineContext, onClose: (opened: boolean) => void) => (): void => {
  const { config, deps, state, network, deathLinks } = kit;
  const candidates = state.workingUrl !== null ? [state.workingUrl] : [...new Set([...serverUrlCandidates(config.url), ...serverUrlCandidates(config.fallbackUrl ?? '')])];
  state.link = openSocketLink(candidates, deps.createSocket, {
    onOpen: (openedUrl) => {
      state.workingUrl = openedUrl;
      network.opened(openedUrl);
    },
    onMessage: (data) => dispatchMessage(ctx, data, network, deathLinks.handleBounced),
    onClose,
  });
};

export { makeConnect };
