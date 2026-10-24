/* @layer renderer-components @kind logic */
import { DEFAULT_SLOT_NAME, deliverableSetsOf, renderPlayerYaml } from '@rotp/randomizer';
import type { ProfileRandomizerConfig } from '@app/profiles/types';

/** The slot a profile connects as, and the player file for it. */
const archipelagoYamlOf = (config: ProfileRandomizerConfig, appVersion: string) => {
  const slotName = config.slotName?.trim() || DEFAULT_SLOT_NAME;
  // A profile from before the probed spots were recorded proves none: all stay vanilla.
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
