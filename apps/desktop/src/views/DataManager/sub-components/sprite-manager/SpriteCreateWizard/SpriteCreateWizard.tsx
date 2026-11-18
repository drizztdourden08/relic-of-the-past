/* @layer renderer-views @kind view */
import { useT } from '@drizztdourden08/brock-react';
import { Wizard } from '@drizztdourden08/tessera/composites';
import { STEP_IDS } from './SpriteCreateWizard.constants';
import type { SpriteCreateWizardProps } from './SpriteCreateWizard.type';
import { useSpriteWizard } from './behavior/useSpriteWizard';
import { ExtractStep } from './sub-components/ExtractStep';
import { RomStep } from './sub-components/RomStep';

const SpriteCreateWizard = (props: SpriteCreateWizardProps) => {
  const t = useT();
  const { roms, extractedMap, busy, onExtract, onCancel, onCreated } = props;
  const { wizard, progress } = useSpriteWizard({ onExtract, onCreated });
  const { values, update } = wizard;

  return (
    <Wizard wizard={wizard} busy={busy} title={t('wizards:sprite.title')} orientation="vertical" stepperSize="sm" onExit={onCancel}>
      {wizard.current.id === STEP_IDS.rom
        ? <RomStep values={values} update={update} roms={roms} extractedMap={extractedMap} />
        : <ExtractStep romFile={values.romFile} busy={busy} progress={progress} />}
    </Wizard>
  );
};

export { SpriteCreateWizard };
