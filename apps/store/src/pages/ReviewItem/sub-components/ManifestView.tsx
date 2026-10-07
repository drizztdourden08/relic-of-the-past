/* @layer store-site @kind component */
/** The pack's manifest as it sits in the file: the entry's name, then its JSON, laid out. */
import { useMemo } from 'react';
import { CodeBlock } from '@ds/composites/CodeBlock';
import { SettingsSection } from '@ds/composites/SettingsSection';
import { StatRow } from '@ds/primitives/StatRow';
import { Text } from '@ds/primitives/Text';
import type { PackSource } from '@domains/packs/pack-source.type';
import { useManifest } from '../behavior/useManifest';

type ManifestViewProps = {
  source: PackSource | null;
  /** Why there is no source, or null while its link loads. */
  reason: string | null;
};

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
export type { ManifestViewProps };
