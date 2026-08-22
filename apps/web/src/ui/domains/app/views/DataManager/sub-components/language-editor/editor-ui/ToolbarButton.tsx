/* @layer renderer-components @kind component */
/**
 * One toolbar button. Either it inserts on the spot, or it opens a short value
 * list first — which of the two is decided upstream by whether the language's
 * encoder needs a value for that code, never here.
 *
 * The tooltip carries the plain-language name AND what the thing does, because
 * an icon row is only readable if hovering explains it.
 *
 * A picture character shows the character itself in the game face instead of a
 * symbol, so the button previews what will land in the line.
 *
 * The value list closes on Escape and on a press outside this button. Escape is
 * handled on the wrapper rather than inside the list because the list holds no
 * focus — the toolbar keeps focus in the text at all times — so the key arrives
 * from the button and bubbles here.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box, IconButton, Text, Tooltip } from '@ds/primitives';
import { GlyphChar } from './GlyphChar';
import { ParamPicker } from './ParamPicker';
import { useDismissOnOutside } from './behavior/useDismissOnOutside';
import type { KeyboardEvent } from 'react';
import type { Token } from '@shared/game/language';
import type { GlyphFont, ToolbarItem } from './editor-ui.type';
import './ToolbarButton.css';

/** `[Up]` as stored in the item, `Up` as GlyphChar wants it. */
const bareGlyphName = (glyph: string | undefined): string => (glyph ?? '').replace(/^\[|\]$/g, '');

type ToolbarButtonProps = {
  item: ToolbarItem;
  disabled?: boolean;
  /** The pack's font, for a button that draws a picture character. */
  font: GlyphFont;
  onInsert: (token: Token) => void;
};

const ICON_PX = 14;

const ToolbarButton = (props: ToolbarButtonProps) => {
  const { item, disabled = false, font, onInsert } = props;
  const rootRef = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);

  const handleDismiss = useCallback(() => setOpen(false), []);
  useDismissOnOutside(rootRef, open, handleDismiss);

  const handleClick = useCallback(() => {
    if (item.needsChoice) {
      setOpen((current) => !current);
      return;
    }
    onInsert(item.make(null));
  }, [item, onInsert]);

  const handlePick = useCallback((value: string) => {
    setOpen(false);
    onInsert(item.make(value));
  }, [item, onInsert]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    setOpen(false);
  }, []);

  const tip = useMemo(() => (
    <Text as="span" className="toolbar-button__tip">
      <Text as="strong" className="toolbar-button__tip-name">{item.label}</Text>
      {`: ${item.description}`}
    </Text>
  ), [item.label, item.description]);

  return (
    <Box ref={rootRef} className="toolbar-button" onKeyDown={handleKeyDown}>
      <Tooltip content={tip} placement="bottom">
        <IconButton
          variant="ghost"
          size="sm"
          active={open}
          label={item.label}
          disabled={disabled}
          aria-haspopup={item.needsChoice ? 'menu' : undefined}
          aria-expanded={item.needsChoice ? open : undefined}
          onClick={handleClick}
        >
          {item.icon ? (
            <IconifyIcon icon={item.icon} width={ICON_PX} height={ICON_PX} />
          ) : (
            <GlyphChar
              name={bareGlyphName(item.glyph)}
              sheet={font.sheet}
              metrics={font.metrics}
            />
          )}
          {item.badge ? (
            <Text as="span" className="toolbar-button__badge">{item.badge}</Text>
          ) : null}
        </IconButton>
      </Tooltip>

      {open ? (
        <ParamPicker title={item.label} choices={item.choices} onPick={handlePick} />
      ) : null}
    </Box>
  );
};

export { ToolbarButton };
export type { ToolbarButtonProps };
