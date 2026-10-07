/* @layer shared-game @kind types */
/**
 * One setting per pond. The three are configured apart, so nothing outside
 * this folder carries a bare PondSetting any more: a consumer that means one
 * pond says which one (`profiles.capacity`), and a consumer that means all of
 * them carries the whole record.
 */
import type { PondId } from './pond-instance.type';
import type { PondSetting } from './pond-profile.type';

type PondProfiles = Readonly<Record<PondId, PondSetting>>;

export type { PondProfiles };
