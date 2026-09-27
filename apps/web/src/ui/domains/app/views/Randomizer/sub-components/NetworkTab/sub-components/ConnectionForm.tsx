/* @layer renderer-components @kind component */
/** The connection fields, open inline: host and port, password, slot, the two session switches. */
import { useState } from 'react';
import { Box, Button, ButtonRow, Field, Text, TextInput, Toggle } from '@ds/primitives';
import type { ConnectionForm as ConnectionFormState } from '../behavior/useConnectionForm';
import type { ConnectionDraft } from '../behavior/connection-draft';

interface ConnectionFormProps {
  form: ConnectionFormState;
  draft: ConnectionDraft;
}

const ConnectionForm = ({ form, draft }: ConnectionFormProps) => {
  const { change, changeHost, settleHost, save, cancel, error, saving } = form;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Box className="network-tab__form">
      <Box className="network-tab__address">
        <Field label="Host">
          <TextInput
            type="text" value={draft.host} spellCheck={false}
            onChange={(e) => changeHost(e.target.value)} onBlur={settleHost}
          />
        </Field>
        <Field label="Port">
          <TextInput
            type="text" inputMode="numeric" value={draft.port} className="network-tab__port"
            onChange={(e) => change({ port: e.target.value })}
          />
        </Field>
      </Box>
      <Field label="Password">
        <Box className="network-tab__secret">
          <TextInput
            type={showPassword ? 'text' : 'password'} autoComplete="off" value={draft.password}
            onChange={(e) => change({ password: e.target.value })}
          />
          <Button variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? 'Hide' : 'Show'}
          </Button>
        </Box>
      </Field>
      <Field label="Slot">
        <TextInput type="text" value={draft.slotName} onChange={(e) => change({ slotName: e.target.value })} />
      </Field>
      <Toggle label="DeathLink" checked={draft.deathLink} onChange={(deathLink) => change({ deathLink })} />
      <Toggle
        label="Track other players" checked={draft.trackOtherPlayers}
        onChange={(trackOtherPlayers) => change({ trackOtherPlayers })}
      />
      <ButtonRow>
        {error !== null && <Text className="randomizer-page__hint--error network-tab__form-error">{error}</Text>}
        <Button variant="secondary" size="sm" onClick={cancel} disabled={saving}>Cancel</Button>
        <Button variant="primary" size="sm" onClick={() => void save()} disabled={saving}>Save</Button>
      </ButtonRow>
    </Box>
  );
};

export { ConnectionForm };
export type { ConnectionFormProps };
