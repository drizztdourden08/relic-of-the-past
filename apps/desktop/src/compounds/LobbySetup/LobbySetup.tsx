/* @layer renderer-components @kind component */
import { Field, Grid, SegmentedControl, Stack, TextInput } from '@drizztdourden08/tessera/primitives';
import { slotNameError } from '@rotp/randomizer';
import { LOCATION_OPTIONS, NAME_PLACEHOLDER } from './LobbySetup.constants';
import type { LobbySetupProps } from './LobbySetup.type';
import { ConnectionSection } from './sub-components/ConnectionSection';
import { LobbyLine } from './sub-components/LobbyLine';
import { SeatField } from './sub-components/SeatField';
import './LobbySetup.css';

const LobbySetup = (props: LobbySetupProps) => {
  const { value, onChange, lobbies, lobby, disabled = false } = props;

  return (
    <Stack gap="md" className="lobby-setup">
      <SegmentedControl
        label="Lobby on" value={value.location} options={LOCATION_OPTIONS} disabled={disabled}
        onChange={(location) => onChange({ location })}
      />
      <ConnectionSection value={value} onChange={onChange} lobbies={lobbies} lobby={lobby} disabled={disabled} />
      <LobbyLine state={lobby} />
      <Grid columns={2} gap="md">
        {lobby.kind === 'ok' && lobby.seats.length > 0 && (
          <SeatField seats={lobby.seats} picked={value.seat} onPick={(seat) => onChange({ seat })} disabled={disabled} />
        )}
        <Field label="Name" error={slotNameError(value.slotName) ?? undefined}>
          <TextInput
            type="text" value={value.slotName} spellCheck={false} placeholder={NAME_PLACEHOLDER} disabled={disabled}
            onChange={(e) => onChange({ slotName: e.target.value })}
          />
        </Field>
      </Grid>
    </Stack>
  );
};

export { LobbySetup };
