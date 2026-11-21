/* @layer renderer-lib @kind logic */
import { deliverableSetsOf, rotpPlayerFileOf, setExportOptionMessages } from '@rotp/randomizer';
import english from '@app/locales/en/randomizer.json';
import englishWorld from '@app/locales/en/randomizer-world.json';
import type { ProfileRandomizerConfig } from '@app/profiles/types';

const archipelagoYamlOf = (config: ProfileRandomizerConfig, appVersion: string) => {
  setExportOptionMessages({ ...english, ...englishWorld });
  return rotpPlayerFileOf({
    slotName: config.slotName,
    options: config.options,
    appVersion,
    seedText: config.seed,
    deliverable: config.deliverable ? deliverableSetsOf(config.deliverable) : {},
    deathLink: config.deathLink === true,
  });
};

export { archipelagoYamlOf };
