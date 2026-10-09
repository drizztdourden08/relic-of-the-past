/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box, Text, Status, Button } from '@drizztdourden08/tessera/primitives';
import { LANGUAGE_NAMES } from '../../language-names.constants';
import type { BundleHeaderProps } from './BundleHeader.type';
import './BundleHeader.css';

const baseLabel = (base: string): string => LANGUAGE_NAMES[base] ?? base;

const BundleHeader = (props: BundleHeaderProps) => {
  const {
    set, warnings, dirty, saving, saveError, readOnly = false,
    onDuplicate, onSaveNow, onExport, exporting = false, exportStatus,
  } = props;

  const facts = useMemo(() => [
    `id: ${set.id}`,
    set.origin === 'rom' ? `from a ${baseLabel(set.base)} ROM` : `based on ${baseLabel(set.base)}`,
    `${set.dialogue.length} lines`,
    `${set.glossary.length} terms`,
  ], [set.id, set.origin, set.base, set.dialogue.length, set.glossary.length]);

  return (
    <Box className="bundle-header">
      <Box className="bundle-header__title">
        <Text variant="title">{set.name}</Text>
        <Status tone="neutral">{set.origin === 'rom' ? 'from ROM' : 'custom'}</Status>
        {warnings > 0 && (
          <Status tone="warning">{`${warnings} ${warnings === 1 ? 'line needs' : 'lines need'} attention`}</Status>
        )}
      </Box>

      <Box className="bundle-header__facts">
        {facts.map((fact) => <Text key={fact} variant="caption">{fact}</Text>)}
      </Box>

      <Box className="bundle-header__state">
        {saveError && <Status tone="danger">{saveError}</Status>}
        {!saveError && readOnly && <Status tone="neutral">Read only</Status>}
        {!saveError && !readOnly && saving && <Status tone="neutral">Saving...</Status>}
        {!saveError && !readOnly && !saving && dirty && <Status tone="warning">Not saved yet</Status>}
        {!saveError && !readOnly && !saving && !dirty && <Status tone="success">Saved</Status>}
        {onSaveNow && !readOnly && (
          <Button variant="ghost" size="sm" disabled={!dirty || saving} onClick={onSaveNow}>Save now</Button>
        )}
        {onDuplicate && <Button variant="ghost" size="sm" onClick={onDuplicate}>Duplicate</Button>}
        {onExport && (
          <Button variant="ghost" size="sm" disabled={saving || exporting} onClick={onExport}>
            {exporting ? 'Exporting...' : 'Export .rlang'}
          </Button>
        )}
        {exportStatus && <Text variant="caption">{exportStatus}</Text>}
      </Box>
    </Box>
  );
};

export { BundleHeader };
