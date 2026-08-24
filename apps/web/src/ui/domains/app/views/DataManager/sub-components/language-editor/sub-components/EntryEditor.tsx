/* @layer renderer-components @kind component */
/**
 * Edit mode for one dialogue entry: the editor itself, the message-wide
 * settings, and the commit pair.
 *
 * Per-line width lives in the editor's own gutter, beside the line it measures,
 * and the entry's identity lives in the panel around this, so neither is
 * repeated here.
 *
 * Saving is refused while a row is too long. The engine keeps writing past the
 * edge of the box instead of wrapping, painting over the line below, so an
 * overlong row is a defect that cannot be seen until someone plays that scene —
 * which is exactly the kind of thing an editor should not let out.
 *
 * Message-wide settings and the insert pickers live in the editor's own
 * toolbar now; this wrapper carries only the commit pair and the save gate.
 */
import { Box, Text, Button } from '@ds/primitives';
import { DialogueEditor } from '../editor-ui';
import { overflowReason } from './overflow-reason';
import type { GlossaryTerm, SetStructure, Token, Variable } from '@shared/game/language';
import type { LanguageConfig } from '@shared/asset-extraction/text/data/language-data';
import type { GlyphMetrics, GlyphSheet, RowFit } from '@shared/game/language/layout/types';
import './EntryEditor.css';

type EntryEditorProps = {
  /** The DRAFT tokens — the parent holds the committed entry. */
  tokens: Token[];
  rows: RowFit[];
  cfg: LanguageConfig;
  /** Every variable carrying literal text, so a reference can be measured. */
  glossary: GlossaryTerm[];
  /** The whole substitution list, for the insert picker. */
  variables: Variable[];
  /** The set's glyph widths; null while the font loads. */
  metrics: GlyphMetrics | null;
  /** The set's glyph tiles, which a picture character is drawn from. */
  sheet: GlyphSheet | null;
  structureMode: SetStructure;
  dirty: boolean;
  onChangeTokens: (tokens: Token[]) => void;
  onChangeStructureMode: (mode: SetStructure) => void;
  onSave: () => void;
  onCancel: () => void;
};

const EntryEditor = (props: EntryEditorProps) => {
  const {
    tokens, rows, cfg, glossary, variables, metrics, sheet, structureMode, dirty,
    onChangeTokens, onSave, onCancel, onChangeStructureMode,
  } = props;

  const blocked = overflowReason(rows);

  return (
    <Box className="entry-editor">
      <DialogueEditor
        tokens={tokens}
        cfg={cfg}
        glossary={glossary}
        variables={variables}
        metrics={metrics}
        sheet={sheet}
        structureMode={structureMode}
        onChange={onChangeTokens}
        onChangeStructureMode={onChangeStructureMode}
      />

      {blocked && (
        <Text className="entry-editor__blocked" variant="caption" role="status">{blocked}</Text>
      )}

      <Box className="entry-editor__actions">
        <Button size="sm" disabled={Boolean(blocked) || !dirty} onClick={onSave}>Save</Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
      </Box>
    </Box>
  );
};

export { EntryEditor };
export type { EntryEditorProps };
