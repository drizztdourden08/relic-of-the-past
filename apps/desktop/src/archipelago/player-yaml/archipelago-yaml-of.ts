/* @layer renderer-lib @kind logic */
import { DEFAULT_SLOT_NAME, deliverableSetsOf, renderPlayerYaml } from '@rotp/randomizer';
import type { ProfileRandomizerConfig } from '@app/profiles/types';

const archipelagoYamlOf = (config: ProfileRandomizerConfig, appVersion: string) => {
  const typed = config.slotName?.trim() ?? '';
  const slotName = typed === '' ? DEFAULT_SLOT_NAME : typed;
  const deliverable = config.deliverable ? deliverableSetsOf(config.deliverable) : {};
  const yaml = renderPlayerYaml({
    slotName,
    options: config.options,
    appVersion: appVersion === '' ? undefined : appVersion,
    seedText: config.seed,
    deliverable,
    deathLink: config.deathLink === true,
  });
  return { slotName, yaml };
};

export { archipelagoYamlOf };
