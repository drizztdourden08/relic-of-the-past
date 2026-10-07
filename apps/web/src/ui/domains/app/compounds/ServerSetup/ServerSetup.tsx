/* @layer renderer-components @kind component */
/**
 * An Archipelago server setup: host and port, password, slot name, and a Test connection
 * button with what it found. Bare: the fields, the probe's result and any error arrive as
 * props, and every edit leaves through a callback. The profile-creation form and the
 * Randomizer page's Network tab both draw it.
 */
import { useState } from 'react';
import { Box, Button, Field, Flex, Spinner, Stack, Text, TextInput } from '@ds/primitives';
import type { ServerSetupProps } from './ServerSetup.type';
import './ServerSetup.css';

const ServerSetup = (props: ServerSetupProps) => {
  const { value, onChange, onHostChange, onHostBlur, probe, onTest, error, actions, disabled = false } = props;
  const [showPassword, setShowPassword] = useState(false);
  const testing = probe.kind === 'testing';

  return (
    <Stack gap="sm" className="server-setup">
      <Box className="server-setup__address">
        <Field label="Host">
          <TextInput
            type="text" value={value.host} spellCheck={false} placeholder="archipelago.gg" disabled={disabled}
            onChange={(e) => onHostChange(e.target.value)} onBlur={onHostBlur}
          />
        </Field>
        <Field label="Port">
          <TextInput
            type="text" inputMode="numeric" value={value.port} className="server-setup__port" disabled={disabled}
            onChange={(e) => onChange({ port: e.target.value })}
          />
        </Field>
      </Box>
      <Field label="Password">
        <Flex gap="xs" align="center">
          <TextInput
            type={showPassword ? 'text' : 'password'} autoComplete="off" placeholder="optional"
            value={value.password} disabled={disabled}
            onChange={(e) => onChange({ password: e.target.value })}
          />
          <Button variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? 'Hide' : 'Show'}
          </Button>
        </Flex>
      </Field>
      <Field label="Slot name">
        <TextInput
          type="text" value={value.slotName} spellCheck={false} disabled={disabled}
          onChange={(e) => onChange({ slotName: e.target.value })}
        />
      </Field>
      <Flex gap="sm" align="center" wrap>
        <Button variant="secondary" size="sm" onClick={onTest} disabled={disabled || testing}>Test connection</Button>
        {testing && <Spinner size="sm" />}
        {(probe.kind === 'ok' || probe.kind === 'failed') && (
          <Text className="server-setup__result" data-tone={probe.kind}>{probe.text}</Text>
        )}
        {actions !== undefined && <Flex gap="sm" align="center" className="server-setup__actions">{actions}</Flex>}
      </Flex>
      {error ? <Text className="server-setup__result" data-tone="failed">{error}</Text> : null}
    </Stack>
  );
};

export { ServerSetup };
