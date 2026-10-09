/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Button, Text } from '@drizztdourden08/tessera/primitives';
import { ServerSetup } from '@app/compounds/ServerSetup';
import { useConnectionForm } from '../behavior/useConnectionForm';
import type { ConnectionEditorProps } from './ConnectionEditor.type';

const ConnectionEditor = ({ config, sessionError, onSave }: ConnectionEditorProps) => {
  const form = useConnectionForm({ config, onSave });
  const { save, probe } = form;
  const handleSave = useCallback(() => void save(), [save]);
  const handleTest = useCallback(() => void probe.test(), [probe]);
  const actions = form.dirty && (
    <>
      <Button variant="ghost" size="sm" onClick={form.revert} disabled={form.saving}>Revert</Button>
      <Button variant="primary" size="sm" onClick={handleSave} disabled={form.saving}>Save</Button>
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
        onTest={handleTest}
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
