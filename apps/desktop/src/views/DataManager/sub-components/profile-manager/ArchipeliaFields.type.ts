/* @layer renderer-components @kind types */
import type { RotpLobbyForm } from '@app/randomizer/lobby/rotp-lobby.type';

interface ArchipeliaFieldsProps {
  value: RotpLobbyForm;
  onChange: (part: Partial<RotpLobbyForm>) => void;
  joining?: boolean;
}

export type { ArchipeliaFieldsProps };
