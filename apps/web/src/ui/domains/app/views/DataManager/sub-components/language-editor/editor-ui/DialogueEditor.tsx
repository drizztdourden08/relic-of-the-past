/* @layer renderer-components @kind component */
/**
 * The dialogue editor: an ordinary writing surface that keeps itself valid for
 * the game.
 *
 * Typing wraps at the row's real width, rows number themselves, a full box
 * scrolls, and a wait is a property of a line rather than a thing to type --
 * all of that lives in the schema's plugins. What remains here is chrome, and
 * as little of it as possible: one icon toolbar, the surface, and a quiet
 * status line that names the caret's box and row the way a word processor
 * counts pages.
 *
 * The font is reachable by the node view at ITS render time rather than handed
 * over once at build time: the node view is built once per extension list and
 * the pack's font is read from disk asynchronously, so a value captured there
 * would stay null for good. Same story for the automation mode, which the
 * structure plugins read from the live runtime rather than a captured prop.
 */
import { useEffect, useMemo, useRef } from 'react';
import { EditorContent } from '@tiptap/react';
import { Box, Text } from '@ds/primitives';
import { EditorToolbar } from './EditorToolbar';
import { dialogueExtensions } from './editor-contract';
import { glyphNamesOf } from './glyph-names';
import { charAdvance } from './char-advance';
import { LineEndMarkers } from './line-end-markers';
import { withTokenNodeView } from './token-node-view';
import { useDialogueEditor } from './behavior/useDialogueEditor';
import { updateEditorRuntime } from '../editor/editor-runtime';
import type {
  DialogueLineView, GlossaryTerm, GlyphMetrics, GlyphSheet, SetStructure, Token, Variable,
} from '@shared/game/language';
import type { LanguageConfig } from '@shared/asset-extraction/text/data/language-data';
import type { GlyphFont } from './editor-ui.type';
import './DialogueEditor.css';

type DialogueEditorProps = {
  tokens: Token[];
  cfg: LanguageConfig;
  glossary: GlossaryTerm[];
  /** The whole substitution list, for the toolbar's insert popover. */
  variables: Variable[];
  /** The set's glyph widths; null while the font is still loading. */
  metrics: GlyphMetrics | null;
  /** The set's glyph tiles, which a picture character is drawn from. */
  sheet: GlyphSheet | null;
  structureMode: SetStructure;
  readOnly?: boolean;
  onChange: (tokens: Token[]) => void;
  onChangeStructureMode: (mode: SetStructure) => void;
};

/** Prompt shown while a line is empty. */
const PLACEHOLDER = 'Type the line\u2026';

/** Stands in until the set's font arrives; claims no widths. */
const EMPTY_METRICS: GlyphMetrics = { widths: new Uint8Array(0), alphabet: [] };

/** The caret's whereabouts, in the player's terms. */
const statusOf = (lines: DialogueLineView[], caretLine: number | null): { text: string; over: boolean } => {
  const line = caretLine === null ? undefined : lines[caretLine];
  if (line === undefined) {
    const boxes = lines.filter((l) => l.endsBox).length + (lines.length > 0 ? 1 : 0);
    return { text: `${boxes} ${boxes === 1 ? 'box' : 'boxes'}`, over: false };
  }
  const fit = line.freePx < 0 ? `over by ${-line.freePx}px` : `${line.freePx}px left`;
  return { text: `box ${line.box + 1} \u00b7 row ${line.row} \u00b7 ${fit}`, over: line.freePx < 0 };
};

const DialogueEditor = (props: DialogueEditorProps) => {
  const {
    tokens, cfg, glossary, variables, metrics, sheet, structureMode,
    readOnly = false, onChange, onChangeStructureMode,
  } = props;

  const glyphNames = useMemo(() => glyphNamesOf(cfg), [cfg]);
  const font = useMemo<GlyphFont>(() => ({ sheet, metrics }), [sheet, metrics]);
  const fontRef = useRef<GlyphFont>(font);
  fontRef.current = font;

  // The structure plugins read the mode live -- see editor-runtime.ts.
  useEffect(() => { updateEditorRuntime({ mode: structureMode }); }, [structureMode]);

  /*
   * The extension list is keyed on the glyph set's CONTENTS plus font
   * readiness, not on object identity: the editor survives glossary churn and
   * is rebuilt exactly once, when the pack's font lands -- atoms are portals
   * the editor owns, and that single step is what redraws the ones already on
   * screen.
   */
  const glyphKey = useMemo(() => [...glyphNames].join('\u0000'), [glyphNames]);
  const fontReady = sheet !== null && metrics !== null;
  const extensions = useMemo(
    () => [
      ...withTokenNodeView(dialogueExtensions({ placeholder: PLACEHOLDER }), glyphNames, fontRef),
      charAdvance(fontRef),
      LineEndMarkers,
    ],
    [glyphKey, fontReady],
  );

  const {
    editor, caretLine, insertTokens, lines,
    doUndo, doRedo, endBoxHere, canUndo, canRedo,
  } = useDialogueEditor({
    tokens, extensions, metrics: metrics ?? EMPTY_METRICS, glossary, readOnly, onChange,
  });

  const status = useMemo(() => statusOf(lines, caretLine), [lines, caretLine]);

  return (
    <Box className={`dialogue-editor${readOnly ? ' dialogue-editor--read-only' : ''}`}>
      <EditorToolbar
        cfg={cfg}
        variables={variables}
        font={font}
        settingsTokens={tokens}
        structureMode={structureMode}
        canUndo={canUndo}
        canRedo={canRedo}
        disabled={readOnly}
        onUndo={doUndo}
        onRedo={doRedo}
        onInsert={insertTokens}
        onEndBox={endBoxHere}
        onChangeSettings={onChange}
        onChangeStructureMode={onChangeStructureMode}
      />
      <Box className="dialogue-editor__body">
        <EditorContent className="dialogue-editor__surface game-text" editor={editor} />
      </Box>
      <Box className="dialogue-editor__status">
        <Text as="span" className={status.over ? 'dialogue-editor__status--over' : undefined}>
          {status.text}
        </Text>
      </Box>
    </Box>
  );
};

export { DialogueEditor };
export type { DialogueEditorProps };
