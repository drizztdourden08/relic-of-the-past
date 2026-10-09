/* @layer renderer-lib @kind logic */
import { toldProfile } from './told-profile';

const setHudProfileId = (id: string | null): void => { toldProfile.id = id; };

export { setHudProfileId };
