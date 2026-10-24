/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import { requireHostApi } from '@drizztdourden08/brock-react';
import { DEFAULT_AP_VERSION, SUPPORTED_AP_VERSIONS } from '@rotp/randomizer';
import { useAppVersion } from '@app/hooks/useAppVersion';
import { worldPackageFor } from '@app/archipelago/world-package';
import { archipelagoYamlOf } from './archipelago-yaml-of';
import { feedbackOf } from './save-feedback';
import type { ProfileRandomizerConfig } from '@app/profiles/types';
import type { SaveFeedback } from './save-feedback.type';

const noPackageFeedback = (apVersion: string): SaveFeedback => ({
  tone: 'error',
  text: `Not saved: this app has no world package for Archipelago ${apVersion}. Supported versions: ${SUPPORTED_AP_VERSIONS.join(', ')}.`,
});

/**
 * Writes this profile Archipelago files (the player file and the bundled world package)
 * through the main process, which asks for the folder. The outcome becomes one line of feedback.
 * The package is the one for the newest supported Archipelago version.
 */
const useSaveArchipelagoFiles = (config: ProfileRandomizerConfig) => {
  const appVersion = useAppVersion();
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<SaveFeedback | null>(null);

  const save = useCallback(async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const apworld = await worldPackageFor(DEFAULT_AP_VERSION);
      if (apworld === null) {
        setFeedback(noPackageFeedback(DEFAULT_AP_VERSION));
        return;
      }
      const { slotName, yaml } = archipelagoYamlOf(config, appVersion);
      const result = await requireHostApi().saveArchipelagoFiles({ slotName, yaml, apworld });
      setFeedback(feedbackOf(result, config.deliverable !== undefined));
    } catch (err) {
      setFeedback({ tone: 'error', text: `Not saved: ${err instanceof Error ? err.message : String(err)}` });
    } finally {
      setSaving(false);
    }
  }, [config, appVersion]);

  return { saving, feedback, save };
};

export { useSaveArchipelagoFiles };
