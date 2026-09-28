/* @layer renderer-components @kind component */
﻿import { useState, useRef, useCallback, type DragEvent, type KeyboardEvent } from 'react';
import './DropZone.css';
import { Icon } from '../Icon';
import { type DropZoneProps } from './DropZone.type';
import { BOX_ICON_PATHS, ICON_SIZE, ICON_VIEWBOX, OUTLINE } from './DropZone.constants';
import { acceptsFile, acceptsType } from './behavior/accepts-file';
import { useClipboardButton } from './behavior/useClipboardButton';
import { usePasteFiles } from './behavior/usePasteFiles';
import { PasteButton } from './sub-components/PasteButton';

const BOX_ICON = <Icon paths={BOX_ICON_PATHS} viewBox={ICON_VIEWBOX} size={ICON_SIZE} {...OUTLINE} />;


const DropZone = (props: DropZoneProps) => {
  const {
    accept,
    label = 'Drop files here',
    hint,
    disabled = false,
    variant = 'block',
    icon,
    status,
    onDrop,
  } = props;
  const [active, setActive] = useState(false);
  const dragCounter = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setActive(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setActive(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const filterFiles = useCallback((files: File[]): File[] => {
    if (!accept || accept.length === 0) return files;
    return files.filter((f) => accept.some((pattern) => acceptsFile(f, pattern)));
  }, [accept]);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setActive(false);
    const files = filterFiles(Array.from(e.dataTransfer.files));
    if (files.length > 0) onDrop(files);
  }, [filterFiles, onDrop]);

  const deliver = useCallback((picked: File[]) => {
    const files = filterFiles(picked);
    if (files.length > 0) onDrop(files);
  }, [filterFiles, onDrop]);
  const paste = usePasteFiles(deliver, !disabled);
  const takesType = useCallback((type: string) => (accept ?? []).some((pattern) => acceptsType(type, pattern)), [accept]);
  const clipboard = useClipboardButton(paste.hovered && !disabled, takesType, deliver);

  const handleClick = () => inputRef.current?.click();

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = filterFiles(Array.from(e.target.files ?? []));
    if (files.length > 0) onDrop(files);
    // Reset so the same file can be re-selected
    e.target.value = '';
  }, [filterFiles, onDrop]);

  // Android's WebView drops accept extensions with no registered MIME (e.g. .sfc),
  // so include application/octet-stream to keep those files selectable. filterFiles
  // still enforces the accept extensions after the pick.
  const inputAccept = accept?.length ? [...accept, 'application/octet-stream'].join(',') : undefined;

  const inline = variant === 'inline';

  // The inline target reads as a button, so the keyboard opens the picker too.
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    handleClick();
  };

  const cls = [
    'dropzone',
    inline && 'dropzone--inline',
    active && 'dropzone--active',
    disabled && 'dropzone--disabled',
    status?.tone === 'success' && 'dropzone--success',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cls}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      onPointerEnter={paste.onPointerEnter}
      onPointerLeave={paste.onPointerLeave}
      {...(inline ? { role: 'button', tabIndex: disabled ? -1 : 0, title: hint, onKeyDown: handleKeyDown } : {})}
    >
      {!inline && !disabled && <PasteButton state={clipboard.state} onPaste={clipboard.paste} />}
      <span className="dropzone__icon" aria-hidden={inline || undefined}>{icon ?? BOX_ICON}</span>
      <span className="dropzone__label">{label}</span>
      {!inline && hint && <span className="dropzone__hint">{hint}</span>}
      {!inline && <span className="dropzone__hint dropzone__hint--soft">or click to browse, or hover here and press Ctrl+V</span>}
      {!inline && status && <span className={`dropzone__status dropzone__status--${status.tone}`} role="status">{status.message}</span>}
      <input
        ref={inputRef}
        type="file"
        accept={inputAccept}
        style={{ display: 'none' }}
        onChange={handleFileInput}
      />
    </div>
  );
};

export {
  DropZone,
};
