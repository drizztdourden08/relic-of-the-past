/* @layer renderer-components @kind component */
import type { ProfileWizardStepBodyProps } from '@drizztdourden08/brock-react';
import type { RandomizerFormState } from '@drizztdourden08/brock-randomizer';
import { CONNECTION_SLICE, rotpLobbyOfConnection } from '@app/randomizer/lobby/rotp-lobby-of-connection';
import type { RotpLobbyForm } from '@app/randomizer/lobby/rotp-lobby.type';
import { ArchipeliaFields } from '@app/views/DataManager/sub-components/profile-manager/ArchipeliaFields';

const ArchipeliaConnectionSlot = ({ values, onChange }: ProfileWizardStepBodyProps<RandomizerFormState>) => (
  <ArchipeliaFields
    value={rotpLobbyOfConnection(values[CONNECTION_SLICE] as Record<string, unknown> | undefined)}
    onChange={(part: Partial<RotpLobbyForm>) => onChange(part as Partial<RandomizerFormState>)}
  />
);

export { ArchipeliaConnectionSlot };
