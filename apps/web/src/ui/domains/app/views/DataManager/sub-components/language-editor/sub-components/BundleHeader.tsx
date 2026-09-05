/* @layer renderer-components @kind component */
/**
 * Identity card for the language set being edited: what it is called, what it
 * was made from, how big it is, and whether the last edit reached disk.
 *
 * A translator can have several sets open over a session, one from a ROM and a
 * duplicate they are reworking, so the set's name and origin stay on screen
 * instead of being implied by whatever is highlighted in the list.
 */
import { useMemo } from 'react';
import { Box, Text, Badge, Button } from '@ds/primitives';
import { LANGUAGE_NAMES } from '../../language-names';
import type { LanguageSet } from '@shared/game/language';
import './BundleHeader.css';

type BundleHeaderProps = {
  set: LanguageSet;
  /** Entries carrying a validation issue, across the whole set. */
  warnings: number;
  dirty: boolean;
  saving: boolean;
  saveError: string | null;
  onDuplicate?: () => void;
  onSaveNow?: () => void;
};

/** The base language in words, falling back to its bare code. */
const baseLabel = (base: string): string => LANGUAGE_NAMES[base] ?? base;

const BundleHeader = (props: BundleHeaderProps) => {
  const { set, warnings, dirty, saving, saveError, onDuplicate, onSaveNow } = props;

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
        {!saveError && saving && <Badge variant="neutral">Saving...</Badge>}
        {!saveError && !saving && dirty && <Badge variant="warning">Not saved yet</Badge>}
        {!saveError && !saving && !dirty && <Badge variant="success">Saved</Badge>}
        {onSaveNow && (
          <Button variant="ghost" size="sm" disabled={!dirty || saving} onClick={onSaveNow}>Save now</Button>
        )}
        {onDuplicate && <Button variant="ghost" size="sm" onClick={onDuplicate}>Duplicate</Button>}
      </Box>
    </Box>
  );
};

export { BundleHeader };
export type { BundleHeaderProps };
