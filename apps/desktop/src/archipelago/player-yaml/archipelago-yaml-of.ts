/* @layer renderer-lib @kind logic */
import { deliverableSetsOf, playerFileOf } from '@rotp/randomizer';
import type { ProfileRandomizerConfig } from '@app/profiles/types';

const archipelagoYamlOf = (config: ProfileRandomizerConfig, appVersion: string) =>
  playerFileOf({
    slotName: config.slotName,
    options: config.options,
    appVersion,
    seedText: config.seed,
    deliverable: config.deliverable ? deliverableSetsOf(config.deliverable) : {},
    deathLink: config.deathLink === true,
  });

export { archipelagoYamlOf };
