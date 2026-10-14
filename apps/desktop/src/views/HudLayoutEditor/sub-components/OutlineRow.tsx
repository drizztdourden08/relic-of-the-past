/* @layer renderer-components @kind component */
import { Box, Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import { outlineRowClasses } from '@app/hud-layout-editing/outline-row-classes';
import { OutlineName } from './OutlineName';
import { CARET_ICON, DROP_CLASS } from './OutlineRow.constants';
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

  const classes = outlineRowClasses({
    selected, dragging, dropClass: dropZone ? DROP_CLASS[dropZone] : '', locked, isScreen, shaking,
  });

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
          <Icon className="hud-outline__caret-mark" path={CARET_ICON} size={12} aria-hidden />
        </IconButton>
      ) : (
        <Box className="hud-outline__caret-spacer" aria-hidden />
      )}
      <OutlineName kind={kind} label={label} cell={cell} locked={locked} missingSlots={missingSlots} selected={selected} onSelect={onSelect} />
      {!locked && !isScreen && <IconButton variant="ghost" size="sm" label={`Remove ${label}`} onClick={onRemove}>✕</IconButton>}
    </Box>
  );
};

export { OutlineRow };
export type { OutlineRowProps } from './OutlineRow.type';
