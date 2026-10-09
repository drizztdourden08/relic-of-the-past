/* @layer shared-game @kind logic */
import type { PondSetting } from '../pond/pond-profile.type';

const isPondActive = (pond: PondSetting): boolean => pond.mode !== 'capacity';

export { isPondActive };
