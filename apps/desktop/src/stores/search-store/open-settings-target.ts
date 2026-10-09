/* @layer renderer-stores @kind logic */
import { SETTINGS_TARGETS } from './search-store.constants';
import { useSearchStore } from './useSearchStore';

const openSettingsTarget = (settingId: string): void => {
  const target = SETTINGS_TARGETS[settingId] ?? SETTINGS_TARGETS.vanillaSafe;
  useSearchStore.getState().setPendingTab(target.tab);
  useSearchStore.getState().setPendingAnchor(target.anchor);
};

export { openSettingsTarget };
