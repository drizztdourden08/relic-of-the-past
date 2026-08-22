/* @layer renderer-components @kind component */
/**
 * The dialogue line editor: an ordinary editable text area you type in, with a
 * row of insert buttons above it and a legend that appears below while it has
 * focus.
 *
 * Deliberately plain. There is no bold, no italic, no list — the game draws one
 * face at one size, so those would be lies. What IS special is the things that
 * are not letters: a control code, a substitution, a glossary reference or one of
 * the alphabet's picture characters. Each of those is one indivisible object in
 * the text, inserted from the toolbar at the caret and removed with a single
 * Backspace, which is the whole reason for an editor here rather than a plain
 * input: a bracket run cannot be half-typed into existence.
 *
 * The text is drawn in the game's own face so a line reads in the shape it will
 * take on screen.
 *
 * Everything the toolbar offers comes from the control-code catalog and the
 * language's own alphabet — no list of codes lives in this folder.
 */
import { useMemo, useRef } from 'react';
import { EditorContent } from '@tiptap/react';
import { Box } from '@ds/primitives';
import { EditorBottomBar } from './EditorBottomBar';
import { EditorLegend } from './EditorLegend';
import { EditorToolbar } from './EditorToolbar';
import { LineGutter } from './LineGutter';
import { dialogueExtensions } from './editor-contract';
import { glyphNamesFrom } from './glyph-names';
import { legendEntriesFor } from './legend.model';
import { buildToolbarGroups } from './toolbar.model';
import { charAdvance } from './char-advance';
import { LineEndMarkers } from './line-end-markers';
import { withTokenNodeView } from './token-node-view';
import { useDialogueEditor } from './behavior/useDialogueEditor';
import type { GlossaryTerm, GlyphMetrics, GlyphSheet, Token } from '@shared/game/language';
import type { LanguageConfig } from '@shared/asset-extraction/text/data/language-data';
import type { GlyphFont } from './editor-ui.type';
import './DialogueEditor.css';

type DialogueEditorProps = {
  tokens: Token[];
  cfg: LanguageConfig;
  glossary: GlossaryTerm[];
  /** The set's glyph widths; null while the font is still loading. */
  metrics: GlyphMetrics | null;
  /** The set's glyph tiles, which a picture character is drawn from. */
  sheet: GlyphSheet | null;
  readOnly?: boolean;
  onChange: (tokens: Token[]) => void;
  /** Optional bottom-bar actions. Absent = that button is not drawn. */
  onClear?: () => void;
  onSave?: () => void;
};

/** Prompt shown while a line is empty. */
const PLACEHOLDER = 'Type the line…';

/*
 * Stands in until the set's font arrives. Widths are unknown, so the gutter is
 * told not to claim any (`pixelsKnown`) rather than quietly reporting zeroes,
 * which would read as "plenty of room left".
 */
const EMPTY_METRICS: GlyphMetrics = { widths: new Uint8Array(0), alphabet: [] };

const DialogueEditor = (props: DialogueEditorProps) => {
  const {
    tokens, cfg, glossary, metrics, sheet, readOnly = false, onChange, onClear, onSave,
  } = props;

  const groups = useMemo(() => buildToolbarGroups(cfg, glossary), [cfg, glossary]);
  const glyphNames = useMemo(() => glyphNamesFrom(groups), [groups]);

  /*
   * The font, reachable by the node view at ITS render time rather than handed
   * over once at build time. The node view is built one per extension list and
   * the pack's own font is read from disk asynchronously, so a value captured
   * there would be the null it was at that moment, for good.
   */
  const font = useMemo<GlyphFont>(() => ({ sheet, metrics }), [sheet, metrics]);
  const fontRef = useRef<GlyphFont>(font);
  fontRef.current = font;

  /*
   * The extension list is keyed on the glyph set's CONTENTS, not on the set's
   * identity. Rebuilding it replaces the editor instance and everything in it,
   * and the set is rederived whenever the glossary array changes identity — which
   * a parent holding it in state does on every edit. Keying on contents means the
   * editor survives glossary churn and is only rebuilt when the language itself
   * changes, which is the only thing the schema actually depends on.
   *
   * READINESS is the other half of the key, and the only reason the font enters
   * it at all. An atom already on screen does not re-render when the handle
   * behind it changes — it is a portal the editor owns, not a child of this
   * component — so the single step from "no font" to "font" has to replace it.
   * That step happens once per set and never again on a later re-read of the
   * same font, so it cannot churn the editor under someone's caret.
   */
  const glyphKey = useMemo(() => [...glyphNames].join('\u0000'), [glyphNames]);
  const fontReady = sheet !== null && metrics !== null;
  /*
   * Two presentation extensions ride along with the document schema, and both are
   * DECORATIONS rather than content: `charAdvance` bills every character its real
   * advance, so the row's ruler and the gutter's figure describe one line, and
   * `LineEndMarkers` draws the wait and the row advance as the card's own symbols
   * at a line's edge. Neither puts anything into the entry that gets saved.
   */
  const extensions = useMemo(
    () => [
      ...withTokenNodeView(dialogueExtensions({ placeholder: PLACEHOLDER }), glyphNames, fontRef),
      charAdvance(fontRef),
      LineEndMarkers,
    ],
    [glyphKey, fontReady],
  );

  const { editor, focused, insertToken, lines } = useDialogueEditor({
    tokens, extensions, metrics: metrics ?? EMPTY_METRICS, glossary, readOnly, onChange,
  });

  const legend = useMemo(() => legendEntriesFor(tokens, glyphNames), [tokens, glyphNames]);

  return (
    <Box className={`dialogue-editor${readOnly ? ' dialogue-editor--read-only' : ''}`}>
      <EditorToolbar groups={groups} disabled={readOnly} font={font} onInsert={insertToken} />
      <Box className="dialogue-editor__body">
        <LineGutter lines={lines} pixelsKnown={metrics !== null} />
        <EditorContent className="dialogue-editor__surface game-text" editor={editor} />
      </Box>
      <EditorBottomBar onClear={onClear} onSave={onSave} disabled={readOnly} />
      <EditorLegend entries={legend} open={focused && !readOnly} font={font} />
    </Box>
  );
};

export { DialogueEditor };
export type { DialogueEditorProps };
