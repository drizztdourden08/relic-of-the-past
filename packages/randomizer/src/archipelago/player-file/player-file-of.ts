/* @layer shared-game @kind logic */
import { DEFAULT_SLOT_NAME } from '../../client/online-config-of-profile/online-config-of-profile.constants';
import { renderPlayerYaml } from '../player-yaml';
import type { PlayerFile, PlayerFileInput } from './player-file.type';

const playerFileOf = (input: PlayerFileInput): PlayerFile => {
  const { options, seedText, deliverable, deathLink } = input;
  const typed = input.slotName?.trim() ?? '';
  const slotName = typed === '' ? DEFAULT_SLOT_NAME : typed;
  const appVersion = input.appVersion === undefined || input.appVersion === '' ? undefined : input.appVersion;
  const yaml = renderPlayerYaml({
    slotName, options, appVersion, seedText, deliverable: deliverable ?? {}, deathLink,
  });
  return { slotName, yaml };
};

export { playerFileOf };
