/* @layer store-site @kind component */
import { useMemo } from 'react';
import { CodeBlock, SettingsSection } from '@drizztdourden08/tessera/composites';
import { StatRow, Text } from '@drizztdourden08/tessera/primitives';
import { useManifest } from '../behavior/useManifest';
import type { ManifestViewProps } from './ManifestView.type';

const ManifestView = (props: ManifestViewProps) => {
  const { source, reason } = props;
  const { entry, error, loading } = useManifest(source);
  const code = useMemo(() => (entry ? JSON.stringify(entry.manifest, null, 2) : ''), [entry]);
  const status = reason ?? error ?? (loading || !source ? 'Reading the manifest...' : null);
  return (
    <SettingsSection title="Manifest">
      {entry && <StatRow label="entry" value={entry.name} mono />}
      {status && <Text as="p" variant="caption" role={reason || error ? 'alert' : 'status'}>{status}</Text>}
      {entry && <CodeBlock code={code} language="json" />}
    </SettingsSection>
  );
};

export { ManifestView };
