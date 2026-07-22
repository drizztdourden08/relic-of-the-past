/* @layer renderer-widgets @kind component */
/**
 * ConnectionAuditSection — renders the flood-triggered connection audit:
 * a prominent "bad connections" block (unbacked dataset edges) and an
 * "add detected connections" block (real transitions the dataset lacks).
 */

import { Box } from '../../../design-system/primitives';
import { S } from './dataset-widget-styles';
import { AUDIT_S } from './connection-audit-styles';
import { ConnectionFindingRow } from './ConnectionFindingRow';
import type { ConnectionSuggestion } from './connection-audit-types';

interface ConnectionAuditSectionProps {
  badFindings: ConnectionSuggestion[];
  addFindings: ConnectionSuggestion[];
}

const ConnectionAuditSection = ({ badFindings, addFindings }: ConnectionAuditSectionProps) => {
  if (badFindings.length === 0 && addFindings.length === 0) return null;

  return (
    <>
      {badFindings.length > 0 && (
        <Box style={S.section}>
          <Box style={AUDIT_S.sectionTitleBad}>
            ⚠ Bad connection{badFindings.length > 1 ? 's' : ''} detected (from in-game data)
          </Box>
          {badFindings.map(f => (
            <ConnectionFindingRow key={`${f.kind}-${f.from}-${f.to}`} finding={f} />
          ))}
        </Box>
      )}
      {addFindings.length > 0 && (
        <Box style={S.section}>
          <Box style={AUDIT_S.sectionTitleAdd}>Add detected connections</Box>
          {addFindings.map(f => (
            <ConnectionFindingRow key={`${f.kind}-${f.from}-${f.to}`} finding={f} />
          ))}
        </Box>
      )}
    </>
  );
};

export { ConnectionAuditSection };
