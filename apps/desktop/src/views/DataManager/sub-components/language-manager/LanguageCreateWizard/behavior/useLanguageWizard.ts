/* @layer renderer-components @kind hook */
import { useCallback, useMemo, useState } from 'react';
import { useWizard } from '@drizztdourden08/tessera/composites';
import { useImportProgress } from '@app/hooks/useImportProgress';
import { useLanguageCreation } from '../../useLanguageCreation';
import { useLanguageExtraction } from '../../useLanguageExtraction';
import { useLanguagePatchedImport } from '../../useLanguagePatchedImport';
import { INITIAL_VALUES } from '../LanguageCreateWizard.constants';
import type { LanguageWizardValues, PatchedRun, UseLanguageWizardParams } from '../LanguageCreateWizard.type';
import { finishLanguage } from './finish-language';
import { keepSelection } from './keep-selection';
import { languageWizardSteps } from './language-wizard-steps';

const useLanguageWizard = ({ sets, refresh, onCreated }: UseLanguageWizardParams) => {
  const [imported, setImported] = useState<string | null>(null);
  const progress = useImportProgress('language');
  const { handleUrlImport, handleFileImport } = useLanguageExtraction({ refresh, setSelected: keepSelection });
  const { handleCreate, handleDuplicate } = useLanguageCreation({ refresh, setSelected: keepSelection });
  const { busy, error, parts, handlePatchedImport } = useLanguagePatchedImport({ refresh, setSelected: setImported });
  const takenIds = useMemo(() => new Set(sets.map((set) => set.id)), [sets]);
  const steps = useMemo(() => languageWizardSteps({ imported, takenIds }), [imported, takenIds]);

  const handleFinish = useCallback((values: LanguageWizardValues) => finishLanguage(values, {
    imported, onUrlImport: handleUrlImport, onFileImport: handleFileImport, onCreate: handleCreate, onDuplicate: handleDuplicate,
  }), [imported, handleUrlImport, handleFileImport, handleCreate, handleDuplicate]);

  const wizard = useWizard({ steps, initialValues: INITIAL_VALUES, onFinish: handleFinish, onFinished: onCreated });
  const { values } = wizard;

  const run = useCallback(() => {
    const { name, release, credits, license, patchedFile } = values;
    if (patchedFile === null) return;
    void handlePatchedImport({ name, base: release, credits: credits.text, license: license.text, file: patchedFile });
  }, [values, handlePatchedImport]);

  const patched: PatchedRun = { busy, error, parts, imported, run };

  return { wizard, progress, patched };
};

export { useLanguageWizard };
