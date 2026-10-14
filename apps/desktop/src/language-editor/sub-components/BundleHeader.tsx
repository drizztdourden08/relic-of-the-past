/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box, Text, Status } from '@drizztdourden08/tessera/primitives';
import { LANGUAGE_NAMES } from '../../views/DataManager/sub-components/language-names.constants';
import { BundleActions } from './BundleActions';
import type { BundleHeaderProps } from './BundleHeader.type';
import { SaveStatusBadge } from './SaveStatusBadge';
import './BundleHeader.css';

const baseLabel = (base: string): string => LANGUAGE_NAMES[base] ?? base;

const BundleHeader = (props: BundleHeaderProps) => {
  const { set, warnings, dirty, saving, saveError, readOnly = false, exporting = false, ...actions } = props;

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
        <SaveStatusBadge saveError={saveError} readOnly={readOnly} saving={saving} dirty={dirty} />
        <BundleActions dirty={dirty} saving={saving} readOnly={readOnly} exporting={exporting} {...actions} />
      </Box>
    </Box>
  );
};

export { BundleHeader };
