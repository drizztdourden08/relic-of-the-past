/* @layer shared-game @kind logic */
import { POND_INSTANCES } from '../pond-instances';
import { effectivePondProfiles, readsPondShare } from '../pond-share';
import { parsePondSetting } from '../pond-from-snapshot';
import type { PartialOptionValues } from '../../options.type';
import type { PondProfiles } from '../pond-profiles.type';
import type { ParsedPondProfiles } from '../pond.type';

const parsePondProfiles = (values: PartialOptionValues): ParsedPondProfiles => {
  const parsed = POND_INSTANCES.map((pond) => ({ pond, ...parsePondSetting(values, pond) }));
  const stored = Object.fromEntries(parsed.map((entry) => [entry.pond.id, entry.setting])) as PondProfiles;
  const shared = readsPondShare(values);
  return {
    profiles: effectivePondProfiles(stored, shared),
    stored,
    shared,
    notes: parsed.flatMap((entry) => entry.notes),
  };
};

export { parsePondProfiles };
