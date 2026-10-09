/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box, Text, Badge, Button } from '@ds/primitives';
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
        <Badge variant="neutral">{set.origin === 'rom' ? 'from ROM' : 'custom'}</Badge>
        {warnings > 0 && (
          <Badge variant="warning">{`${warnings} ${warnings === 1 ? 'line needs' : 'lines need'} attention`}</Badge>
        )}
      </Box>

      <Box className="bundle-header__facts">
        {facts.map((fact) => <Text key={fact} variant="caption">{fact}</Text>)}
      </Box>

      <Box className="bundle-header__state">
        {saveError && <Badge variant="danger">{saveError}</Badge>}
        {!saveError && readOnly && <Badge variant="neutral">Read only</Badge>}
        {!saveError && !readOnly && saving && <Badge variant="neutral">Saving...</Badge>}
        {!saveError && !readOnly && !saving && dirty && <Badge variant="warning">Not saved yet</Badge>}
        {!saveError && !readOnly && !saving && !dirty && <Badge variant="success">Saved</Badge>}
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
