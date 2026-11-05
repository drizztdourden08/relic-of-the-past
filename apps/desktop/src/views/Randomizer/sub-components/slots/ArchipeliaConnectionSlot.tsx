/* @layer renderer-components @kind component */
import type { ProfileWizardStepBodyProps } from '@drizztdourden08/brock-react';
import type { RandomizerConnectionValues } from '@drizztdourden08/brock-randomizer';
import { rotpLobbyOfConnection } from '@app/randomizer/lobby/rotp-lobby-of-connection';
import type { RotpLobbyForm } from '@app/randomizer/lobby/rotp-lobby.type';
import { ArchipeliaFields } from '@app/views/DataManager/sub-components/profile-manager/ArchipeliaFields';

const ArchipeliaConnectionSlot = ({ values, onChange }: ProfileWizardStepBodyProps<RandomizerConnectionValues>) => (
  <ArchipeliaFields
    value={rotpLobbyOfConnection(values)}
    onChange={(part: Partial<RotpLobbyForm>) => onChange(part as Partial<RandomizerConnectionValues>)}
  />
);

export { ArchipeliaConnectionSlot };
