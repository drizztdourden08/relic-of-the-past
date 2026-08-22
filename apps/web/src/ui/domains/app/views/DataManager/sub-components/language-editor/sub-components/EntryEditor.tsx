/* @layer renderer-components @kind component */
/**
 * Edit mode for one dialogue line: the editor itself and the message-wide
 * settings. Per-line width now lives in the editor's own gutter, beside the
 * line it measures, so it is not repeated here.
 *
 * Saving is refused while a row is too long. The engine keeps writing past the
 * edge of the box instead of wrapping, painting over the line below, so an
 * overlong row is a defect that cannot be seen until someone plays that scene —
 * which is exactly the kind of thing an editor should not let out.
 */
import { useCallback } from 'react';
import { Box, Text, Button } from '@ds/primitives';
import { DialogueEditor } from '../editor-ui';
import { MessageSettingsStrip } from './MessageSettingsStrip';
import { overflowReason } from './overflow-reason';
import type { GlossaryTerm, Token } from '@shared/game/language';
import type { LanguageConfig } from '@shared/asset-extraction/text/data/language-data';
import type { GlyphMetrics, GlyphSheet, RowFit } from '@shared/game/language/layout/types';
import './EntryEditor.css';

type EntryEditorProps = {
  id: number;
  /** The DRAFT tokens — the parent holds the committed entry. */
  tokens: Token[];
  rows: RowFit[];
  cfg: LanguageConfig;
  glossary: GlossaryTerm[];
  /** The set's glyph widths; null while the font loads. */
  metrics: GlyphMetrics | null;
  /** The set's glyph tiles, which a picture character is drawn from. */
  sheet: GlyphSheet | null;
  dirty: boolean;
  onChangeTokens: (tokens: Token[]) => void;
  onSave: () => void;
  onCancel: () => void;
};

const EntryEditor = (props: EntryEditorProps) => {
  const {
    id, tokens, rows, cfg, glossary, metrics, sheet, dirty,
    onChangeTokens, onSave, onCancel,
  } = props;

  const blocked = overflowReason(rows);

  const handleSettings = useCallback((next: Token[]) => {
    onChangeTokens(next);
  }, [onChangeTokens]);

  return (
    <Box className="entry-editor">
      <Box className="entry-editor__head">
        <Text className="entry-editor__id" variant="caption">
          {`#${String(id).padStart(3, '0')}`}
        </Text>
        <Text variant="label">Editing</Text>
        <Box className="entry-editor__actions">
          <Button size="sm" disabled={Boolean(blocked) || !dirty} onClick={onSave}>Save</Button>
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        </Box>
      </Box>

      <DialogueEditor
        tokens={tokens}
        cfg={cfg}
        glossary={glossary}
        metrics={metrics}
        sheet={sheet}
        onChange={onChangeTokens}
      />

      {blocked && (
        <Text className="entry-editor__blocked" variant="caption" role="status">{blocked}</Text>
      )}

      <MessageSettingsStrip tokens={tokens} cfg={cfg} onChangeTokens={handleSettings} />
    </Box>
  );
};

export { EntryEditor };
export type { EntryEditorProps };
