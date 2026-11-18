/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import { requireHostApi, useT } from '@drizztdourden08/brock-react';
import { worldPackageFor } from '@drizztdourden08/brock-randomizer/renderer';
import { DEFAULT_AP_VERSION, SUPPORTED_AP_VERSIONS, WORLD_MODULE_NAME } from '@rotp/randomizer';
import { useAppVersion } from '@app/hooks/useAppVersion';
import { archipelagoYamlOf } from '@app/archipelago/player-yaml';
import { feedbackOf } from './save-feedback';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { ProfileRandomizerConfig } from '@app/profiles/types';
import type { SaveFeedback } from './save-feedback.type';

const noPackageFeedback = (t: I18n['t'], apVersion: string): SaveFeedback => ({
  tone: 'error',
  text: t('views-randomizer:feedback.noPackage', { version: apVersion, supported: SUPPORTED_AP_VERSIONS.join(', ') }),
});

const useSaveArchipelagoFiles = (config: ProfileRandomizerConfig) => {
  const t = useT();
  const appVersion = useAppVersion();
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<SaveFeedback | null>(null);

  const save = useCallback(async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const apworld = await worldPackageFor(DEFAULT_AP_VERSION);
      if (apworld === null) {
        setFeedback(noPackageFeedback(t, DEFAULT_AP_VERSION));
        return;
      }
      const { slotName, yaml } = archipelagoYamlOf(config, appVersion);
      const result = await requireHostApi().randomizer.saveArchipelagoFiles({
        slotName, yaml, apworld, moduleName: WORLD_MODULE_NAME,
      });
      setFeedback(feedbackOf(t, result, config.deliverable !== undefined));
    } catch (err) {
      setFeedback({ tone: 'error', text: t('views-randomizer:feedback.notSaved', { reason: err instanceof Error ? err.message : String(err) }) });
    } finally {
      setSaving(false);
    }
  }, [config, appVersion, t]);

  return { saving, feedback, save };
};

export { useSaveArchipelagoFiles };
