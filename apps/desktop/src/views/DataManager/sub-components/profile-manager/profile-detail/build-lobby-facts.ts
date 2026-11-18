/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import type { ArchipeliaMembership } from '@drizztdourden08/brock-randomizer/renderer';

const buildLobbyFacts = (membership: ArchipeliaMembership, slotName: string, t: I18n['t']): FactsPanelFact[] => [
  { label: t('data-manager:profile-detail.lobby.server'), value: membership.server, mono: true },
  { label: t('data-manager:profile-detail.lobby.lobby'), value: membership.lobbyName },
  ...(membership.lobby.code === undefined ? [] : [{ label: t('data-manager:profile-detail.lobby.code'), value: membership.lobby.code, mono: true, copyable: true }]),
  { label: t('data-manager:profile-detail.lobby.archipelago'), value: membership.ap, mono: true },
  { label: t('data-manager:profile-detail.lobby.slot'), value: slotName },
];

export { buildLobbyFacts };
