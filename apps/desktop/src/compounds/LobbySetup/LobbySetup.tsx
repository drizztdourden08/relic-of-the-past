/* @layer renderer-components @kind component */
import { Field, SegmentedControl, Stack, TextInput } from '@drizztdourden08/tessera/primitives';
import { DynamicInput } from '@drizztdourden08/tessera/composites';
import { DEFAULT_SLOT_NAME, slotNameError } from '@rotp/randomizer';
import { CODE_PATTERN, CODE_SLOTS, LOCATION_OPTIONS } from './LobbySetup.constants';
import type { LobbySetupProps } from './LobbySetup.type';
import { LanServerRows } from './sub-components/LanServerRows';
import { LobbyLine } from './sub-components/LobbyLine';
import { RemoteAddress } from './sub-components/RemoteAddress';
import './LobbySetup.css';

const LobbySetup = (props: LobbySetupProps) => {
  const { value, onChange, servers, lobby, disabled = false } = props;

  return (
    <Stack gap="sm" className="lobby-setup">
      <SegmentedControl
        label="Lobby on" value={value.location} options={LOCATION_OPTIONS} disabled={disabled}
        onChange={(location) => onChange({ location })}
      />
      {value.location === 'lan' && (
        <LanServerRows servers={servers} picked={value.lanId} onPick={(lanId) => onChange({ lanId })} disabled={disabled} />
      )}
      {value.location === 'remote' && (
        <Field label="Address">
          <RemoteAddress
            value={value.address} disabled={disabled}
            onChange={(address) => onChange({ address })}
          />
        </Field>
      )}
      <Field label="Lobby code" error={lobby.kind === 'error' ? lobby.text : undefined}>
        <DynamicInput
          className="lobby-setup__code" pattern={CODE_PATTERN} slots={CODE_SLOTS} value={value.code}
          disabled={disabled} aria-label="Lobby code"
          onChange={(code) => onChange({ code })}
        />
      </Field>
      <LobbyLine state={lobby} />
      <Field label="Slot name" error={slotNameError(value.slotName) ?? undefined}>
        <TextInput
          type="text" value={value.slotName} spellCheck={false} placeholder={DEFAULT_SLOT_NAME} disabled={disabled}
          onChange={(e) => onChange({ slotName: e.target.value })}
        />
      </Field>
    </Stack>
  );
};

export { LobbySetup };
