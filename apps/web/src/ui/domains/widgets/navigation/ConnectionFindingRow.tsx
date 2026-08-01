/* @layer renderer-widgets @kind component */
/**
 * ConnectionFindingRow — one audit finding: reason + a read-only preview of the
 * record + an Apply button.
 *
 * The preview is deliberately not editable and is not what gets sent: Apply
 * posts the finding's typed write payload, so what reaches disk is a record
 * serialized by the dataset's own emitter and nothing else.
 */

import { useState } from 'react';
import { Box, Text, Button } from '../../../design-system/primitives';
import type { ConnectionSuggestion } from './connection-audit-types';
import { AUDIT_S } from './connection-audit-styles';

interface ConnectionFindingRowProps {
  finding: ConnectionSuggestion;
}

const ConnectionFindingRow = ({ finding }: ConnectionFindingRowProps) => {
  const [writing, setWriting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleApply = async () => {
    const write = finding.write;
    if (!write) return;
    setWriting(true);
    setError(null);
    try {
      const result = await window.api.screenEditor.writeConnections(write);
      if (result.success) setDone(true);
      else setError(result.error);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Write failed');
    } finally {
      setWriting(false);
    }
  };

  const target = finding.targetFile.relativePath
    ?? `unresolved destination — ${finding.targetFile.unresolved ?? 'no file'}`;

  return (
    <Box style={finding.kind === 'add' ? AUDIT_S.addItem : AUDIT_S.badItem}>
      <Text style={AUDIT_S.reason}>{finding.reason}</Text>
      <Text style={AUDIT_S.fileTarget}>{target}</Text>
      <Box as="pre" style={AUDIT_S.codeArea}>{finding.code}</Box>
      <Box style={AUDIT_S.applyRow}>
        <Button variant="tertiary" size="sm" onClick={handleApply} disabled={writing || done || !finding.write}>
          {done ? '✓ Applied' : writing ? 'Writing…' : finding.kind === 'remove' ? 'Apply (remove)' : 'Apply'}
        </Button>
        {error && <Text style={AUDIT_S.error}>{error}</Text>}
      </Box>
    </Box>
  );
};

export { ConnectionFindingRow };
