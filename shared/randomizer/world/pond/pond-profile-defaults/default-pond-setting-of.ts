/* @layer shared-game @kind logic */
import { DEFAULT_POND_PROFILES } from './pond-profiles.constants';
import type { PondId } from '../pond-instance.type';
import type { PondSetting } from '../pond-profile.type';

const defaultPondSettingOf = (id: PondId): PondSetting => DEFAULT_POND_PROFILES[id];

export { defaultPondSettingOf };
