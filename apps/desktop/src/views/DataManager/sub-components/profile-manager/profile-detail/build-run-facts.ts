/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import type { ProfileRandomizerConfig } from '@app/profiles/types';
import { runTypeLabels } from './build-run-facts.constants';

const connectionFacts = (randomizer: ProfileRandomizerConfig, t: I18n['t']): FactsPanelFact[] => {
  const none = t('data-manager:profile-detail.run.none');
  return [
  ...(randomizer.serverUrl ? [{ label: t('data-manager:profile-detail.run.server'), value: randomizer.serverUrl, mono: true }] : []),
  { label: t('data-manager:profile-detail.run.name'), value: randomizer.slotName ?? none },
  ...(randomizer.mode === 'online' ? [{ label: t('data-manager:profile-detail.run.password'), value: randomizer.password ? t('data-manager:profile-detail.run.set') : none }] : []),
  { label: t('data-manager:profile-detail.run.death-link'), value: randomizer.deathLink ? t('data-manager:profile-detail.run.on') : t('data-manager:profile-detail.run.off') },
  ];
};

const buildRunFacts = (randomizer: ProfileRandomizerConfig, t: I18n['t']): FactsPanelFact[] => [
  { label: t('data-manager:profile-detail.run.seed'), value: randomizer.seed, mono: true, copyable: true },
  { label: t('data-manager:profile-detail.run.type'), value: runTypeLabels(t)[randomizer.mode] },
  ...(randomizer.mode === 'local' ? [] : connectionFacts(randomizer, t)),
];

export { buildRunFacts };
