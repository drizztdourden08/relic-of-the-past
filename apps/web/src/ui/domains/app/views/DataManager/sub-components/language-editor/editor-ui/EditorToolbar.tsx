/* @layer renderer-components @kind component */
/**
 * The editor's single toolbar row: history, the four inserts, the box break and
 * the message settings, as small icon buttons with instant tooltips.
 *
 * Every button is the same size and carries no text, and thin rules separate the
 * four groups, so the row stays one line at any pane width and reads as a tool
 * strip rather than a form.
 *
 * At most ONE card is open at a time and the ROW owns that state, so opening a
 * second closes the first. Escape anywhere in the row closes it, as does a press
 * outside the row — which is the honest test here, since the buttons swallow
 * mousedown to keep the caret alive in the text and so never take focus at all.
 *
 * Each card does ONE thing, and the two of them holding a field or a picker
 * manage their own focus; the rest keep the caret where the insert is aimed.
 *
 * Ending the box is an action rather than a card: there is nothing to choose,
 * and the wait lands at the end of the caret's line because that is where a box
 * can actually end.
 */
import { useCallback, useRef, useState } from 'react';
import listEndIcon from '@iconify-icons/lucide/list-end';
import redoIcon from '@iconify-icons/lucide/redo-2';
import settingsIcon from '@iconify-icons/lucide/sliders-horizontal';
import undoIcon from '@iconify-icons/lucide/undo-2';
import { Box, Divider } from '@ds/primitives';
import { ToolbarButton } from './ToolbarButton';
import { ToolbarInserts } from './ToolbarInserts';
import { hasOpenDropdown, SettingsPopover } from './popovers';
import { useDismissOnOutside } from './behavior/useDismissOnOutside';
import type { KeyboardEvent } from 'react';
import type { StructureMode, Token, Variable } from '@shared/game/language';
import type { LanguageConfig } from '@shared/asset-extraction/text/data/language-data';
import type { GlyphFont } from './editor-ui.type';
import './EditorToolbar.css';

type EditorToolbarProps = {
  cfg: LanguageConfig;
  /** The whole substitution list, engine-owned entries included. */
  variables: Variable[];
  /** The pack's font, for drawing real characters in the glyph card. */
  font: GlyphFont;
  /** The entry's tokens, which the message settings are read out of. */
  settingsTokens: Token[];
  structureMode: StructureMode;
  canUndo: boolean;
  canRedo: boolean;
  disabled?: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onInsert: (tokens: Token[]) => void;
  /** End the box at the caret's line — an action, with nothing to choose. */
  onEndBox: () => void;
  onChangeSettings: (next: Token[]) => void;
  onChangeStructureMode: (mode: StructureMode) => void;
};

const UNDO = 'undo';
const REDO = 'redo';
const END_BOX = 'end-box';
const SETTINGS = 'settings';

const SETTINGS_LABEL = 'Message settings';

const EditorToolbar = (props: EditorToolbarProps) => {
  const {
    cfg, variables, font, settingsTokens, structureMode, canUndo, canRedo, disabled = false,
    onUndo, onRedo, onInsert, onEndBox, onChangeSettings, onChangeStructureMode,
  } = props;

  const rootRef = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  /**
   * A press outside closes the card — unless a select's own list is open, which
   * is drawn in a portal and so lies outside this row while still belonging to
   * the card (see `hasOpenDropdown`).
   */
  const handleDismiss = useCallback(() => {
    if (hasOpenDropdown()) return;
    setOpen(null);
  }, []);
  useDismissOnOutside(rootRef, open !== null, handleDismiss);

  /**
   * One handler for the whole row. The three actions are named; everything else
   * is a card, and a press on the button that opened it closes it again.
   */
  const handlePress = useCallback((id: string) => {
    if (id === UNDO) return onUndo();
    if (id === REDO) return onRedo();
    if (id === END_BOX) return onEndBox();
    return setOpen((current) => (current === id ? null : id));
  }, [onUndo, onRedo, onEndBox]);

  /** Every card closes on the insert it exists to make. */
  const handleInsert = useCallback((tokens: Token[]) => {
    setOpen(null);
    onInsert(tokens);
  }, [onInsert]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    setOpen(null);
  }, []);

  return (
    <Box
      ref={rootRef}
      className="editor-toolbar"
      role="toolbar"
      aria-label="Editing actions"
      onKeyDown={handleKeyDown}
    >
      <ToolbarButton
        id={UNDO}
        icon={undoIcon}
        label="Undo"
        disabled={disabled || !canUndo}
        onPress={handlePress}
      />
      <ToolbarButton
        id={REDO}
        icon={redoIcon}
        label="Redo"
        disabled={disabled || !canRedo}
        onPress={handlePress}
      />

      <Divider orientation="vertical" className="editor-toolbar__split" />

      <ToolbarInserts
        cfg={cfg}
        variables={variables}
        font={font}
        disabled={disabled}
        open={open}
        onPress={handlePress}
        onInsert={handleInsert}
      />

      <Divider orientation="vertical" className="editor-toolbar__split" />

      <ToolbarButton
        id={END_BOX}
        icon={listEndIcon}
        label="End the box here"
        disabled={disabled}
        onPress={handlePress}
      />

      <Divider orientation="vertical" className="editor-toolbar__split" />

      <ToolbarButton
        id={SETTINGS}
        icon={settingsIcon}
        label={SETTINGS_LABEL}
        disabled={disabled}
        open={open === SETTINGS}
        popover={(
          <SettingsPopover
            label={SETTINGS_LABEL}
            cfg={cfg}
            tokens={settingsTokens}
            structureMode={structureMode}
            onChangeSettings={onChangeSettings}
            onChangeStructureMode={onChangeStructureMode}
          />
        )}
        onPress={handlePress}
      />
    </Box>
  );
};

export { EditorToolbar };
export type { EditorToolbarProps };
