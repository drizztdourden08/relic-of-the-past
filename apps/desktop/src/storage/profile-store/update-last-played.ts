/* @layer renderer-lib @kind logic */
import { touchProfile } from '@drizztdourden08/brock-react';

const updateLastPlayed = (id: string): Promise<void> => touchProfile(id);

export { updateLastPlayed };
