/* @layer renderer-components @kind component */
/**
 * The profile's server setup, always open, with Test connection; Save and Revert show once
 * it is edited. Saving reconnects at once. Below it, why the session stopped, when it did.
 */
import { Button, Text } from '@ds/primitives';
import { ServerSetup } from '@domains/app/compounds/ServerSetup';
import { useConnectionForm } from '../behavior/useConnectionForm';
import type { ProfileRandomizerConfig, RandomizerConnectionPatch } from '@shared/types/profile';

interface ConnectionEditorProps {
  config: ProfileRandomizerConfig;
  /** Why the session stopped or cannot reach the server; null while it is fine. */
  sessionError: string | null;
  onSave: (patch: RandomizerConnectionPatch) => Promise<void>;
}

const ConnectionEditor = ({ config, sessionError, onSave }: ConnectionEditorProps) => {
  const form = useConnectionForm({ config, onSave });
  const actions = form.dirty && (
    <>
      <Button variant="ghost" size="sm" onClick={form.revert} disabled={form.saving}>Revert</Button>
      <Button variant="primary" size="sm" onClick={() => void form.save()} disabled={form.saving}>Save</Button>
    </>
  );

  return (
    <>
      <ServerSetup
        value={form.draft}
        onChange={form.change}
        onHostChange={form.changeHost}
        onHostBlur={form.settleHost}
        probe={form.probe.state}
        onTest={() => void form.probe.test()}
        error={form.error}
        actions={actions || undefined}
        disabled={form.saving}
      />
      {sessionError !== null && !form.dirty && <Text className="randomizer-page__hint--error">{sessionError}</Text>}
    </>
  );
};

export { ConnectionEditor };
export type { ConnectionEditorProps };
