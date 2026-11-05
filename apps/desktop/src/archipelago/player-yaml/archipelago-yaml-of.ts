/* @layer renderer-lib @kind logic */
import { deliverableSetsOf, rotpPlayerFileOf } from '@rotp/randomizer';
import type { ProfileRandomizerConfig } from '@app/profiles/types';

const archipelagoYamlOf = (config: ProfileRandomizerConfig, appVersion: string) =>
  rotpPlayerFileOf({
    slotName: config.slotName,
    options: config.options,
    appVersion,
    seedText: config.seed,
    deliverable: config.deliverable ? deliverableSetsOf(config.deliverable) : {},
    deathLink: config.deathLink === true,
  });

export { archipelagoYamlOf };
