/* @layer renderer-widgets @kind component */
/**
 * ConnectionFindingRow — one audit finding: reason + an EDITABLE code field
 * (the user may tweak the suggested line) + an Apply button that writes it
 * through the screen-editor IPC (add → insert, remove/fix → remove/replace).
 */

import { useState } from 'react';
import { Box, Text, Button, TextInput } from '../../../design-system/primitives';
import type { ConnectionSuggestion } from './connection-audit-types';
import { AUDIT_S } from './connection-audit-styles';

interface ConnectionFindingRowProps {
  finding: ConnectionSuggestion;
}

const modeForKind = (kind: ConnectionSuggestion['kind']): 'insert' | 'remove' | 'replace' =>
  kind === 'add' ? 'insert' : kind === 'remove' ? 'remove' : 'replace';

const ConnectionFindingRow = ({ finding }: ConnectionFindingRowProps) => {
  const [code, setCode] = useState(finding.code.trim());
  const [writing, setWriting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleApply = async () => {
    setWriting(true);
    setError(null);
    try {
      const result = await window.api.screenEditor.writeConnections({
        filePath: finding.targetFile,
        code,
        mode: modeForKind(finding.kind),
        from: finding.from,
        to: finding.to,
      });
      if (result.success) setDone(true);
      else setError(result.error ?? 'Write failed');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Write failed');
    } finally {
      setWriting(false);
    }
  };

  return (
    <Box style={finding.kind === 'add' ? AUDIT_S.addItem : AUDIT_S.badItem}>
      <Text style={AUDIT_S.reason}>{finding.reason}</Text>
      <Text style={AUDIT_S.fileTarget}>{finding.targetFile}</Text>
      <TextInput
        style={AUDIT_S.codeArea}
        value={code}
        spellCheck={false}
        onChange={e => setCode(e.target.value)}
      />
      <Box style={AUDIT_S.applyRow}>
        <Button variant="tertiary" size="sm" onClick={handleApply} disabled={writing || done}>
          {done ? '✓ Applied' : writing ? 'Writing…' : finding.kind === 'remove' ? 'Apply (remove)' : 'Apply'}
        </Button>
        {error && <Text style={AUDIT_S.error}>{error}</Text>}
      </Box>
    </Box>
  );
};

export { ConnectionFindingRow };
