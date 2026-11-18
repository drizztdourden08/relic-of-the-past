/* @layer renderer-components @kind component */
import { useEffect, useMemo, useRef } from 'react';
import { EditorContent } from '@tiptap/react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { EditorToolbar } from './EditorToolbar';
import { dialogueExtensions } from './editor-contract';
import { glyphNamesOf } from './glyph-names';
import { charAdvance } from './char-advance';
import { langOfConfig } from './lang-of-config';
import { lineEndMarkersFor } from './line-end-markers';
import { useT } from '@drizztdourden08/brock-react';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { withTokenNodeView } from './with-token-node-view';
import { useDialogueEditor } from './behavior/useDialogueEditor';
import { updateEditorRuntime } from '../editor/editor-runtime';
import type { DialogueLineView } from '@rotp/languages';
import type { GlyphFont } from './editor-ui.type';
import { EMPTY_METRICS } from './DialogueEditor.constants';
import type { DialogueEditorProps } from './DialogueEditor.type';
import './DialogueEditor.css';

const statusOf = (t: I18n['t'], lines: DialogueLineView[], caretLine: number | null): { text: string; over: boolean } => {
  const line = caretLine === null ? undefined : lines[caretLine];
  if (line === undefined) {
    const boxes = lines.filter((l) => l.endsBox).length + (lines.length > 0 ? 1 : 0);
    return { text: t('language-editor:editor.status.boxes', { count: boxes }), over: false };
  }
  const values = { box: line.box + 1, row: line.row, px: Math.abs(line.freePx) };
  return line.freePx < 0
    ? { text: t('language-editor:editor.status.over', values), over: true }
    : { text: t('language-editor:editor.status.left', values), over: false };
};

const DialogueEditor = (props: DialogueEditorProps) => {
  const {
    tokens, cfg, glossary, variables, metrics, sheet, structureMode,
    readOnly = false, onChange, onChangeStructureMode,
  } = props;

  const t = useT();
  const glyphNames = useMemo(() => glyphNamesOf(cfg), [cfg]);
  const font = useMemo<GlyphFont>(() => ({ sheet, metrics }), [sheet, metrics]);
  const fontRef = useRef<GlyphFont>(font);
  fontRef.current = font;

  useEffect(() => { updateEditorRuntime({ mode: structureMode }); }, [structureMode]);

  const glyphKey = useMemo(() => [...glyphNames].join('\u0000'), [glyphNames]);
  const fontReady = sheet !== null && metrics !== null;
  const extensions = useMemo(
    () => [
      ...withTokenNodeView(dialogueExtensions({ placeholder: t('language-editor:editor.placeholder') }), glyphNames, fontRef),
      charAdvance(fontRef),
      lineEndMarkersFor(t),
    ],
    [glyphKey, fontReady, t],
  );

  const {
    editor, caretLine, insertTokens, lines,
    doUndo, doRedo, endBoxHere, canUndo, canRedo,
  } = useDialogueEditor({
    tokens, extensions, metrics: metrics ?? EMPTY_METRICS, glossary, readOnly, onChange,
  });

  const status = useMemo(() => statusOf(t, lines, caretLine), [t, lines, caretLine]);

  return (
    <Box lang={langOfConfig(cfg)} className={`dialogue-editor${readOnly ? ' dialogue-editor--read-only' : ''}`}>
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
