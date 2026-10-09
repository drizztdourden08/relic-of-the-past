/* @layer shared-game @kind types */
import type { PondId } from './pond-instance.type';
import type { PondSetting } from './pond-profile.type';

type PondProfiles = Readonly<Record<PondId, PondSetting>>;

export type { PondProfiles };
