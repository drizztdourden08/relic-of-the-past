/* @layer shared-game @kind logic */
import { AP_WORLD_VERSION } from './ap-game';
import { MALFORMED_SLOT_DATA } from './archipelago.constants';
import { isRecord, parseMedallions, parseOptions, parsePreRolled } from './slot-data-fields';
import type { ParsedSlotData } from './slot-data.type';

const versionMessage = (worldVersion: string): string =>
  `World package version ${worldVersion} does not match this app (${AP_WORLD_VERSION}). `
  + 'Regenerate the game with the package this app saves.';

const parseSlotData = (raw: unknown): ParsedSlotData => {
  if (!isRecord(raw)) return MALFORMED_SLOT_DATA;
  const { worldVersion, deathLink } = raw;
  if (typeof worldVersion !== 'string') return MALFORMED_SLOT_DATA;
  if (worldVersion !== AP_WORLD_VERSION) return { kind: 'version', message: versionMessage(worldVersion) };
  const options = parseOptions(raw.options);
  const medallions = parseMedallions(raw.medallions);
  if (options === null || medallions === null) return MALFORMED_SLOT_DATA;
  const preRolled = parsePreRolled(raw.preRolled);
  return {
    kind: 'ok',
    slotData: {
      worldVersion,
      ...(typeof raw.seed === 'string' ? { seed: raw.seed } : {}),
      options,
      medallions,
      deathLink: deathLink === true || deathLink === 1,
      ...(preRolled !== undefined ? { preRolled } : {}),
    },
  };
};

export { parseSlotData };
