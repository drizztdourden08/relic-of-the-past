/* @layer renderer-components @kind component */
/**
 * The profile's connection, editable: an Edit button with the reason the session stopped
 * beside it, or the fields open inline. Saving reconnects at once.
 */
import { Box, Button, Text } from '@ds/primitives';
import { useConnectionForm } from '../behavior/useConnectionForm';
import { ConnectionForm } from './ConnectionForm';
import type { ProfileRandomizerConfig, RandomizerConnectionPatch } from '@shared/types/profile';

interface ConnectionEditorProps {
  config: ProfileRandomizerConfig;
  /** Why the session stopped or cannot reach the server; null while it is fine. */
  error: string | null;
  onSave: (patch: RandomizerConnectionPatch) => Promise<void>;
}

const ConnectionEditor = ({ config, error, onSave }: ConnectionEditorProps) => {
  const form = useConnectionForm({ config, onSave });

  if (form.draft !== null) return <ConnectionForm form={form} draft={form.draft} />;
  return (
    <Box className="network-tab__edit-row">
      <Button variant="secondary" size="sm" onClick={form.open}>Edit</Button>
      {error !== null && <Text className="randomizer-page__hint--error">{error}</Text>}
    </Box>
  );
};

export { ConnectionEditor };
export type { ConnectionEditorProps };
