/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import { formatBytes } from '@drizztdourden08/brock-core';
import { QUICK_SLOTS } from '@app/storage/save-files/save-files.constants';
import type { ProfileData } from './profile-data.type';

const buildSaveFacts = (data: ProfileData, t: I18n['t']): FactsPanelFact[] => {
  const { manual, auto, quick, sramBytes } = data;
  const bytes = [...manual, ...auto, ...quick].reduce((sum, info) => sum + info.size, 0) + (sramBytes ?? 0);
  return [
    { label: t('data-manager:profile-detail.saves.manual'), value: String(manual.length) },
    { label: t('data-manager:profile-detail.saves.auto'), value: String(auto.length) },
    { label: t('data-manager:profile-detail.saves.quick'), value: t('data-manager:profile-detail.saves.quick-used', { count: quick.length, total: QUICK_SLOTS }) },
    { label: t('data-manager:profile-detail.saves.battery'), value: sramBytes === null ? t('data-manager:profile-detail.saves.none') : formatBytes(sramBytes) },
    { label: t('data-manager:profile-detail.saves.size'), value: formatBytes(bytes) },
  ];
};

export { buildSaveFacts };
