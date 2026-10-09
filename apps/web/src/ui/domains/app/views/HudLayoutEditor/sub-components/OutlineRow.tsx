/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Icon } from '@ds/primitives/Icon';
import { IconButton } from '@ds/primitives/IconButton';
import { Text } from '@ds/primitives/Text';
import { CARET_PATH, DROP_CLASS } from './OutlineRow.constants';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { OutlineRowProps } from './OutlineRow.type';

const isMenuKey = (event: ReactKeyboardEvent): boolean =>
  event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey);

const OutlineRow = (props: OutlineRowProps) => {
  const {
    id, label, depth, kind, cell, locked, isScreen, hasChildren, collapsed, selected, dragging,
    dropZone, missingSlots, rowRef, onSelect, onToggleCollapse, onRemove, onDragPointerDown,
    springing, shaking, onRowKeyDown, onOpenMenu,
  } = props;

  const classes = [
    'hud-outline__row',
    selected ? 'is-selected' : '',
    dragging ? 'is-dragging' : '',
    dropZone ? DROP_CLASS[dropZone] : '',
    locked ? 'is-locked' : '',
    isScreen ? 'is-screen' : '',
    shaking ? 'is-shaking' : '',
  ].filter(Boolean).join(' ');

  const caret = [
    'hud-outline__caret',
    collapsed ? '' : 'is-open',
    springing ? 'is-springing' : '',
  ].filter(Boolean).join(' ');

  return (
    <Box
      ref={rowRef}
      className={classes}
      style={{ paddingLeft: `calc(var(--space-xs) + ${depth} * var(--space-md))` }}
      data-outline-row={id}
      data-outline-locked={locked ? '' : undefined}
      onPointerDown={onDragPointerDown}
      onKeyDown={(event) => {
        if (onOpenMenu && isMenuKey(event)) { event.preventDefault(); onOpenMenu(); return; }
        onRowKeyDown?.(event);
      }}
      onContextMenu={onOpenMenu ? (event) => { event.preventDefault(); onOpenMenu(); } : undefined}
    >
      {hasChildren ? (
        <IconButton
          variant="ghost"
          size="sm"
          className={caret}
          label={collapsed ? `Expand ${label}` : `Collapse ${label}`}
          onClick={(event) => { event.stopPropagation(); onToggleCollapse(); }}
        >
          <Icon className="hud-outline__caret-mark" paths={[CARET_PATH]} size={12} aria-hidden />
        </IconButton>
      ) : (
        <Box className="hud-outline__caret-spacer" aria-hidden />
      )}
      <Button variant="bare" className="hud-outline__name" aria-pressed={selected} onClick={onSelect}>
        <Text className="hud-outline__glyph" aria-hidden>{kind === 'container' ? '▤' : '◦'}</Text>
        <Text className="hud-outline__text">{label}</Text>
        {cell && <Text className="hud-outline__badge">{cell}</Text>}
        {locked && <Text className="hud-outline__badge" title="Edit this from the case list or the repeat's Content section.">{locked}</Text>}
        {missingSlots.length > 0 && (
          <Text className="hud-outline__note" title="Out of range for the scheme you are previewing. It still draws, just empty.">
            slot {missingSlots.join(', ')} out of range
          </Text>
        )}
      </Button>
      {!locked && !isScreen && <IconButton variant="ghost" size="sm" label={`Remove ${label}`} onClick={onRemove}>✕</IconButton>}
    </Box>
  );
};

export { OutlineRow };
export type { OutlineRowProps } from './OutlineRow.type';
